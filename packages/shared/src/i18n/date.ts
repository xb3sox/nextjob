import type { DateFormatOptions } from './types.js';

// Internal caches for Intl formatters to avoid expensive re-creation
const dateTimeFormatCache = new Map<string, Intl.DateTimeFormat>();
const relativeTimeFormatCache = new Map<string, Intl.RelativeTimeFormat>();
const MAX_CACHE_SIZE = 100;

function getDateTimeFormatter(locale: string, options: DateFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}:${JSON.stringify(options)}`;
  let formatter = dateTimeFormatCache.get(key);
  if (!formatter) {
    if (dateTimeFormatCache.size >= MAX_CACHE_SIZE) {
      dateTimeFormatCache.clear();
    }
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormatCache.set(key, formatter);
  }
  return formatter;
}

function getRelativeTimeFormatter(
  locale: string,
  options: Intl.RelativeTimeFormatOptions
): Intl.RelativeTimeFormat {
  const key = `${locale}:${JSON.stringify(options)}`;
  let formatter = relativeTimeFormatCache.get(key);
  if (!formatter) {
    if (relativeTimeFormatCache.size >= MAX_CACHE_SIZE) {
      relativeTimeFormatCache.clear();
    }
    formatter = new Intl.RelativeTimeFormat(locale, options);
    relativeTimeFormatCache.set(key, formatter);
  }
  return formatter;
}

/**
 * Formats a date string, timestamp, or Date object according to the given locale and options.
 * Performance optimized with cached Intl.DateTimeFormat instances.
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
    return getDateTimeFormatter(locale, options).format(d);
  } catch (_err) {
    return String(date);
  }
}

/**
 * Formats a relative time value (e.g. "3 days ago") using Intl.RelativeTimeFormat.
 * Performance optimized with cached Intl.RelativeTimeFormat instances.
 */
export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale = 'en-US',
  options: Intl.RelativeTimeFormatOptions = { numeric: 'auto' }
): string {
  try {
    return getRelativeTimeFormatter(locale, options).format(value, unit);
  } catch (_err) {
    return `${value} ${unit}`;
  }
}
