import type { DateFormatOptions } from './types.js';

/**
 * Formats a date string, timestamp, or Date object according to the given locale and options.
 */
export function formatDate(
  date: Date | string | number,
  locale = 'en-US',
  options: DateFormatOptions = { dateStyle: 'medium' }
): string {
  try {
    const d = typeof date === 'object' && date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) {
      return '';
    }
    return new Intl.DateTimeFormat(locale, options).format(d);
  } catch (_err) {
    return String(date);
  }
}

/**
 * Formats a relative time value (e.g. "3 days ago") using Intl.RelativeTimeFormat.
 */
export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale = 'en-US',
  options: Intl.RelativeTimeFormatOptions = { numeric: 'auto' }
): string {
  try {
    return new Intl.RelativeTimeFormat(locale, options).format(value, unit);
  } catch (_err) {
    return `${value} ${unit}`;
  }
}
