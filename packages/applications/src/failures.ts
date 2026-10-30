/**
 * Application Edge Cases and Failure Handling (T-45 / FR-FEC-01..03, AC-09)
 *
 * Implements explicit handling for all 22 required edge cases with:
 * - Clear status title
 * - Plain-language explanation
 * - Actionable recovery action
 * - Mapping to state machine target states (BLOCKED, NEEDS_USER, FAILED_RETRYABLE, NEEDS_RECONCILIATION, FAILED_FINAL)
 * - Strict prohibition on automatic retries for ambiguous external submissions (FR-FEC-03 / FR-08)
 */

import type { ApplicationState } from './state-machine.js';

export type FailureCode =
  | 'DUPLICATE_JOBS'
  | 'CLOSED_JOBS'
  | 'CHANGED_JOB_DESCRIPTION'
  | 'MISSING_EVIDENCE'
  | 'CONFLICTING_EVIDENCE'
  | 'UNKNOWN_ELIGIBILITY'
  | 'UNSUPPORTED_QUESTION'
  | 'SENSITIVE_QUESTION'
  | 'CAPTCHA'
  | 'MFA'
  | 'ATS_TIMEOUT'
  | 'PARTIAL_SUBMISSION'
  | 'UNKNOWN_SUBMISSION_RESULT'
  | 'CONNECTOR_OUTAGE'
  | 'REVOKED_OAUTH'
  | 'EXPIRED_AUTHORIZATION'
  | 'MODEL_FAILURE'
  | 'INVALID_STRUCTURED_OUTPUT'
  | 'MALICIOUS_JOB_CONTENT'
  | 'USER_EDITS_DURING_EXECUTION'
  | 'JOB_REMOVED_DURING_APPLICATION'
  | 'DUPLICATE_RECRUITER_CONFIRMATION';

export interface FailureDetails {
  code: FailureCode;
  /** Clear status heading / summary (FR-FEC-02) */
  status: string;
  /** Plain-language explanation of what happened (FR-FEC-02) */
  explanation: string;
  /** Clear, actionable step for user or system recovery (FR-FEC-02) */
  recoveryAction: string;
  /** Whether automatic retry by system worker is safe and allowed */
  retryable: boolean;
  /** True for ambiguous external submission results (FR-FEC-03 / FR-08) */
  isAmbiguous: boolean;
  /** Recommended target state in the Application State Machine */
  targetState: ApplicationState;
  /** Optional metadata / context */
  context?: Record<string, unknown>;
}

export class ApplicationFailureError extends Error {
  public readonly details: FailureDetails;

  constructor(details: FailureDetails, cause?: unknown) {
    super(`${details.status}: ${details.explanation}`);
    if (cause !== undefined) {
      (this as { cause?: unknown }).cause = cause;
    }
    this.name = 'ApplicationFailureError';
    this.details = details;
  }
}

/**
 * Metadata and failure definitions for all 22 required edge cases per FR-FEC-01.
 */
const FAILURE_DEFINITIONS: Record<
  FailureCode,
  (context?: Record<string, unknown>) => Omit<FailureDetails, 'code' | 'context'>
> = {
  DUPLICATE_JOBS: (ctx) => ({
    status: 'Duplicate Application Blocked',
    explanation: ctx?.jobTitle
      ? `An application for "${ctx.jobTitle}" has already been submitted or planned.`
      : 'An application for this job posting has already been submitted or planned.',
    recoveryAction:
      'Review your existing application receipt in the tracker before submitting again.',
    retryable: false,
    isAmbiguous: false,
    targetState: 'BLOCKED',
  }),

  CLOSED_JOBS: (ctx) => ({
    status: 'Job Posting Closed',
    explanation: ctx?.companyName
      ? `The job posting at ${ctx.companyName} is closed and no longer accepting applications.`
      : 'The job posting is closed and no longer accepting applications.',
    recoveryAction: 'Archive or remove this job application from your planned list.',
    retryable: false,
    isAmbiguous: false,
    targetState: 'FAILED_FINAL',
  }),

  CHANGED_JOB_DESCRIPTION: () => ({
    status: 'Job Description Updated',
    explanation:
      'The job description changed significantly since your tailoring plan was generated.',
    recoveryAction: 'Re-run job eligibility and tailoring to update your application plan.',
    retryable: false,
    isAmbiguous: false,
    targetState: 'NEEDS_USER',
  }),

  MISSING_EVIDENCE: (ctx) => ({
    status: 'Missing Evidence',
    explanation: ctx?.claimField
      ? `No verified career evidence found for required field "${ctx.claimField}".`
      : 'Required claims in your application lack supporting verified evidence.',
    recoveryAction: 'Add supporting career claims or document evidence in Your Profile.',
    retryable: false,
    isAmbiguous: false,
    targetState: 'NEEDS_USER',
  }),

  CONFLICTING_EVIDENCE: () => ({
    status: 'Conflicting Career Evidence',
    explanation: 'Multiple conflicting claims or evidence documents were found in your profile.',
    recoveryAction: 'Review Your Profile to resolve conflicting claim dates or qualifications.',
    retryable: false,
    isAmbiguous: false,
    targetState: 'NEEDS_USER',
  }),

  UNKNOWN_ELIGIBILITY: () => ({
    status: 'Unknown Eligibility Status',
    explanation:
      'Eligibility rules could not be evaluated conclusively due to insufficient profile evidence.',
    recoveryAction:
      'Update your profile preferences and qualifications to re-evaluate eligibility.',
    retryable: false,
    isAmbiguous: false,
    targetState: 'NEEDS_USER',
  }),

  UNSUPPORTED_QUESTION: (ctx) => ({
    status: 'Unsupported Question Encountered',
    explanation: ctx?.questionText
      ? `The application contains a complex question that could not be auto-filled: "${ctx.questionText}".`
      : 'The application contains form fields that cannot be completed automatically.',
    recoveryAction: 'Provide your answer manually in the approval dialog to complete submission.',
    retryable: false,
    isAmbiguous: false,
    targetState: 'NEEDS_USER',
  }),

  SENSITIVE_QUESTION: (ctx) => ({
    status: 'Sensitive Question Requires Approval',
    explanation: ctx?.questionCategory
      ? `A sensitive field regarding ${ctx.questionCategory} requires your explicit manual input.`
      : 'A sensitive demographic or personal question requires your explicit approval.',
    recoveryAction: 'Review and complete the sensitive question in the approval modal.',
    retryable: false,
    isAmbiguous: false,
    targetState: 'NEEDS_APPROVAL',
  }),

  CAPTCHA: () => ({
    status: 'CAPTCHA Challenge Detected',
    explanation:
      'The ATS portal presented a security CAPTCHA challenge that requires human interaction.',
    recoveryAction: 'Open the extension popup to complete the CAPTCHA verification.',
    retryable: false,
    isAmbiguous: false,
    targetState: 'NEEDS_USER',
  }),

  MFA: () => ({
    status: 'Multi-Factor Authentication Required',
    explanation: 'The ATS or job portal requested a multi-factor authentication code.',
    recoveryAction: 'Enter your MFA verification code in the browser extension dialog.',
    retryable: false,
    isAmbiguous: false,
    targetState: 'NEEDS_USER',
  }),

  ATS_TIMEOUT: () => ({
    status: 'ATS Submission Timeout',
    explanation: 'The ATS server timed out before sending a clear completion response.',
    recoveryAction:
      'Check employer portal status manually. A human must reconcile before retrying (FR-08).',
    retryable: false,
    isAmbiguous: true,
    targetState: 'NEEDS_RECONCILIATION',
  }),

  PARTIAL_SUBMISSION: () => ({
    status: 'Partial Submission Warning',
    explanation: 'The application process stopped after submitting initial form pages.',
    recoveryAction: 'Verify application state in employer portal and reconcile manually.',
    retryable: false,
    isAmbiguous: true,
    targetState: 'NEEDS_RECONCILIATION',
  }),

  UNKNOWN_SUBMISSION_RESULT: () => ({
    status: 'Ambiguous Submission Result',
    explanation:
      'The application submission completed but returned an unparseable or unknown response.',
    recoveryAction: 'Inspect employer confirmation state manually before proceeding.',
    retryable: false,
    isAmbiguous: true,
    targetState: 'NEEDS_RECONCILIATION',
  }),

  CONNECTOR_OUTAGE: () => ({
    status: 'Connector Service Temporary Outage',
    explanation:
      'The target ATS network or connector execution service is temporarily unreachable.',
    recoveryAction: 'The system will retry automatically once service connectivity is restored.',
    retryable: true,
    isAmbiguous: false,
    targetState: 'FAILED_RETRYABLE',
  }),

  REVOKED_OAUTH: () => ({
    status: 'OAuth Authorization Revoked',
    explanation: 'Your authorization for this ATS integration has been revoked.',
    recoveryAction: 'Re-authenticate your account integration in settings.',
    retryable: false,
    isAmbiguous: false,
    targetState: 'NEEDS_USER',
  }),

  EXPIRED_AUTHORIZATION: () => ({
    status: 'Session Authorization Expired',
    explanation: 'Your authentication session or security token has expired.',
    recoveryAction: 'Log back in to refresh your active session credentials.',
    retryable: false,
    isAmbiguous: false,
    targetState: 'NEEDS_USER',
  }),

  MODEL_FAILURE: () => ({
    status: 'AI Model Failure',
    explanation: 'The tailoring AI model failed to respond or encountered a temporary error.',
    recoveryAction: 'The system will retry the AI generation task automatically.',
    retryable: true,
    isAmbiguous: false,
    targetState: 'FAILED_RETRYABLE',
  }),

  INVALID_STRUCTURED_OUTPUT: () => ({
    status: 'Invalid AI Model Response',
    explanation: 'The AI model generated output that failed schema validation.',
    recoveryAction: 'The system will re-prompt the AI model with strict schema constraints.',
    retryable: true,
    isAmbiguous: false,
    targetState: 'FAILED_RETRYABLE',
  }),

  MALICIOUS_JOB_CONTENT: () => ({
    status: 'Malicious Content Blocked',
    explanation:
      'Potential prompt injection or malicious content detected in job posting description.',
    recoveryAction: 'This job posting has been flagged and blocked for safety.',
    retryable: false,
    isAmbiguous: false,
    targetState: 'BLOCKED',
  }),

  USER_EDITS_DURING_EXECUTION: () => ({
    status: 'User Edit During Execution',
    explanation:
      'Your profile or application preferences were updated while submission was in progress.',
    recoveryAction: 'Review your updated profile answers and restart execution when ready.',
    retryable: false,
    isAmbiguous: false,
    targetState: 'NEEDS_USER',
  }),

  JOB_REMOVED_DURING_APPLICATION: () => ({
    status: 'Job Removed During Application',
    explanation: 'The job posting URL became unavailable or was removed while applying.',
    recoveryAction: 'Verify job availability on company website or cancel application.',
    retryable: false,
    isAmbiguous: false,
    targetState: 'FAILED_FINAL',
  }),

  DUPLICATE_RECRUITER_CONFIRMATION: () => ({
    status: 'Duplicate Recruiter Confirmation',
    explanation: 'A submission receipt or recruiter confirmation is already recorded for this job.',
    recoveryAction: 'View recorded receipt in Tracker; no further action required.',
    retryable: false,
    isAmbiguous: false,
    targetState: 'BLOCKED',
  }),
};

/**
 * Get structured failure details for any edge case code per FR-FEC-01/02/03.
 */
export function getFailureDetails(
  code: FailureCode,
  context?: Record<string, unknown>
): FailureDetails {
  const factory = FAILURE_DEFINITIONS[code];
  if (!factory) {
    throw new Error(`Unknown failure code: ${code}`);
  }
  const base = factory(context);
  return {
    code,
    ...base,
    context,
  };
}

/**
 * Helper to build an ApplicationFailureError for throwing.
 */
export function createFailureError(
  code: FailureCode,
  context?: Record<string, unknown>,
  cause?: unknown
): ApplicationFailureError {
  const details = getFailureDetails(code, context);
  return new ApplicationFailureError(details, cause);
}
