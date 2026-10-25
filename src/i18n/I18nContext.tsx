import {
  type AddressDetails,
  type AddressFormatOptions,
  type CurrencyFormatOptions,
  type DateFormatOptions,
  DEFAULT_LOCALE,
  detectLocale,
  getLanguageDirection,
  SUPPORTED_LOCALES,
  type SupportedLocale,
  formatAddress as sharedFormatAddress,
  formatCurrency as sharedFormatCurrency,
  formatDate as sharedFormatDate,
  formatPhoneNumber as sharedFormatPhoneNumber,
  formatRelativeTime as sharedFormatRelativeTime,
  isRTL as sharedIsRTL,
  type TextDirection,
  type TranslationDictionary,
} from '@nextjob/shared';
import type React from 'react';
import { createContext, useCallback, useEffect, useState } from 'react';
import { translations } from './translations.js';

export interface I18nContextValue {
  locale: SupportedLocale;
  dir: TextDirection;
  isRTL: boolean;
  setLocale: (newLocale: SupportedLocale) => void;
  t: (key: string, fallback?: string) => string;
  formatDate: (date: Date | string | number, options?: DateFormatOptions) => string;
  formatRelativeTime: (
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    options?: Intl.RelativeTimeFormatOptions
  ) => string;
  formatCurrency: (amount: number, options?: CurrencyFormatOptions) => string;
  formatAddress: (address: AddressDetails, options?: AddressFormatOptions) => string;
  formatPhoneNumber: (
    phoneNumber: string,
    options?: { format?: 'international' | 'national' | 'e164' }
  ) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'nextjob_locale_preference';

export const I18nProvider: React.FC<{
  children: React.ReactNode;
  initialLocale?: SupportedLocale;
}> = ({ children, initialLocale }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    if (initialLocale) return initialLocale;
    let saved: string | null = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        saved = localStorage.getItem(STORAGE_KEY);
      }
    } catch (_e) {
      // Ignore storage errors
    }
    const navLangs = typeof navigator !== 'undefined' ? navigator.languages : undefined;
    return detectLocale(saved, navLangs);
  });

  const dir = getLanguageDirection(locale);
  const isRTL = sharedIsRTL(locale);

  // Sync html dir and lang attributes on locale change
  useEffect(() => {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('dir', dir);
      document.documentElement.setAttribute('lang', locale);
    }
  }, [locale, dir]);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    if (newLocale in SUPPORTED_LOCALES) {
      setLocaleState(newLocale);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(STORAGE_KEY, newLocale);
        }
      } catch (_e) {
        // Ignore storage errors
      }
    }
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const activeDict = translations[locale] || translations[DEFAULT_LOCALE];
      const fallbackDict = translations[DEFAULT_LOCALE];

      const resolveKey = (dict: TranslationDictionary, path: string[]): string | undefined => {
        let current: TranslationDictionary | string | undefined = dict;
        for (const segment of path) {
          if (!current || typeof current !== 'object') return undefined;
          current = current[segment];
        }
        return typeof current === 'string' ? current : undefined;
      };

      const path = key.split('.');
      const val = resolveKey(activeDict, path) ?? resolveKey(fallbackDict, path);
      return val ?? fallback ?? key;
    },
    [locale]
  );

  const formatDate = useCallback(
    (date: Date | string | number, options?: DateFormatOptions) =>
      sharedFormatDate(date, locale, options),
    [locale]
  );

  const formatRelativeTime = useCallback(
    (value: number, unit: Intl.RelativeTimeFormatUnit, options?: Intl.RelativeTimeFormatOptions) =>
      sharedFormatRelativeTime(value, unit, locale, options),
    [locale]
  );

  const formatCurrency = useCallback(
    (amount: number, options?: CurrencyFormatOptions) =>
      sharedFormatCurrency(amount, locale, options),
    [locale]
  );

  const formatAddress = useCallback(
    (address: AddressDetails, options?: AddressFormatOptions) =>
      sharedFormatAddress(address, locale, options),
    [locale]
  );

  const formatPhoneNumber = useCallback(
    (phoneNumber: string, options?: { format?: 'international' | 'national' | 'e164' }) =>
      sharedFormatPhoneNumber(phoneNumber, locale, options),
    [locale]
  );

  const contextValue: I18nContextValue = {
    locale,
    dir,
    isRTL,
    setLocale,
    t,
    formatDate,
    formatRelativeTime,
    formatCurrency,
    formatAddress,
    formatPhoneNumber,
  };

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
};
