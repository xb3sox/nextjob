import { SUPPORTED_LOCALES } from './config.js';
import type { CurrencyFormatOptions } from './types.js';

/**
 * Formats a numeric value as currency using Intl.NumberFormat according to locale and currency code.
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

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: options.currencyDisplay,
      minimumFractionDigits: options.minimumFractionDigits,
      maximumFractionDigits: options.maximumFractionDigits,
      useGrouping: options.useGrouping,
    }).format(amount);
  } catch (_err) {
    return `${amount}`;
  }
}
