const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
const SENSITIVE_KEYS = new Set([
  'email',
  'password',
  'token',
  'secret',
  'auth',
  'authorization',
  'apikey',
  'api_key',
  'ssn',
  'credit_card',
  'phone',
  'phonenumber',
  'phone_number',
  'name',
  'fullname',
  'full_name',
  'candidate_name',
]);

/**
 * Sanitizes a single primitive value by masking PII.
 */
function sanitizePrimitive(val: unknown): unknown {
  if (typeof val === 'string') {
    return val.replace(EMAIL_REGEX, '[REDACTED_EMAIL]').replace(PHONE_REGEX, '[REDACTED_PHONE]');
  }
  return val;
}

/**
 * Recursively cleans an object payload, removing sensitive keys and masking PII values.
 * Guarantees zero candidate/user PII in outgoing analytics.
 */
export function sanitizeAnalyticsProperties(
  props: Record<string, unknown>
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey)) {
      continue; // Completely drop sensitive key
    }

    if (value === null || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'object' && item !== null
          ? sanitizeAnalyticsProperties(item as Record<string, unknown>)
          : sanitizePrimitive(item)
      );
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeAnalyticsProperties(value as Record<string, unknown>);
    } else {
      sanitized[key] = sanitizePrimitive(value);
    }
  }

  return sanitized;
}
