import crypto from 'node:crypto';

const BANNED_KEYS = new Set([
  'resume',
  'cv',
  'resumetext',
  'cvtext',
  'rawcv',
  'rawresume',
  'rawtext',
  'coverletter',
  'coverletterbody',
  'password',
  'token',
  'secret',
  'apikey',
  'authorization',
  'ssn',
  'creditcard',
  'email',
  'phone',
  'address',
  'disability',
  'race',
  'ethnicity',
  'gender',
  'veteran',
  'religion',
  'health',
  'salary',
  'compensation',
]);

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_PATTERN = /\b(?:\+?1[-.]?)?\(?[2-9]\d{2}\)?[-.]?\d{3}[-.]?\d{4}\b/g;
const SSN_PATTERN = /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g;

/**
 * Anonymizes identifier using deterministic SHA-256 (16-char hex).
 */
export function anonymizeUserId(rawId: string, salt = 'nextjob_analytics'): string {
  return crypto.createHash('sha256').update(`${salt}:${rawId}`).digest('hex').substring(0, 16);
}

/**
 * Redacts string patterns matching PII.
 */
export function scrubString(str: string): string {
  return str
    .replace(EMAIL_PATTERN, '[REDACTED_EMAIL]')
    .replace(PHONE_PATTERN, '[REDACTED_PHONE]')
    .replace(SSN_PATTERN, '[REDACTED_SSN]');
}

/**
 * Validates and deeply sanitizes an object to enforce AC-11 / FR-ANA-02.
 * Drops banned sensitive keys entirely or masks them with [REDACTED].
 */
export function sanitizeAnalyticsPayload<T>(value: T, depth = 0): T {
  if (depth > 6 || value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return scrubString(value) as unknown as T;
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((v) => sanitizeAnalyticsPayload(v, depth + 1)) as unknown as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    const normalizedKey = key.toLowerCase().replace(/[-_]/g, '');
    if (
      BANNED_KEYS.has(normalizedKey) ||
      normalizedKey.includes('password') ||
      normalizedKey.includes('token') ||
      normalizedKey.includes('resume') ||
      normalizedKey.includes('cv') ||
      normalizedKey.includes('secret')
    ) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = sanitizeAnalyticsPayload(val, depth + 1);
    }
  }

  return result as T;
}
