/**
 * Sanitization utilities for notification payloads (FR-03, FR-13).
 *
 * Ensures no sensitive candidate fields (demographics, disability, health,
 * SSN, raw CV content, or credentials) ever leak into in-app notifications
 * or outbound emails.
 */

// Patterns matching sensitive data
const SENSITIVE_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
  /\b(?:\d{4}[ -]?){3}\d{4}\b/g, // Credit card numbers
  /\b(?:bearer\s+)?[a-zA-Z0-9_\-.]{40,}\b/gi, // Tokens/keys
];

// Sensitive keys that must be omitted from metadata
const BANNED_METADATA_KEYS = new Set([
  'ssn',
  'disability',
  'health',
  'race',
  'ethnicity',
  'gender',
  'sexuality',
  'religion',
  'veteran_status',
  'password',
  'raw_cv',
  'resume_raw',
  'token',
  'secret',
  'salary_exact',
]);

export function sanitizeText(text: string): string {
  if (!text) return '';
  let sanitized = text;
  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }
  return sanitized;
}

export function sanitizeMetadata(
  meta?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const clean: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(meta)) {
    const lowerKey = key.toLowerCase();
    if (BANNED_METADATA_KEYS.has(lowerKey)) {
      continue;
    }
    if (typeof val === 'string') {
      clean[key] = sanitizeText(val);
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      clean[key] = sanitizeMetadata(val as Record<string, unknown>);
    } else {
      clean[key] = val;
    }
  }

  return clean;
}
