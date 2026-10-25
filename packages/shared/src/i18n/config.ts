import type { LocaleMetadata, SupportedLocale } from './types.js';

export const DEFAULT_LOCALE: SupportedLocale = 'en-US';

export const SUPPORTED_LOCALES: Record<SupportedLocale, LocaleMetadata> = {
  'en-US': {
    code: 'en-US',
    name: 'English (US)',
    nativeName: 'English (US)',
    dir: 'ltr',
    defaultCurrency: 'USD',
    defaultCountry: 'US',
  },
  'ar-SA': {
    code: 'ar-SA',
    name: 'Arabic (Saudi Arabia)',
    nativeName: 'العربية',
    dir: 'rtl',
    defaultCurrency: 'SAR',
    defaultCountry: 'SA',
  },
  'es-ES': {
    code: 'es-ES',
    name: 'Spanish (Spain)',
    nativeName: 'Español',
    dir: 'ltr',
    defaultCurrency: 'EUR',
    defaultCountry: 'ES',
  },
  'he-IL': {
    code: 'he-IL',
    name: 'Hebrew (Israel)',
    nativeName: 'עברית',
    dir: 'rtl',
    defaultCurrency: 'ILS',
    defaultCountry: 'IL',
  },
};

export const RTL_LANGUAGES = new Set([
  'ar',
  'he',
  'fa',
  'ur',
  'arc',
  'dv',
  'khw',
  'ks',
  'ps',
  'yi',
]);
