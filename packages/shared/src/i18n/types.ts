export type TextDirection = 'ltr' | 'rtl';

export type SupportedLocale = 'en-US' | 'ar-SA' | 'es-ES' | 'he-IL';

export type Locale = SupportedLocale | (string & {});

export interface LocaleMetadata {
  code: Locale;
  name: string;
  nativeName: string;
  dir: TextDirection;
  defaultCurrency: string;
  defaultCountry: string;
}

export type DateFormatOptions = Intl.DateTimeFormatOptions;

export interface CurrencyFormatOptions {
  currency?: string;
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useGrouping?: boolean;
}

export interface AddressDetails {
  street?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface AddressFormatOptions {
  style?: 'single-line' | 'multi-line';
  includeCountry?: boolean;
}

export interface PhoneFormatOptions {
  defaultCountryCode?: string;
  format?: 'international' | 'national' | 'e164';
}

export type TranslationDictionary = {
  [key: string]: string | TranslationDictionary;
};
