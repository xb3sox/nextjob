import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { I18nProvider } from '../i18n';
import { analytics } from '../lib/analytics';

function renderApp() {
  return render(
    <I18nProvider>
      <App />
    </I18nProvider>
  );
}

describe('Landing Page SEO & Analytics Integration (T-54, AC-14, AC-15)', () => {
  beforeEach(() => {
    analytics.clearEvents();
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    cleanup();
  });

  it('tracks initial page view on render without PII (AC-15)', () => {
    renderApp();

    const events = analytics.getEvents();
    const pageView = events.find((e) => e.type === 'page_view' && e.path === '/');

    expect(pageView).toBeDefined();
    expect(pageView?.sessionId).toBeDefined();
    expect(JSON.stringify(pageView)).not.toMatch(/@/);
  });

  it('tracks CTA clicks when user interacts with hero action (AC-15)', () => {
    renderApp();

    const cta = screen.getByRole('link', { name: /Start free — create your account/i });
    fireEvent.click(cta);

    const events = analytics.getEvents();
    const clickEvent = events.find(
      (e) => e.type === 'cta_click' && e.properties.ctaName === 'hero_signup'
    );

    expect(clickEvent).toBeDefined();
    expect(clickEvent?.properties.destination).toBe('/signup');
  });

  it('tracks pricing CTA clicks with correct plan identifiers', () => {
    renderApp();

    const searchPassCta = screen.getByRole('link', { name: /Start Search Pass/i });
    fireEvent.click(searchPassCta);

    const events = analytics.getEvents();
    const pricingClick = events.find(
      (e) => e.type === 'cta_click' && e.properties.ctaName === 'pricing_search_pass'
    );

    expect(pricingClick).toBeDefined();
    expect(pricingClick?.properties.destination).toBe('/signup');
  });

  it('verifies SEO requirements: semantic landmarks and heading hierarchy (AC-14)', () => {
    renderApp();

    // Semantic main landmark
    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark).toBeInTheDocument();
    expect(mainLandmark).toHaveAttribute('id', 'main-content');

    // Primary H1 heading
    const h1Heading = screen.getByRole('heading', { level: 1 });
    expect(h1Heading).toBeInTheDocument();

    // Navigation and footer landmarks
    const navs = screen.getAllByRole('navigation');
    expect(navs.length).toBeGreaterThanOrEqual(1);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });
});
