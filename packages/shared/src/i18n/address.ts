import type { AddressDetails, AddressFormatOptions } from './types.js';

/**
 * Formats address details according to locale and format style conventions.
 */
export function formatAddress(
  address: AddressDetails,
  locale = 'en-US',
  options: AddressFormatOptions = { style: 'single-line', includeCountry: true }
): string {
  const line1 = address.line1 || address.street || '';
  const line2 = address.line2 || '';
  const city = address.city || '';
  const state = address.state || '';
  const postalCode = address.postalCode || '';
  const country = options.includeCountry ? address.country || '' : '';

  const countryCode = locale.split('-')[1]?.toUpperCase() || 'US';

  if (options.style === 'multi-line') {
    const lines: string[] = [];
    if (line1) lines.push(line1);
    if (line2) lines.push(line2);

    // Domestic address conventions
    if (countryCode === 'US' || countryCode === 'CA') {
      const cityStateZip = [city, [state, postalCode].filter(Boolean).join(' ')]
        .filter(Boolean)
        .join(', ');
      if (cityStateZip) lines.push(cityStateZip);
    } else if (countryCode === 'GB' || countryCode === 'ES') {
      const cityPostal = [city, postalCode].filter(Boolean).join(' ');
      if (cityPostal) lines.push(cityPostal);
    } else {
      const cityStateZip = [postalCode, city, state].filter(Boolean).join(' ');
      if (cityStateZip) lines.push(cityStateZip);
    }

    if (country) lines.push(country);
    return lines.join('\n');
  }

  // Single-line format
  const parts: string[] = [];
  if (line1) parts.push(line1);
  if (line2) parts.push(line2);

  if (countryCode === 'US' || countryCode === 'CA') {
    const cityStateZip = [city, [state, postalCode].filter(Boolean).join(' ')]
      .filter(Boolean)
      .join(', ');
    if (cityStateZip) parts.push(cityStateZip);
  } else {
    const cityPostal = [postalCode, city, state].filter(Boolean).join(' ');
    if (cityPostal) parts.push(cityPostal);
  }

  if (country) parts.push(country);
  return parts.join(', ');
}
