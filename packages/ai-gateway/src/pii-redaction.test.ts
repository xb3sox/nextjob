import { describe, it, expect } from 'vitest';
import {
  detectPII,
  redactPII,
  redactMessages,
  redactObject,
  redactWithContext,
  validateNoPII,
  assertNoPII,
} from './pii-redaction.js';

// ============================================================================
// PII Detection Tests
// ============================================================================

describe('detectPII', () => {
  it('should detect email addresses', () => {
    const text = 'Contact me at john@example.com or jane@test.org';
    const detected = detectPII(text);

    expect(detected.email).toBeDefined();
    expect(detected.email).toContain('john@example.com');
    expect(detected.email).toContain('jane@test.org');
  });

  it('should detect phone numbers', () => {
    const text = 'Call me at (555) 123-4567 or 555-987-6543';
    const detected = detectPII(text);

    expect(detected.phone).toBeDefined();
    expect(detected.phone.length).toBeGreaterThan(0);
  });

  it('should detect credit card numbers', () => {
    const text = 'Card number: 1234-5678-9012-3456';
    const detected = detectPII(text);

    expect(detected.creditCard).toBeDefined();
    expect(detected.creditCard).toContain('1234-5678-9012-3456');
  });

  it('should detect SSN', () => {
    const text = 'SSN: 123-45-6789';
    const detected = detectPII(text);

    expect(detected.ssn).toBeDefined();
    expect(detected.ssn).toContain('123-45-6789');
  });

  it('should detect IP addresses', () => {
    const text = 'IP address: 192.168.1.1';
    const detected = detectPII(text);

    expect(detected.ipAddress).toBeDefined();
    expect(detected.ipAddress).toContain('192.168.1.1');
  });

  it('should detect dates of birth', () => {
    const text = 'DOB: 01/15/1990';
    const detected = detectPII(text);

    expect(detected.dob).toBeDefined();
    expect(detected.dob).toContain('01/15/1990');
  });

  it('should detect street addresses', () => {
    const text = 'Live at 123 Main Street';
    const detected = detectPII(text);

    expect(detected.streetAddress).toBeDefined();
    expect(detected.streetAddress).toContain('123 Main Street');
  });

  it('should detect ZIP codes', () => {
    const text = 'ZIP: 90210 or 12345-6789';
    const detected = detectPII(text);

    expect(detected.zipCode).toBeDefined();
    expect(detected.zipCode).toContain('90210');
  });

  it('should return empty object for text without PII', () => {
    const text = 'This is a normal text without any PII';
    const detected = detectPII(text);

    expect(Object.keys(detected).length).toBe(0);
  });

  it('should remove duplicate matches', () => {
    const text = 'Email: test@example.com and test@example.com';
    const detected = detectPII(text);

    expect(detected.email).toBeDefined();
    expect(detected.email.length).toBe(1);
  });
});

// ============================================================================
// PII Redaction Tests
// ============================================================================

describe('redactPII', () => {
  it('should redact email addresses', () => {
    const text = 'Contact me at john@example.com';
    const redacted = redactPII(text);

    expect(redacted).not.toContain('john@example.com');
    expect(redacted).toContain('[REDACTED]');
  });

  it('should redact phone numbers', () => {
    const text = 'Call me at (555) 123-4567';
    const redacted = redactPII(text);

    expect(redacted).not.toContain('555');
    expect(redacted).toContain('[REDACTED]');
  });

  it('should redact credit card numbers', () => {
    const text = 'Card: 1234-5678-9012-3456';
    const redacted = redactPII(text);

    expect(redacted).not.toContain('1234');
    expect(redacted).toContain('[REDACTED]');
  });

  it('should redact SSN', () => {
    const text = 'SSN: 123-45-6789';
    const redacted = redactPII(text);

    expect(redacted).not.toContain('123-45-6789');
    expect(redacted).toContain('[REDACTED]');
  });

  it('should preserve email when option is set', () => {
    const text = 'Email: john@example.com';
    const redacted = redactPII(text, { preserveEmail: true });

    expect(redacted).toContain('john@example.com');
  });

  it('should preserve phone when option is set', () => {
    const text = 'Phone: (555) 123-4567';
    const redacted = redactPII(text, { preservePhone: true });

    expect(redacted).toContain('555');
  });

  it('should apply custom patterns', () => {
    const text = 'Code: ABC123XYZ';
    const redacted = redactPII(text, {
      customPatterns: [
        { name: 'code', pattern: /ABC\d+XYZ/g },
      ],
    });

    expect(redacted).not.toContain('ABC123XYZ');
    expect(redacted).toContain('[REDACTED]');
  });

  it('should redact multiple PII types in same text', () => {
    const text = 'Email: test@example.com, Phone: 555-123-4567, SSN: 123-45-6789';
    const redacted = redactPII(text);

    expect(redacted).not.toContain('test@example.com');
    expect(redacted).not.toContain('555-123-4567');
    expect(redacted).not.toContain('123-45-6789');
    expect(redacted.split('[REDACTED]').length).toBeGreaterThan(3);
  });
});

// ============================================================================
// Message Redaction Tests
// ============================================================================

describe('redactMessages', () => {
  it('should redact PII from all messages', () => {
    const messages = [
      { role: 'user', content: 'My email is test@example.com' },
      { role: 'assistant', content: 'I can help you. Call me at 555-123-4567' },
    ];

    const redacted = redactMessages(messages);

    expect(redacted[0].content).not.toContain('test@example.com');
    expect(redacted[1].content).not.toContain('555-123-4567');
  });

  it('should preserve message roles', () => {
    const messages = [
      { role: 'system', content: 'You are helpful' },
      { role: 'user', content: 'Email: test@example.com' },
    ];

    const redacted = redactMessages(messages);

    expect(redacted[0].role).toBe('system');
    expect(redacted[1].role).toBe('user');
  });

  it('should apply options to all messages', () => {
    const messages = [
      { role: 'user', content: 'Email: test@example.com' },
    ];

    const redacted = redactMessages(messages, { preserveEmail: true });

    expect(redacted[0].content).toContain('test@example.com');
  });
});

// ============================================================================
// Object Redaction Tests
// ============================================================================

describe('redactObject', () => {
  it('should redact PII from string values', () => {
    const obj = {
      name: 'John',
      email: 'john@example.com',
    };

    const redacted = redactObject(obj);

    expect(redacted.name).toBe('John');
    expect(redacted.email).not.toContain('john@example.com');
    expect(redacted.email).toContain('[REDACTED]');
  });

  it('should redact PII from nested objects', () => {
    const obj = {
      user: {
        email: 'test@example.com',
        profile: {
          phone: '555-123-4567',
        },
      },
    };

    const redacted = redactObject(obj);

    expect(redacted.user.email).not.toContain('test@example.com');
    expect(redacted.user.profile.phone).not.toContain('555');
  });

  it('should redact PII from arrays', () => {
    const obj = {
      emails: ['test1@example.com', 'test2@example.com'],
    };

    const redacted = redactObject(obj);

    expect(redacted.emails[0]).not.toContain('test1@example.com');
    expect(redacted.emails[1]).not.toContain('test2@example.com');
  });

  it('should preserve non-string values', () => {
    const obj = {
      count: 42,
      active: true,
      data: null,
    };

    const redacted = redactObject(obj);

    expect(redacted.count).toBe(42);
    expect(redacted.active).toBe(true);
    expect(redacted.data).toBe(null);
  });
});

// ============================================================================
// Context-Aware Redaction Tests
// ============================================================================

describe('redactWithContext', () => {
  it('should preserve contact info for CV context', () => {
    const text = 'Email: test@example.com, Phone: 555-123-4567, SSN: 123-45-6789';
    const redacted = redactWithContext(text, 'cv');

    expect(redacted).toContain('test@example.com');
    expect(redacted).toContain('555-123-4567');
    expect(redacted).not.toContain('123-45-6789'); // SSN always redacted
  });

  it('should redact most PII for application context', () => {
    const text = 'Email: test@example.com, Phone: 555-123-4567';
    const redacted = redactWithContext(text, 'application');

    expect(redacted).not.toContain('test@example.com');
    expect(redacted).not.toContain('555-123-4567');
  });

  it('should redact all PII for general context', () => {
    const text = 'Email: test@example.com, Phone: 555-123-4567';
    const redacted = redactWithContext(text, 'general');

    expect(redacted).not.toContain('test@example.com');
    expect(redacted).not.toContain('555-123-4567');
  });
});

// ============================================================================
// Validation Tests
// ============================================================================

describe('validateNoPII', () => {
  it('should return valid for text without PII', () => {
    const text = 'This is normal text';
    const result = validateNoPII(text);

    expect(result.valid).toBe(true);
    expect(Object.keys(result.detected).length).toBe(0);
  });

  it('should return invalid for text with PII', () => {
    const text = 'Email: test@example.com';
    const result = validateNoPII(text);

    expect(result.valid).toBe(false);
    expect(result.detected.email).toBeDefined();
  });
});

describe('assertNoPII', () => {
  it('should not throw for text without PII', () => {
    expect(() => assertNoPII('Normal text')).not.toThrow();
  });

  it('should throw for text with PII', () => {
    expect(() => assertNoPII('Email: test@example.com')).toThrow();
  });

  it('should include context in error message', () => {
    try {
      assertNoPII('Email: test@example.com', 'test context');
    } catch (error) {
      expect((error as Error).message).toContain('test context');
    }
  });
});
