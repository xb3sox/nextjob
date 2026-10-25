import type { PhoneFormatOptions } from './types.js';

/**
 * Formats a phone number according to specified format options.
 */
export function formatPhoneNumber(
  phoneNumber: string,
  _locale = 'en-US',
  options: PhoneFormatOptions = { format: 'international' }
): string {
  if (!phoneNumber) return '';

  // Clean raw digits
  const rawDigits = phoneNumber.replace(/\D/g, '');
  const hasLeadingPlus = phoneNumber.trim().startsWith('+');

  if (options.format === 'e164') {
    if (hasLeadingPlus) return `+${rawDigits}`;
    if (options.defaultCountryCode)
      return `+${options.defaultCountryCode.replace(/\D/g, '')}${rawDigits}`;
    if (rawDigits.length === 10) return `+1${rawDigits}`;
    return `+${rawDigits}`;
  }

  // Basic formatting for 10-digit North American style or 11-digit international style
  if (rawDigits.length === 10) {
    const area = rawDigits.slice(0, 3);
    const prefix = rawDigits.slice(3, 6);
    const line = rawDigits.slice(6);
    if (options.format === 'national') {
      return `(${area}) ${prefix}-${line}`;
    }
    const countryCode = options.defaultCountryCode
      ? `+${options.defaultCountryCode.replace(/\D/g, '')} `
      : '+1 ';
    return `${countryCode}(${area}) ${prefix}-${line}`;
  }

  if (rawDigits.length === 11 && rawDigits.startsWith('1')) {
    const area = rawDigits.slice(1, 4);
    const prefix = rawDigits.slice(4, 7);
    const line = rawDigits.slice(7);
    if (options.format === 'national') {
      return `(${area}) ${prefix}-${line}`;
    }
    return `+1 (${area}) ${prefix}-${line}`;
  }

  // Fallback string representation
  if (hasLeadingPlus) {
    return `+${rawDigits}`;
  }
  return phoneNumber;
}
