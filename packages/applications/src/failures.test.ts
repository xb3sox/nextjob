import { describe, expect, it } from 'vitest';
import {
  ApplicationFailureError,
  createFailureError,
  type FailureCode,
  getFailureDetails,
} from './failures.js';
import { ApplicationStateMachine } from './state-machine.js';

const ALL_FAILURE_CODES: FailureCode[] = [
  'DUPLICATE_JOBS',
  'CLOSED_JOBS',
  'CHANGED_JOB_DESCRIPTION',
  'MISSING_EVIDENCE',
  'CONFLICTING_EVIDENCE',
  'UNKNOWN_ELIGIBILITY',
  'UNSUPPORTED_QUESTION',
  'SENSITIVE_QUESTION',
  'CAPTCHA',
  'MFA',
  'ATS_TIMEOUT',
  'PARTIAL_SUBMISSION',
  'UNKNOWN_SUBMISSION_RESULT',
  'CONNECTOR_OUTAGE',
  'REVOKED_OAUTH',
  'EXPIRED_AUTHORIZATION',
  'MODEL_FAILURE',
  'INVALID_STRUCTURED_OUTPUT',
  'MALICIOUS_JOB_CONTENT',
  'USER_EDITS_DURING_EXECUTION',
  'JOB_REMOVED_DURING_APPLICATION',
  'DUPLICATE_RECRUITER_CONFIRMATION',
];

describe('Application Failure Handling (FR-FEC-01, FR-FEC-02, FR-FEC-03, AC-09)', () => {
  it('covers all 22 required failure edge cases per FR-FEC-01', () => {
    expect(ALL_FAILURE_CODES.length).toBe(22);

    for (const code of ALL_FAILURE_CODES) {
      const details = getFailureDetails(code, { sampleContext: true });
      expect(details.code).toBe(code);
      // FR-FEC-02 / AC-09 requirements
      expect(details.status).toBeTruthy();
      expect(details.status.length).toBeGreaterThan(3);
      expect(details.explanation).toBeTruthy();
      expect(details.explanation.length).toBeGreaterThan(10);
      expect(details.recoveryAction).toBeTruthy();
      expect(details.recoveryAction.length).toBeGreaterThan(10);
      expect(typeof details.retryable).toBe('boolean');
      expect(typeof details.isAmbiguous).toBe('boolean');
      expect(details.targetState).toBeTruthy();
    }
  });

  it('correctly formats error instance with ApplicationFailureError', () => {
    const err = createFailureError('CAPTCHA', { url: 'https://example.com/apply' });
    expect(err).toBeInstanceOf(ApplicationFailureError);
    expect(err.name).toBe('ApplicationFailureError');
    expect(err.message).toContain('CAPTCHA Challenge Detected');
    expect(err.details.code).toBe('CAPTCHA');
    expect(err.details.targetState).toBe('NEEDS_USER');
    expect(err.details.context).toEqual({ url: 'https://example.com/apply' });
  });

  it('enforces FR-FEC-03 / FR-08: ambiguous external submission results are non-retryable and map to NEEDS_RECONCILIATION', () => {
    const ambiguousCodes: FailureCode[] = [
      'ATS_TIMEOUT',
      'PARTIAL_SUBMISSION',
      'UNKNOWN_SUBMISSION_RESULT',
    ];

    for (const code of ambiguousCodes) {
      const details = getFailureDetails(code);
      expect(details.isAmbiguous).toBe(true);
      expect(details.retryable).toBe(false);
      expect(details.targetState).toBe('NEEDS_RECONCILIATION');
    }
  });

  it('integrates cleanly with the application state machine target states', () => {
    const sm = new ApplicationStateMachine('app-123', { initialState: 'EXECUTING' });

    // Ambiguous failure -> NEEDS_RECONCILIATION
    const timeoutDetails = getFailureDetails('ATS_TIMEOUT');
    sm.transition(timeoutDetails.targetState, { reason: timeoutDetails.explanation });
    expect(sm.current).toBe('NEEDS_RECONCILIATION');

    // Attempting auto-retry back to EXECUTING without manualReconciliation flag MUST throw
    expect(() => sm.transition('SUBMITTED_UNVERIFIED')).toThrow();
  });

  it('maps retryable system errors to FAILED_RETRYABLE', () => {
    const retryableCodes: FailureCode[] = [
      'CONNECTOR_OUTAGE',
      'MODEL_FAILURE',
      'INVALID_STRUCTURED_OUTPUT',
    ];

    for (const code of retryableCodes) {
      const details = getFailureDetails(code);
      expect(details.retryable).toBe(true);
      expect(details.isAmbiguous).toBe(false);
      expect(details.targetState).toBe('FAILED_RETRYABLE');
    }

    const sm = new ApplicationStateMachine('app-456', { initialState: 'EXECUTING' });
    const outage = getFailureDetails('CONNECTOR_OUTAGE');
    sm.transition(outage.targetState, { reason: outage.explanation });
    expect(sm.current).toBe('FAILED_RETRYABLE');
    expect(sm.retries).toBe(1);
  });
});
