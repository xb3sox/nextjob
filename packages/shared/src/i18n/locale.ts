import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './config.js';
import type { SupportedLocale } from './types.js';

/**
 * Normalizes a locale tag string to a supported locale tag or fallback.
 */
export function normalizeLocale(localeTag?: string | null): SupportedLocale {
  if (!localeTag) return DEFAULT_LOCALE;

  const cleaned = localeTag.replace('_', '-').trim();
  if (cleaned in SUPPORTED_LOCALES) {
    return cleaned as SupportedLocale;
  }

  const lang = cleaned.split('-')[0].toLowerCase();
  for (const code of Object.keys(SUPPORTED_LOCALES)) {
    if (code.toLowerCase().startsWith(lang)) {
      return code as SupportedLocale;
    }
  }

  return DEFAULT_LOCALE;
}

/**
 * Detects best matching locale from user preferences, navigator languages, or fallback.
 */
export function detectLocale(
  userPreference?: string | null,
  navigatorLanguages?: readonly string[]
): SupportedLocale {
  if (userPreference) {
    const normalizedPref = normalizeLocale(userPreference);
    if (normalizedPref !== DEFAULT_LOCALE || userPreference.toLowerCase().startsWith('en')) {
      return normalizedPref;
    }
  }

  if (navigatorLanguages && navigatorLanguages.length > 0) {
    for (const lang of navigatorLanguages) {
      const normalized = normalizeLocale(lang);
      if (normalized !== DEFAULT_LOCALE || lang.toLowerCase().startsWith('en')) {
        return normalized;
      }
    }
  }

  return DEFAULT_LOCALE;
}
