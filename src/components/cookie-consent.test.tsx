import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getHeatmapTracker } from '../lib/analytics/heatmaps';
import { CookieConsent } from './cookie-consent';

describe('CookieConsent Component (T-109)', () => {
  beforeEach(() => {
    localStorage.clear();
    getHeatmapTracker().clear();
  });

  it('renders consent banner when no prior consent is recorded', () => {
    render(<CookieConsent />);
    expect(
      screen.getByRole('complementary', { name: /privacy and cookie preferences/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /accept all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject optional/i })).toBeInTheDocument();
  });

  it('hides banner if consent was previously established in localStorage', () => {
    localStorage.setItem(
      'nextjob_cookie_consent',
      JSON.stringify({ analytics: true, sessionRecording: false, decidedAt: Date.now() })
    );

    render(<CookieConsent />);
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('accepts all consent and hides banner', () => {
    const onConsentChange = vi.fn();
    render(<CookieConsent onConsentChange={onConsentChange} />);

    fireEvent.click(screen.getByRole('button', { name: /accept all/i }));

    expect(onConsentChange).toHaveBeenCalledWith({ analytics: true, sessionRecording: true });
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    expect(getHeatmapTracker().hasRecordingConsent()).toBe(true);
    expect(getHeatmapTracker().hasAnalyticsConsent()).toBe(true);
  });

  it('rejects optional tracking on decline', () => {
    const onConsentChange = vi.fn();
    render(<CookieConsent onConsentChange={onConsentChange} />);

    fireEvent.click(screen.getByRole('button', { name: /reject optional/i }));

    expect(onConsentChange).toHaveBeenCalledWith({ analytics: false, sessionRecording: false });
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    expect(getHeatmapTracker().hasRecordingConsent()).toBe(false);
    expect(getHeatmapTracker().hasAnalyticsConsent()).toBe(false);
  });

  it('allows customizing specific preferences', () => {
    const onConsentChange = vi.fn();
    render(<CookieConsent onConsentChange={onConsentChange} />);

    fireEvent.click(screen.getByRole('button', { name: /customize/i }));
    expect(screen.getByRole('checkbox', { name: /product analytics/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /heatmaps & recording/i })).toBeInTheDocument();

    // Toggle recording on
    fireEvent.click(screen.getByRole('checkbox', { name: /heatmaps & recording/i }));
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }));

    expect(onConsentChange).toHaveBeenCalledWith({ analytics: true, sessionRecording: true });
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });
});
