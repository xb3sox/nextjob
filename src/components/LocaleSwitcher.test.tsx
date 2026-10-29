import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { I18nProvider, useI18n } from '../i18n';
import LocaleSwitcher from './LocaleSwitcher';

const TestContainer = () => {
  const { locale, isRTL, dir, t } = useI18n();
  return (
    <div>
      <LocaleSwitcher />
      <span data-testid="locale">{locale}</span>
      <span data-testid="isRTL">{isRTL ? 'true' : 'false'}</span>
      <span data-testid="dir">{dir}</span>
      <span data-testid="welcome">{t('common.welcome')}</span>
    </div>
  );
};

describe('LocaleSwitcher component', () => {
  it('renders locale options and switches locale correctly', () => {
    const { getByTestId, getByRole } = render(
      <I18nProvider initialLocale="en-US">
        <TestContainer />
      </I18nProvider>
    );

    expect(getByTestId('locale').textContent).toBe('en-US');
    expect(getByTestId('isRTL').textContent).toBe('false');

    const select = getByRole('combobox');
    expect(select.className).toContain('focus-visible:ring-moss');

    fireEvent.change(select, { target: { value: 'ar-SA' } });

    expect(getByTestId('locale').textContent).toBe('ar-SA');
    expect(getByTestId('isRTL').textContent).toBe('true');
    expect(getByTestId('dir').textContent).toBe('rtl');
    expect(getByTestId('welcome').textContent).toBe('مرحباً بعودتك');
  });
});
