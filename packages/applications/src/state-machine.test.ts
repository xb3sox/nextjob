import { describe, expect, it } from 'vitest';
import {
  type ApplicationState,
  ApplicationStateMachine,
  EXCEPTION_STATES,
  InvalidTransitionError,
  OUTCOME_STATES,
  PIPELINE_STATES,
  TERMINAL_STATES,
  TRANSITIONS,
} from './state-machine.js';

const clock = () => new Date('2026-10-24T12:00:00.000Z');

function machineAt(state: ApplicationState) {
  return new ApplicationStateMachine('app-1', { initialState: state, now: clock });
}

/** Walk the happy path from DISCOVERED to EXECUTING. */
function advanceToReady(m: ApplicationStateMachine) {
  m.transition('NORMALIZED');
  m.transition('ELIGIBILITY_CHECKED', { eligibility: 'eligible' });
  m.transition('MATCHED');
  m.transition('PLANNED');
  m.transition('TAILORED');
  m.transition('POLICY_CHECKED');
  m.transition('READY', { approvalsSatisfied: true });
  return m;
}

describe('application state machine', () => {
  it('covers every PRD state (FR-ASM-01..03)', () => {
    expect(PIPELINE_STATES).toHaveLength(12);
    expect(OUTCOME_STATES).toEqual(['INTERVIEW', 'REJECTED', 'OFFER', 'WITHDRAWN', 'HIRED']);
    expect(EXCEPTION_STATES).toEqual([
      'BLOCKED',
      'NEEDS_USER',
      'FAILED_RETRYABLE',
      'NEEDS_RECONCILIATION',
      'FAILED_FINAL',
      'CANCELLED',
    ]);
    // Every state has an entry, so no transition can fall through undefined.
    for (const state of [...PIPELINE_STATES, ...OUTCOME_STATES, ...EXCEPTION_STATES]) {
      expect(TRANSITIONS[state]).toBeDefined();
    }
  });

  it('walks the full pipeline to SUBMITTED_VERIFIED', () => {
    const m = advanceToReady(new ApplicationStateMachine('app-1', { now: clock }));
    m.transition('EXECUTING');
    expect(m.current).toBe('EXECUTING');
    m.transition('SUBMITTED_UNVERIFIED');
    expect(m.current).toBe('SUBMITTED_UNVERIFIED');
    m.transition('SUBMITTED_VERIFIED', { verificationEvidenceId: 'ev-1' });
    expect(m.current).toBe('SUBMITTED_VERIFIED');
  });

  it('rejects an invalid transition and keeps state unchanged (FR-ASM-04)', () => {
    const m = new ApplicationStateMachine('app-1', { now: clock });
    expect(() => m.transition('EXECUTING')).toThrow(InvalidTransitionError);
    expect(m.current).toBe('DISCOVERED');
    expect(m.snapshot().audit).toHaveLength(0);
  });

  it('blocks the eligibility gate for an ineligible application', () => {
    const m = new ApplicationStateMachine('app-1', { now: clock });
    m.transition('NORMALIZED');
    expect(() => m.transition('ELIGIBILITY_CHECKED', { eligibility: 'ineligible' })).toThrow(
      /ineligible/i
    );
    expect(m.current).toBe('NORMALIZED');
  });

  it('requires an eligibility result before ELIGIBILITY_CHECKED', () => {
    const m = new ApplicationStateMachine('app-1', { now: clock });
    m.transition('NORMALIZED');
    expect(() => m.transition('ELIGIBILITY_CHECKED')).toThrow(/required/i);
  });

  it('allows unknown eligibility through without silently treating it as eligible', () => {
    const m = new ApplicationStateMachine('app-1', { now: clock });
    m.transition('NORMALIZED');
    m.transition('ELIGIBILITY_CHECKED', { eligibility: 'unknown' });
    expect(m.current).toBe('ELIGIBILITY_CHECKED');
  });

  it('requires approvals before READY when high-risk fields exist', () => {
    const m = machineAt('POLICY_CHECKED');
    expect(() => m.transition('READY', { approvalsSatisfied: false })).toThrow(/approval/i);
    m.transition('NEEDS_APPROVAL');
    m.transition('READY', { approvalsSatisfied: true });
    expect(m.current).toBe('READY');
  });

  it('routes a connector failure to FAILED_RETRYABLE and counts the retry (AC-08)', () => {
    const m = machineAt('EXECUTING');
    m.transition('FAILED_RETRYABLE', { reason: 'ATS timeout' });
    expect(m.current).toBe('FAILED_RETRYABLE');
    expect(m.retries).toBe(1);
    m.transition('EXECUTING');
    expect(m.current).toBe('EXECUTING');
  });

  it('never retries an ambiguous submission automatically (FR-08, FR-FEC-03)', () => {
    const m = machineAt('EXECUTING');
    m.transition('SUBMITTED_UNVERIFIED', { reason: 'unknown submission result' });
    // No path back to EXECUTING at all from an unverified submission.
    expect(m.availableTransitions()).not.toContain('EXECUTING');
    expect(() => m.transition('EXECUTING')).toThrow(InvalidTransitionError);
  });

  it('requires a human to reconcile before re-entering the pipeline', () => {
    const m = machineAt('SUBMITTED_UNVERIFIED');
    m.transition('NEEDS_RECONCILIATION', { reason: 'no confirmation received' });
    expect(() => m.transition('SUBMITTED_UNVERIFIED')).toThrow(/FR-08|reconcile/i);
    m.transition('SUBMITTED_UNVERIFIED', { manualReconciliation: true, actor: 'user-1' });
    expect(m.current).toBe('SUBMITTED_UNVERIFIED');
  });

  it('requires evidence before marking a submission verified', () => {
    const m = machineAt('SUBMITTED_UNVERIFIED');
    expect(() => m.transition('SUBMITTED_VERIFIED')).toThrow(/evidence/i);
    m.transition('SUBMITTED_VERIFIED', { verificationEvidenceId: 'receipt-9' });
    expect(m.current).toBe('SUBMITTED_VERIFIED');
  });

  it('tracks outcome states after verification (FR-ASM-02)', () => {
    const m = machineAt('SUBMITTED_VERIFIED');
    m.transition('INTERVIEW');
    m.transition('OFFER');
    m.transition('HIRED');
    expect(m.current).toBe('HIRED');
    expect(m.isTerminal).toBe(true);
  });

  it('refuses every transition out of a terminal state', () => {
    for (const state of TERMINAL_STATES) {
      const m = machineAt(state);
      expect(m.availableTransitions()).toHaveLength(0);
      expect(() => m.transition('READY')).toThrow(InvalidTransitionError);
    }
  });

  it('records an auditable trail with actor, reason and timestamp (FR-ASM-04)', () => {
    const m = new ApplicationStateMachine('app-1', { now: clock });
    m.transition('NORMALIZED', { actor: 'pipeline', reason: 'normalized from source' });
    const snapshot = m.snapshot();
    expect(snapshot.audit).toEqual([
      {
        at: '2026-10-24T12:00:00.000Z',
        from: 'DISCOVERED',
        to: 'NORMALIZED',
        actor: 'pipeline',
        reason: 'normalized from source',
      },
    ]);
  });

  it('caps retries at three and then requires reconciliation', () => {
    const m = machineAt('READY');
    m.transition('EXECUTING');
    m.transition('FAILED_RETRYABLE');
    m.transition('EXECUTING');
    m.transition('FAILED_RETRYABLE');
    m.transition('EXECUTING');
    m.transition('FAILED_RETRYABLE'); // retryCount === MAX_RETRIES
    expect(m.retries).toBe(3);
    expect(() => m.transition('EXECUTING')).toThrow(/retry limit/i);
    m.transition('NEEDS_RECONCILIATION', { reason: 'retries exhausted' });
    expect(m.current).toBe('NEEDS_RECONCILIATION');
  });

  it('supports cancellation from active states', () => {
    const m = machineAt('NEEDS_USER');
    m.transition('CANCELLED', { actor: 'user-1', reason: 'user withdrew' });
    expect(m.current).toBe('CANCELLED');
    expect(m.isTerminal).toBe(true);
  });
});
