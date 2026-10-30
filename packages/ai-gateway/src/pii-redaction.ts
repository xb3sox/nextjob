import type { AIMessage } from './types.js';

// ============================================================================
// PII Redaction Patterns
// ============================================================================

/**
 * Regular expressions for detecting PII
 */
const PII_PATTERNS = {
  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,

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
 * Redaction placeholder
 */
const REDACTION_PLACEHOLDER = '[REDACTED]';

// ============================================================================
// Redaction Functions
// ============================================================================

/**
 * Detects PII in text and returns found patterns
 */
export function detectPII(text: string): Record<string, string[]> {
  const found: Record<string, string[]> = {};

  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      found[type] = [...new Set(matches)]; // Remove duplicates
    }
  }

  return found;
}

// ============================================================================
// Optimized Combined Patterns for Single-Pass Redaction
// ============================================================================

/**
 * Pre-compiled combined regex patterns for single-pass string replacement.
 * Reduces 8-10 regex scans per string down to 1 pass.
 */
const PATTERN_SOURCES = {
  email: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
  phone: '(?:\\+?\\d{1,3}[-.\\s]?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}',
  creditCard: '\\b\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}\\b',
  ssn: '\\b\\d{3}-\\d{2}-\\d{4}\\b',
  ipAddress: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
  dob: '\\b(?:0[1-9]|1[0-2])\\/(?:0[1-9]|[12]\\d|3[01])\\/(?:19|20)\\d{2}\\b',
  passport: '\\b[A-Z]{1,2}\\d{6,9}\\b',
  bankAccount: '\\b\\d{8,17}\\b',
  streetAddress:
    '\\b\\d+\\s+[A-Za-z]+\\s+(?:[Ss][Tt][Rr][Ee][Ee][Tt]|[Ss][Tt]|[Aa][Vv][Ee][Nn][Uu][Ee]|[Aa][Vv][Ee]|[Rr][Oo][Aa][Dd]|[Rr][Dd]|[Bb][Oo][Uu][Ll][Ee][Vv][Aa][Rr][Dd]|[Bb][Ll][Vv][Dd]|[Dd][Rr][Ii][Vv][Ee]|[Dd][Rr]|[Ll][Aa][Nn][Ee]|[Ll][Nn]|[Cc][Oo][Uu][Rr][Tt]|[Cc][Tt]|[Pp][Ll][Aa][Cc][Ee]|[Pp][Ll])\\b',
  zipCode: '\\b\\d{5}(?:-\\d{4})?\\b',
};

const SENSITIVE_SOURCES = [
  PATTERN_SOURCES.creditCard,
  PATTERN_SOURCES.ssn,
  PATTERN_SOURCES.ipAddress,
  PATTERN_SOURCES.dob,
  PATTERN_SOURCES.passport,
  PATTERN_SOURCES.bankAccount,
  PATTERN_SOURCES.streetAddress,
  PATTERN_SOURCES.zipCode,
];

// Pre-compiled combined regexes for standard option combinations
const COMBINED_REGEX_ALL = new RegExp(
  [PATTERN_SOURCES.email, PATTERN_SOURCES.phone, ...SENSITIVE_SOURCES].join('|'),
  'g'
);

const COMBINED_REGEX_NO_EMAIL = new RegExp(
  [PATTERN_SOURCES.phone, ...SENSITIVE_SOURCES].join('|'),
  'g'
);

const COMBINED_REGEX_NO_PHONE = new RegExp(
  [PATTERN_SOURCES.email, ...SENSITIVE_SOURCES].join('|'),
  'g'
);

const COMBINED_REGEX_NO_EMAIL_NO_PHONE = new RegExp(SENSITIVE_SOURCES.join('|'), 'g');

/**
 * Redacts PII from text
 * Optimized with single-pass regex replacement for high-throughput AI message processing.
 */
export function redactPII(
  text: string,
  options?: {
    preserveEmail?: boolean;
    preservePhone?: boolean;
    customPatterns?: Array<{ name: string; pattern: RegExp }>;
  }
): string {
  const preserveEmail = options?.preserveEmail ?? false;
  const preservePhone = options?.preservePhone ?? false;

  // Choose pre-compiled single-pass regex based on email/phone preservation options
  let combinedRegex: RegExp;
  if (!preserveEmail && !preservePhone) {
    combinedRegex = COMBINED_REGEX_ALL;
  } else if (preserveEmail && !preservePhone) {
    combinedRegex = COMBINED_REGEX_NO_EMAIL;
  } else if (!preserveEmail && preservePhone) {
    combinedRegex = COMBINED_REGEX_NO_PHONE;
  } else {
    combinedRegex = COMBINED_REGEX_NO_EMAIL_NO_PHONE;
  }

  // Perform single-pass redaction
  let redacted = text.replace(combinedRegex, REDACTION_PLACEHOLDER);

  // Apply custom patterns if provided
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
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
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
