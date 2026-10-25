import { act, render, renderHook } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it } from 'vitest';
import { I18nProvider, useI18n } from './index.js';

describe('React i18n infrastructure (src/i18n)', () => {
  it('provides default locale (en-US) and formatting helpers', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <I18nProvider initialLocale="en-US">{children}</I18nProvider>
    );

    const { result } = renderHook(() => useI18n(), { wrapper });

    expect(result.current.locale).toBe('en-US');
    expect(result.current.dir).toBe('ltr');
    expect(result.current.isRTL).toBe(false);
    expect(result.current.t('common.appName')).toBe('NextJob');
    expect(result.current.formatCurrency(100)).toContain('100.00');
  });

  it('updates HTML document dir attribute when switching to an RTL locale', () => {
    const TestComponent = () => {
      const { locale, dir, isRTL, setLocale, t, formatCurrency } = useI18n();
      return (
        <div>
          <span data-testid="locale">{locale}</span>
          <span data-testid="dir">{dir}</span>
          <span data-testid="rtl">{isRTL ? 'true' : 'false'}</span>
          <span data-testid="app-name">{t('common.appName')}</span>
          <span data-testid="price">{formatCurrency(1500)}</span>
          <button type="button" onClick={() => setLocale('ar-SA')}>
            Switch to Arabic
          </button>
        </div>
      );
    };

    const { getByTestId, getByText } = render(
      <I18nProvider initialLocale="en-US">
        <TestComponent />
      </I18nProvider>
    );

    expect(getByTestId('locale').textContent).toBe('en-US');
    expect(getByTestId('dir').textContent).toBe('ltr');
    expect(getByTestId('rtl').textContent).toBe('false');
    expect(getByTestId('app-name').textContent).toBe('NextJob');

    act(() => {
      getByText('Switch to Arabic').click();
    });

    expect(getByTestId('locale').textContent).toBe('ar-SA');
    expect(getByTestId('dir').textContent).toBe('rtl');
    expect(getByTestId('rtl').textContent).toBe('true');
    expect(getByTestId('app-name').textContent).toBe('نِكست جوب');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    expect(document.documentElement.getAttribute('lang')).toBe('ar-SA');
  });
});
