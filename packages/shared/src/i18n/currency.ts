import { SUPPORTED_LOCALES } from './config.js';
import type { CurrencyFormatOptions } from './types.js';

// Internal cache for Intl.NumberFormat instances to avoid expensive re-creation
const numberFormatCache = new Map<string, Intl.NumberFormat>();
const MAX_CACHE_SIZE = 100;

function getNumberFormatter(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}:${JSON.stringify(options)}`;
  let formatter = numberFormatCache.get(key);
  if (!formatter) {
    if (numberFormatCache.size >= MAX_CACHE_SIZE) {
      numberFormatCache.clear();
    }
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatCache.set(key, formatter);
  }
  return formatter;
}

/**
 * Formats a numeric value as currency using Intl.NumberFormat according to locale and currency code.
 * Performance optimized with cached Intl.NumberFormat instances.
 */
export function formatCurrency(
  amount: number,
  locale = 'en-US',
  options: CurrencyFormatOptions = {}
): string {
  try {
    let currency = options.currency;
    if (!currency && locale in SUPPORTED_LOCALES) {
      currency = SUPPORTED_LOCALES[locale as keyof typeof SUPPORTED_LOCALES].defaultCurrency;
    }
    if (!currency) {
      currency = 'USD';
    }

    const numberFormatOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency,
      currencyDisplay: options.currencyDisplay,
      minimumFractionDigits: options.minimumFractionDigits,
      maximumFractionDigits: options.maximumFractionDigits,
      useGrouping: options.useGrouping,
    };

    return getNumberFormatter(locale, numberFormatOptions).format(amount);
  } catch (_err) {
    return `${amount}`;
  }
}
