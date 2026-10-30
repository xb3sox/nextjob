import type { AIMessage } from './types.js';

// ============================================================================
// PII Redaction Patterns
// ============================================================================

/**
 * Regular expressions for detecting PII
 */
const PII_PATTERNS = {
  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

  // Phone numbers (various formats)
  phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,

  // Credit card numbers (basic pattern)
  creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,

  // Social Security Numbers (US format)
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,

  // IP addresses
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,

  // Dates of birth (various formats)
  dob: /\b(?:0[1-9]|1[0-2])\/(?:0[1-9]|[12]\d|3[01])\/(?:19|20)\d{2}\b/g,

  // Passport numbers (generic pattern)
  passport: /\b[A-Z]{1,2}\d{6,9}\b/g,

  // Bank account numbers (generic pattern)
  bankAccount: /\b\d{8,17}\b/g,

  // Addresses (street patterns)
  streetAddress:
    /\b\d+\s+[A-Za-z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Place|Pl)\b/gi,

  // ZIP codes (US format)
  zipCode: /\b\d{5}(?:-\d{4})?\b/g,
};

/**
 * Pre-computed entries array to avoid runtime Object.entries allocations per invocation.
 */
const PII_PATTERN_ENTRIES = Object.entries(PII_PATTERNS);

/**
 * Redaction placeholder
 */
const REDACTION_PLACEHOLDER = '[REDACTED]';

// ============================================================================
// Redaction Functions
// ============================================================================

/**
 * Detects PII in text and returns found patterns.
 * Performance optimized: pre-screens input string for required character triggers ('@' and digits)
 * to skip regex evaluations when input cannot possibly match, and avoids runtime array allocations.
 */
export function detectPII(text: string): Record<string, string[]> {
  if (!text) return {};

  const found: Record<string, string[]> = {};
  const hasAt = text.includes('@');
  const hasDigits = /\d/.test(text);

  // Quick early return if text contains neither email symbol nor any digits
  if (!hasAt && !hasDigits) return found;

  for (let i = 0; i < PII_PATTERN_ENTRIES.length; i++) {
    const [type, pattern] = PII_PATTERN_ENTRIES[i];
    if (type === 'email' && !hasAt) continue;
    if (type !== 'email' && !hasDigits) continue;

    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      found[type] = Array.from(new Set(matches)); // Remove duplicates
    }
  }

  return found;
}

/**
 * Redacts PII from text.
 * Performance optimized: pre-screens text for '@' and digits before running global regex replacements,
 * skipping up to 10 sequential RegExp passes on non-matching strings.
 */
export function redactPII(
  text: string,
  options?: {
    preserveEmail?: boolean;
    preservePhone?: boolean;
    customPatterns?: Array<{ name: string; pattern: RegExp }>;
  }
): string {
  if (!text) return text;

  let redacted = text;
  const hasAt = text.includes('@');
  const hasDigits = /\d/.test(text);

  // Redact emails (only if text contains '@')
  if (!options?.preserveEmail && hasAt) {
    redacted = redacted.replace(PII_PATTERNS.email, REDACTION_PLACEHOLDER);
  }

  // Redact numeric-based PII patterns (only if text contains digits)
  if (hasDigits) {
    if (!options?.preservePhone) {
      redacted = redacted.replace(PII_PATTERNS.phone, REDACTION_PLACEHOLDER);
    }
    redacted = redacted.replace(PII_PATTERNS.creditCard, REDACTION_PLACEHOLDER);
    redacted = redacted.replace(PII_PATTERNS.ssn, REDACTION_PLACEHOLDER);
    redacted = redacted.replace(PII_PATTERNS.ipAddress, REDACTION_PLACEHOLDER);
    redacted = redacted.replace(PII_PATTERNS.dob, REDACTION_PLACEHOLDER);
    redacted = redacted.replace(PII_PATTERNS.passport, REDACTION_PLACEHOLDER);
    redacted = redacted.replace(PII_PATTERNS.bankAccount, REDACTION_PLACEHOLDER);
    redacted = redacted.replace(PII_PATTERNS.streetAddress, REDACTION_PLACEHOLDER);
    redacted = redacted.replace(PII_PATTERNS.zipCode, REDACTION_PLACEHOLDER);
  }

  // Apply custom patterns
  if (options?.customPatterns) {
    for (const { pattern } of options.customPatterns) {
      redacted = redacted.replace(pattern, REDACTION_PLACEHOLDER);
    }
  }

  return redacted;
}

/**
 * Redacts PII from an array of messages
 */
export function redactMessages(
  messages: AIMessage[],
  options?: Parameters<typeof redactPII>[1]
): AIMessage[] {
  return messages.map((msg) => ({
    role: msg.role,
    content: redactPII(msg.content, options),
  }));
}

/**
 * Redacts PII from an object (recursively)
 */
export function redactObject<T>(obj: T, options?: Parameters<typeof redactPII>[1]): T {
  if (typeof obj === 'string') {
    return redactPII(obj, options) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactObject(item, options)) as T;
  }

  if (obj !== null && typeof obj === 'object') {
    const redacted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      redacted[key] = redactObject(value, options);
    }
    return redacted;
  }

  return obj;
}

// ============================================================================
// Context-Aware Redaction
// ============================================================================

/**
 * Redacts PII with context awareness
 * Preserves certain patterns based on context
 */
export function redactWithContext(
  text: string,
  context: 'cv' | 'application' | 'interview' | 'general'
): string {
  switch (context) {
    case 'cv':
      // For CVs, preserve contact info but redact sensitive data
      return redactPII(text, {
        preserveEmail: true,
        preservePhone: true,
      });

    case 'application':
      // For applications, redact most PII
      return redactPII(text, {
        preserveEmail: false,
        preservePhone: false,
      });

    case 'interview':
      // For interviews, preserve minimal PII
      return redactPII(text, {
        preserveEmail: false,
        preservePhone: false,
      });
    default:
      // For general text, redact all PII
      return redactPII(text);
  }
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validates that text doesn't contain PII
 */
export function validateNoPII(text: string): {
  valid: boolean;
  detected: Record<string, string[]>;
} {
  const detected = detectPII(text);
  const hasPII = Object.keys(detected).length > 0;

  return {
    valid: !hasPII,
    detected,
  };
}

/**
 * Asserts that text doesn't contain PII (throws if it does)
 */
export function assertNoPII(text: string, context?: string): void {
  const { valid, detected } = validateNoPII(text);

  if (!valid) {
    const piiTypes = Object.keys(detected).join(', ');
    const message = context
      ? `PII detected in ${context}: ${piiTypes}`
      : `PII detected: ${piiTypes}`;
    throw new Error(message);
  }
}
