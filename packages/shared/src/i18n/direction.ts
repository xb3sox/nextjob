import { RTL_LANGUAGES, SUPPORTED_LOCALES } from './config.js';
import type { TextDirection } from './types.js';

/**
 * Returns whether a given locale or language code uses Right-To-Left direction.
 */
export function isRTL(localeCode: string): boolean {
  if (!localeCode) return false;
  const lang = localeCode.split('-')[0].toLowerCase();
  if (localeCode in SUPPORTED_LOCALES) {
    return SUPPORTED_LOCALES[localeCode as keyof typeof SUPPORTED_LOCALES].dir === 'rtl';
  }
  return RTL_LANGUAGES.has(lang);
}

/**
 * Returns 'rtl' or 'ltr' direction for a given locale.
 */
export function getLanguageDirection(localeCode: string): TextDirection {
  return isRTL(localeCode) ? 'rtl' : 'ltr';
}
