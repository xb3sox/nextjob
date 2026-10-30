import { beforeEach, describe, expect, it } from 'vitest';
import {
  analytics,
  getExperimentVariant,
  HERO_COPY_EXPERIMENT,
  sanitizeAnalyticsProperties,
} from './index';

describe('Analytics & SEO (T-54, FR-MKT-04, FR-MKT-05, FR-MKT-06)', () => {
  beforeEach(() => {
    analytics.clearEvents();
  });

  describe('Event Tracking (FR-MKT-05, AC-15)', () => {
    it('tracks page views accurately', () => {
      const event = analytics.trackPageView('/');
      expect(event.type).toBe('page_view');
      expect(event.path).toBe('/');
      expect(event.sessionId).toBeDefined();
      expect(analytics.getEvents()).toHaveLength(1);
    });

    it('tracks CTA clicks with destination', () => {
      const event = analytics.trackCtaClick('hero_signup', '/signup', { position: 'hero' });
      expect(event.type).toBe('cta_click');
      expect(event.properties.ctaName).toBe('hero_signup');
      expect(event.properties.destination).toBe('/signup');
      expect(event.properties.position).toBe('hero');
    });

    it('tracks signup and waitlist conversions', () => {
      analytics.trackConversion('signup_conversion', { source: 'landing_hero' });
      analytics.trackConversion('waitlist_conversion', { tier: 'general' });

      const events = analytics.getEvents();
      expect(events).toHaveLength(2);
      expect(events[0]?.type).toBe('signup_conversion');
      expect(events[1]?.type).toBe('waitlist_conversion');
    });

    it('tracks time on page duration', () => {
      const event = analytics.recordTimeOnPage('/applications');
      expect(event.type).toBe('time_on_page');
      expect(typeof event.properties.durationSeconds).toBe('number');
      expect(event.path).toBe('/applications');
    });

    it('detects session bounce if no CTA or conversion occurred', () => {
      // Clean tracker with no interaction
      const bounceEvent = analytics.recordSessionBounce();
      expect(bounceEvent).not.toBeNull();
      expect(bounceEvent?.type).toBe('session_bounce');
      expect(bounceEvent?.properties.singlePageVisit).toBe(true);

      // Now with CTA interaction
      analytics.clearEvents();
      analytics.trackCtaClick('hero_start');
      const nonBounce = analytics.recordSessionBounce();
      expect(nonBounce).toBeNull();
    });
  });

  describe('PII Sanitization (FR-MKT-05, AC-15)', () => {
    it('drops sensitive keys completely', () => {
      const dirty = {
        email: 'user@example.com',
        candidate_name: 'Jane Doe',
        password: 'secretpassword123',
        token: 'eyJh...',
        validProperty: 'landing_variant_a',
      };

      const clean = sanitizeAnalyticsProperties(dirty);
      expect(clean).toEqual({
        validProperty: 'landing_variant_a',
      });
      expect(clean.email).toBeUndefined();
      expect(clean.candidate_name).toBeUndefined();
      expect(clean.password).toBeUndefined();
      expect(clean.token).toBeUndefined();
    });

    it('redacts email addresses embedded in strings', () => {
      const dirty = {
        label: 'User signed up with alice.smith+work@gmail.com on mobile',
        referrer: 'https://mail.google.com/mail?user=bob@corp.internal',
      };

      const clean = sanitizeAnalyticsProperties(dirty);
      expect(clean.label).toBe('User signed up with [REDACTED_EMAIL] on mobile');
      expect(clean.referrer).toBe('https://mail.google.com/mail?user=[REDACTED_EMAIL]');
    });

    it('redacts phone numbers embedded in strings', () => {
      const dirty = {
        notes: 'Contact candidate at +1 (555) 234-5678 after 5pm',
      };

      const clean = sanitizeAnalyticsProperties(dirty);
      expect(clean.notes).toBe('Contact candidate at [REDACTED_PHONE] after 5pm');
    });

    it('sanitizes nested objects and arrays', () => {
      const dirty = {
        metadata: {
          userEmail: 'nested@domain.com',
          details: ['Call 555-123-4567', 'Safe text'],
        },
      };

      const clean = sanitizeAnalyticsProperties(dirty);
      expect(clean).toEqual({
        metadata: {
          userEmail: '[REDACTED_EMAIL]',
          details: ['Call [REDACTED_PHONE]', 'Safe text'],
        },
      });
    });
  });

  describe('A/B Testing Framework (FR-MKT-06)', () => {
    it('returns a valid configured variant', () => {
      const mockStorage: Storage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      };

      const variant = getExperimentVariant(HERO_COPY_EXPERIMENT, mockStorage);
      expect(HERO_COPY_EXPERIMENT.variants).toContain(variant);
    });

    it('reuses cached variant from storage for session consistency', () => {
      const mockStorage: Storage = {
        getItem: (key: string) => (key === 'nextjob_ab_hero_copy' ? 'variant_direct' : null),
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      };

      const variant = getExperimentVariant(HERO_COPY_EXPERIMENT, mockStorage);
      expect(variant).toBe('variant_direct');
    });
  });
});
