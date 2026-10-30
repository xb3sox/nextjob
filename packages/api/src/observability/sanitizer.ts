import crypto from 'node:crypto';

const SENSITIVE_KEYS = new Set([
  'password',
  'secret',
  'token',
  'authorization',
  'apikey',
  'access_token',
  'accesstoken',
  'refresh_token',
  'refreshtoken',
  'ssn',
  'credit_card',
  'creditcard',
  'cv_text',
  'cvtext',
  'resume_text',
  'resumetext',
  'raw_cv',
  'rawcv',
  'raw_text',
  'rawtext',
  'phone',
  'email',
]);

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /\b(?:\+?1[-.]?)?\(?[2-9]\d{2}\)?[-.]?\d{3}[-.]?\d{4}\b/g;
const SSN_REGEX = /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g;
const BEARER_REGEX = /Bearer\s+[a-zA-Z0-9\-._~+/]+=*/gi;

/**
 * Anonymizes an identifier using deterministic SHA-256 truncated to 16 hex chars.
 */
export function hashIdentifier(id: string, salt = 'nextjob_obs_salt'): string {
  return crypto.createHash('sha256').update(`${salt}:${id}`).digest('hex').substring(0, 16);
}

/**
 * Redacts string content from known PII patterns.
 */
export function sanitizeString(val: string): string {
  return val
    .replace(BEARER_REGEX, 'Bearer [REDACTED_TOKEN]')
    .replace(EMAIL_REGEX, '[REDACTED_EMAIL]')
    .replace(PHONE_REGEX, '[REDACTED_PHONE]')
    .replace(SSN_REGEX, '[REDACTED_SSN]');
}

/**
 * Deeply sanitizes an object or value, masking sensitive fields and scrubbing PII patterns.
 */
export function sanitizePayload<T>(value: T, depth = 0): T {
  if (depth > 6 || value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return sanitizeString(value) as unknown as T;
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizePayload(item, depth + 1)) as unknown as T;
  }

  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const rawLower = k.toLowerCase();
    const strippedLower = rawLower.replace(/[-_]/g, '');

    if (
      SENSITIVE_KEYS.has(rawLower) ||
      SENSITIVE_KEYS.has(strippedLower) ||
      strippedLower.includes('password') ||
      strippedLower.includes('token') ||
      strippedLower.includes('secret')
    ) {
      result[k] = '[REDACTED]';
    } else {
      result[k] = sanitizePayload(v, depth + 1);
    }
  }

  return result as T;
}
