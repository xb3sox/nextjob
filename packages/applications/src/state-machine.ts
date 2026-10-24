// probe: v3 recall
/**
 * Application state machine (T-25).
 *
 * Implements FR-ASM-01..04: the pipeline, outcome and exception states, atomic
 * auditable transitions, and the FR-08/FEC-03 rule that an ambiguous external
 * submission is never retried automatically.
 */

export const PIPELINE_STATES = [
  'DISCOVERED',
  'NORMALIZED',
  'ELIGIBILITY_CHECKED',
  'MATCHED',
  'PLANNED',
  'TAILORED',
  'POLICY_CHECKED',
  'NEEDS_APPROVAL',
  'READY',
  'EXECUTING',
  'SUBMITTED_UNVERIFIED',
  'SUBMITTED_VERIFIED',
] as const;

export const OUTCOME_STATES = ['INTERVIEW', 'REJECTED', 'OFFER', 'WITHDRAWN', 'HIRED'] as const;

export const EXCEPTION_STATES = [
  'BLOCKED',
  'NEEDS_USER',
  'FAILED_RETRYABLE',
  'NEEDS_RECONCILIATION',
  'FAILED_FINAL',
  'CANCELLED',
] as const;

export type PipelineState = (typeof PIPELINE_STATES)[number];
export type OutcomeState = (typeof OUTCOME_STATES)[number];
export type ExceptionState = (typeof EXCEPTION_STATES)[number];
export type ApplicationState = PipelineState | OutcomeState | ExceptionState;

/** States from which no further transition is allowed. */
export const MAX_RETRIES = 3;

export const TERMINAL_STATES: readonly ApplicationState[] = [
  'HIRED',
  'WITHDRAWN',
  'REJECTED',
  'FAILED_FINAL',
  'CANCELLED',
];

/** Allowed transitions. Any pair not listed here is invalid. */
export const TRANSITIONS: Readonly<Record<ApplicationState, readonly ApplicationState[]>> = {
  DISCOVERED: ['NORMALIZED', 'BLOCKED', 'CANCELLED'],
  NORMALIZED: ['ELIGIBILITY_CHECKED', 'BLOCKED', 'CANCELLED'],
  ELIGIBILITY_CHECKED: ['MATCHED', 'BLOCKED', 'CANCELLED'],
  MATCHED: ['PLANNED', 'BLOCKED', 'CANCELLED'],
  PLANNED: ['TAILORED', 'NEEDS_USER', 'CANCELLED'],
  TAILORED: ['POLICY_CHECKED', 'NEEDS_USER', 'CANCELLED'],
  POLICY_CHECKED: ['NEEDS_APPROVAL', 'READY', 'BLOCKED', 'CANCELLED'],
  NEEDS_APPROVAL: ['READY', 'NEEDS_USER', 'CANCELLED'],
  READY: ['EXECUTING', 'BLOCKED', 'NEEDS_USER', 'CANCELLED'],
  EXECUTING: [
    'SUBMITTED_UNVERIFIED',
    'FAILED_RETRYABLE',
    'NEEDS_RECONCILIATION',
    'NEEDS_USER',
    'BLOCKED',
    'FAILED_FINAL',
    'CANCELLED',
  ],
  // Ambiguous result: verification may resolve it, a human may reconcile it.
  // There is deliberately no path back to EXECUTING (FR-08, FR-FEC-03).
  SUBMITTED_UNVERIFIED: ['SUBMITTED_VERIFIED', 'NEEDS_RECONCILIATION', 'NEEDS_USER'],
  SUBMITTED_VERIFIED: ['INTERVIEW', 'REJECTED', 'OFFER', 'WITHDRAWN'],
  INTERVIEW: ['OFFER', 'REJECTED', 'WITHDRAWN'],
  OFFER: ['HIRED', 'REJECTED', 'WITHDRAWN'],
  BLOCKED: [
    'NORMALIZED',
    'ELIGIBILITY_CHECKED',
    'MATCHED',
    'PLANNED',
    'TAILORED',
    'POLICY_CHECKED',
    'READY',
    'NEEDS_USER',
    'CANCELLED',
  ],
  NEEDS_USER: [
    'PLANNED',
    'TAILORED',
    'POLICY_CHECKED',
    'NEEDS_APPROVAL',
    'READY',
    'SUBMITTED_UNVERIFIED',
    'SUBMITTED_VERIFIED',
    'BLOCKED',
    'CANCELLED',
  ],
  FAILED_RETRYABLE: [
    'EXECUTING',
    'NEEDS_RECONCILIATION',
    'NEEDS_USER',
    'FAILED_FINAL',
    'CANCELLED',
  ],
  NEEDS_RECONCILIATION: [
    'SUBMITTED_UNVERIFIED',
    'SUBMITTED_VERIFIED',
    'NEEDS_USER',
    'FAILED_FINAL',
    'CANCELLED',
  ],
  FAILED_FINAL: [],
  CANCELLED: [],
  HIRED: [],
  WITHDRAWN: [],
  REJECTED: [],
};

export interface TransitionContext {
  /** Eligibility outcome; REQUIRED when entering ELIGIBILITY_CHECKED. */
  eligibility?: 'eligible' | 'ineligible' | 'unknown';
  /** True once every high-risk field approval is recorded. */
  approvalsSatisfied?: boolean;
  /** Evidence that the submission was confirmed; REQUIRED for SUBMITTED_VERIFIED. */
  verificationEvidenceId?: string;
  /** A human explicitly took over an ambiguous result. */
  manualReconciliation?: boolean;
  /** Why the transition happened, in plain language. */
  reason?: string;
  actor?: string;
}

export interface AuditEntry {
  at: string;
  from: ApplicationState;
  to: ApplicationState;
  actor: string;
  reason?: string;
}

export class InvalidTransitionError extends Error {
  constructor(
    public readonly from: ApplicationState,
    public readonly to: ApplicationState,
    message: string
  ) {
    super(message);
    this.name = 'InvalidTransitionError';
  }
}

export interface ApplicationSnapshot {
  id: string;
  state: ApplicationState;
  retryCount: number;
  audit: AuditEntry[];
}

/**
 * One application. Transitions are validated, guarded and appended to an audit
 * trail (FR-ASM-04). The machine never retries an ambiguous submission itself.
 */
export class ApplicationStateMachine {
  private state: ApplicationState;
  private retryCount = 0;
  private readonly audit: AuditEntry[];
  private readonly now: () => Date;

  constructor(
    public readonly id: string,
    options: { initialState?: ApplicationState; audit?: AuditEntry[]; now?: () => Date } = {}
  ) {
    this.state = options.initialState ?? 'DISCOVERED';
    this.audit = options.audit ? [...options.audit] : [];
    this.now = options.now ?? (() => new Date());
  }

  get current(): ApplicationState {
    return this.state;
  }

  get isTerminal(): boolean {
    return TERMINAL_STATES.includes(this.state);
  }

  get retries(): number {
    return this.retryCount;
  }

  /** States reachable right now, ignoring guards. */
  availableTransitions(): readonly ApplicationState[] {
    return TRANSITIONS[this.state];
  }

  canTransition(to: ApplicationState): boolean {
    return TRANSITIONS[this.state].includes(to);
  }

  /** Throws when the transition is invalid or a guard fails. Atomic: state changes only on success. */
  transition(to: ApplicationState, context: TransitionContext = {}): ApplicationSnapshot {
    if (!this.canTransition(to)) {
      throw new InvalidTransitionError(
        this.state,
        to,
        `Cannot move an application from ${this.state} to ${to}`
      );
    }

    this.assertGuards(to, context);

    const from = this.state;
    if (to === 'FAILED_RETRYABLE') this.retryCount += 1;

    this.state = to;
    this.audit.push({
      at: this.now().toISOString(),
      from,
      to,
      actor: context.actor ?? 'system',
      reason: context.reason,
    });

    return this.snapshot();
  }

  private assertGuards(to: ApplicationState, context: TransitionContext): void {
    const fail = (message: string): never => {
      throw new InvalidTransitionError(this.state, to, message);
    };

    if (to === 'ELIGIBILITY_CHECKED') {
      if (context.eligibility === undefined) {
        fail('Eligibility result is required to complete the eligibility check');
      }
      if (context.eligibility === 'ineligible') {
        fail('An ineligible application cannot progress past the eligibility check');
      }
    }

    if (to === 'READY' && context.eligibility === 'ineligible') {
      fail('Ineligible applications cannot be marked ready to submit');
    }

    if (to === 'READY' && context.approvalsSatisfied === false) {
      fail('High-risk fields still need explicit approval before the application is ready');
    }

    if (to === 'SUBMITTED_VERIFIED' && !context.verificationEvidenceId) {
      fail(
        'Verification requires evidence (confirmation reference) before the state can be verified'
      );
    }

    if (this.state === 'NEEDS_RECONCILIATION' && to === 'SUBMITTED_UNVERIFIED') {
      if (context.manualReconciliation !== true) {
        fail(
          'Ambiguous submissions must not be retried automatically (FR-08); a human must reconcile first'
        );
      }
    }

    // Retrying a retryable failure is allowed, but only a bounded number of
    // times; after that a human reconciles (PRD §Failure recovery).
    if (this.state === 'FAILED_RETRYABLE' && to === 'EXECUTING' && this.retryCount >= MAX_RETRIES) {
      fail(
        `Retry limit reached (${MAX_RETRIES}); move to NEEDS_RECONCILIATION and let a human take over`
      );
    }
  }

  snapshot(): ApplicationSnapshot {
    return {
      id: this.id,
      state: this.state,
      retryCount: this.retryCount,
      audit: [...this.audit],
    };
  }
}
