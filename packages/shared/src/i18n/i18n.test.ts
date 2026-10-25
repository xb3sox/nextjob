import { describe, expect, it } from 'vitest';
import {
  detectLocale,
  formatAddress,
  formatCurrency,
  formatDate,
  formatPhoneNumber,
  formatRelativeTime,
  getLanguageDirection,
  isRTL,
  normalizeLocale,
} from './index.js';

describe('Localization infrastructure (packages/shared/src/i18n)', () => {
  describe('Locale detection and normalization', () => {
    it('normalizes valid and messy locale codes', () => {
      expect(normalizeLocale('en-US')).toBe('en-US');
      expect(normalizeLocale('en_US')).toBe('en-US');
      expect(normalizeLocale('ar_SA')).toBe('ar-SA');
      expect(normalizeLocale('es')).toBe('es-ES');
      expect(normalizeLocale('he')).toBe('he-IL');
      expect(normalizeLocale('unknown-LOCALE')).toBe('en-US');
    });

    it('detects locale from user preferences or browser languages', () => {
      expect(detectLocale('ar-SA')).toBe('ar-SA');
      expect(detectLocale(null, ['es-ES', 'en-US'])).toBe('es-ES');
      expect(detectLocale(null, ['fr-FR'])).toBe('en-US');
    });
  });

  describe('Direction and RTL utilities', () => {
    it('identifies RTL locales correctly', () => {
      expect(isRTL('ar-SA')).toBe(true);
      expect(isRTL('he-IL')).toBe(true);
      expect(isRTL('en-US')).toBe(false);
      expect(isRTL('es-ES')).toBe(false);
    });

    it('returns text direction correctly', () => {
      expect(getLanguageDirection('ar-SA')).toBe('rtl');
      expect(getLanguageDirection('he-IL')).toBe('rtl');
      expect(getLanguageDirection('en-US')).toBe('ltr');
    });
  });

  describe('Date and Relative Time formatting', () => {
    it('formats dates in different locales', () => {
      const testDate = new Date('2026-03-31T12:00:00Z');
      const enFormatted = formatDate(testDate, 'en-US');
      const esFormatted = formatDate(testDate, 'es-ES');

      expect(enFormatted).toBeTruthy();
      expect(esFormatted).toBeTruthy();
    });

    it('formats relative time correctly', () => {
      const relTimeEn = formatRelativeTime(-3, 'day', 'en-US');
      expect(relTimeEn).toContain('3 days ago');
    });
  });

  describe('Currency formatting', () => {
    it('formats currency according to locale default currency', () => {
      const usdFormatted = formatCurrency(1250, 'en-US');
      const eurFormatted = formatCurrency(1250, 'es-ES');
      const sarFormatted = formatCurrency(1250, 'ar-SA');

      expect(usdFormatted).toContain('1,250.00');
      expect(eurFormatted).toContain('1250');
      expect(sarFormatted).toBeTruthy();
    });

    it('formats currency with custom explicit currency code', () => {
      const formatted = formatCurrency(500, 'en-US', { currency: 'EUR' });
      expect(formatted).toContain('500.00');
    });
  });

  describe('Address and Phone localization', () => {
    it('formats single-line and multi-line addresses correctly', () => {
      const addr = {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'USA',
      };

      const singleLine = formatAddress(addr, 'en-US', {
        style: 'single-line',
        includeCountry: true,
      });
      expect(singleLine).toBe('123 Main St, San Francisco, CA 94105, USA');

      const multiLine = formatAddress(addr, 'en-US', { style: 'multi-line', includeCountry: true });
      expect(multiLine).toBe('123 Main St\nSan Francisco, CA 94105\nUSA');
    });

    it('formats phone numbers into national and international formats', () => {
      const phone = '4155552671';
      expect(formatPhoneNumber(phone, 'en-US', { format: 'national' })).toBe('(415) 555-2671');
      expect(formatPhoneNumber(phone, 'en-US', { format: 'international' })).toBe(
        '+1 (415) 555-2671'
      );
      expect(formatPhoneNumber(phone, 'en-US', { format: 'e164' })).toBe('+14155552671');
    });
  });
});
