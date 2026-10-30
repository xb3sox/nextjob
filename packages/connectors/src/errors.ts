/**
 * Connector Error Taxonomy and Edge Case Error Classes
 * Phase 19 — Failure & Edge Cases (T-45 / FR-FEC-01..03)
 */

export type ConnectorErrorCode =
  | 'CAPTCHA_ENCOUNTERED'
  | 'MFA_REQUIRED'
  | 'ATS_TIMEOUT'
  | 'PARTIAL_SUBMISSION'
  | 'UNKNOWN_SUBMISSION_RESULT'
  | 'CONNECTOR_OUTAGE'
  | 'REVOKED_OAUTH'
  | 'EXPIRED_AUTHORIZATION'
  | 'JOB_REMOVED_DURING_APPLICATION'
  | 'DUPLICATE_RECRUITER_CONFIRMATION'
  | 'GENERIC_CONNECTOR_ERROR';

export interface ConnectorErrorOptions {
  cause?: unknown;
  details?: Record<string, unknown>;
}

export class ConnectorError extends Error {
  public readonly code: ConnectorErrorCode;
  public readonly isAmbiguous: boolean;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: ConnectorErrorCode = 'GENERIC_CONNECTOR_ERROR',
    isAmbiguous = false,
    options?: ConnectorErrorOptions
  ) {
    super(message);
    if (options?.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
    this.name = 'ConnectorError';
    this.code = code;
    this.isAmbiguous = isAmbiguous;
    this.details = options?.details;
  }
}

export class CaptchaEncounteredError extends ConnectorError {
  constructor(
    message = 'A CAPTCHA challenge was detected and requires human resolution.',
    options?: ConnectorErrorOptions
  ) {
    super(message, 'CAPTCHA_ENCOUNTERED', false, options);
    this.name = 'CaptchaEncounteredError';
  }
}

export class MfaRequiredError extends ConnectorError {
  constructor(
    message = 'Multi-factor authentication (MFA) is required to proceed.',
    options?: ConnectorErrorOptions
  ) {
    super(message, 'MFA_REQUIRED', false, options);
    this.name = 'MfaRequiredError';
  }
}

export class AtsTimeoutError extends ConnectorError {
  constructor(
    message = 'The ATS timed out before confirmation was received.',
    options?: ConnectorErrorOptions
  ) {
    // Ambiguous = true: submission status unknown (FR-FEC-03)
    super(message, 'ATS_TIMEOUT', true, options);
    this.name = 'AtsTimeoutError';
  }
}

export class PartialSubmissionError extends ConnectorError {
  constructor(
    message = 'The application form was only partially submitted.',
    options?: ConnectorErrorOptions
  ) {
    // Ambiguous = true: status uncertain (FR-FEC-03)
    super(message, 'PARTIAL_SUBMISSION', true, options);
    this.name = 'PartialSubmissionError';
  }
}

export class UnknownSubmissionResultError extends ConnectorError {
  constructor(
    message = 'The application submission result could not be conclusively determined.',
    options?: ConnectorErrorOptions
  ) {
    // Ambiguous = true: status uncertain (FR-FEC-03)
    super(message, 'UNKNOWN_SUBMISSION_RESULT', true, options);
    this.name = 'UnknownSubmissionResultError';
  }
}

export class ConnectorOutageError extends ConnectorError {
  constructor(
    message = 'The connector or ATS provider is currently experiencing an outage.',
    options?: ConnectorErrorOptions
  ) {
    super(message, 'CONNECTOR_OUTAGE', false, options);
    this.name = 'ConnectorOutageError';
  }
}

export class RevokedOAuthError extends ConnectorError {
  constructor(
    message = 'OAuth authorization has been revoked by the user or provider.',
    options?: ConnectorErrorOptions
  ) {
    super(message, 'REVOKED_OAUTH', false, options);
    this.name = 'RevokedOAuthError';
  }
}

export class ExpiredAuthorizationError extends ConnectorError {
  constructor(
    message = 'Authorization credentials or session tokens have expired.',
    options?: ConnectorErrorOptions
  ) {
    super(message, 'EXPIRED_AUTHORIZATION', false, options);
    this.name = 'ExpiredAuthorizationError';
  }
}

export class JobRemovedDuringApplicationError extends ConnectorError {
  constructor(
    message = 'The job posting was removed or closed during application execution.',
    options?: ConnectorErrorOptions
  ) {
    super(message, 'JOB_REMOVED_DURING_APPLICATION', false, options);
    this.name = 'JobRemovedDuringApplicationError';
  }
}

export class DuplicateRecruiterConfirmationError extends ConnectorError {
  constructor(
    message = 'A duplicate recruiter confirmation or application record was received.',
    options?: ConnectorErrorOptions
  ) {
    super(message, 'DUPLICATE_RECRUITER_CONFIRMATION', false, options);
    this.name = 'DuplicateRecruiterConfirmationError';
  }
}
