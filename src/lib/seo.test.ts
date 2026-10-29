/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { applyRouteMeta, isPrivateRoute, normalizeCanonicalPath } from './seo';

describe('SEO & Route Meta (T-66)', () => {
  beforeEach(() => {
    // Reset document.head before each test
    document.head.innerHTML = `
      <title>NextJob</title>
      <link rel="canonical" href="https://nextjob.ai/" />
      <link rel="alternate" hreflang="en" href="https://nextjob.ai/" />
      <link rel="alternate" hreflang="x-default" href="https://nextjob.ai/" />
    `;
  });

  afterEach(() => {
    document.head.innerHTML = '';
  });

  describe('normalizeCanonicalPath', () => {
    it('normalizes root path', () => {
      expect(normalizeCanonicalPath('/')).toBe('/');
      expect(normalizeCanonicalPath('')).toBe('/');
    });

    it('strips query parameters and hashes', () => {
      expect(normalizeCanonicalPath('/privacy?x=1&utm_source=test')).toBe('/privacy');
      expect(normalizeCanonicalPath('/terms#section-1')).toBe('/terms');
      expect(normalizeCanonicalPath('/privacy/?foo=bar#hash')).toBe('/privacy');
    });

    it('strips trailing slashes from subpaths', () => {
      expect(normalizeCanonicalPath('/privacy/')).toBe('/privacy');
      expect(normalizeCanonicalPath('/dashboard///')).toBe('/dashboard');
    });
  });

  describe('isPrivateRoute', () => {
    it('identifies private dashboard and auth routes', () => {
      expect(isPrivateRoute('/dashboard')).toBe(true);
      expect(isPrivateRoute('/login')).toBe(true);
      expect(isPrivateRoute('/signup')).toBe(true);
      expect(isPrivateRoute('/forgot-password')).toBe(true);
      expect(isPrivateRoute('/reset-password')).toBe(true);
      expect(isPrivateRoute('/auth/callback')).toBe(true);
      expect(isPrivateRoute('/auth/v1/verify')).toBe(true);
    });

    it('identifies public landing, legal, and other routes', () => {
      expect(isPrivateRoute('/')).toBe(false);
      expect(isPrivateRoute('/privacy')).toBe(false);
      expect(isPrivateRoute('/terms')).toBe(false);
      expect(isPrivateRoute('/pricing')).toBe(false);
    });
  });

  describe('applyRouteMeta', () => {
    it('updates canonical and hreflang tags for a public route (/privacy)', () => {
      applyRouteMeta('/privacy');

      const canonicals = document.head.querySelectorAll('link[rel="canonical"]');
      expect(canonicals.length).toBe(1);
      expect(canonicals[0].getAttribute('href')).toBe('https://nextjob.ai/privacy');

      const enAlts = document.head.querySelectorAll('link[rel="alternate"][hreflang="en"]');
      expect(enAlts.length).toBe(1);
      expect(enAlts[0].getAttribute('href')).toBe('https://nextjob.ai/privacy');

      const xDefAlts = document.head.querySelectorAll(
        'link[rel="alternate"][hreflang="x-default"]'
      );
      expect(xDefAlts.length).toBe(1);
      expect(xDefAlts[0].getAttribute('href')).toBe('https://nextjob.ai/privacy');

      const robots = document.head.querySelector('meta[name="robots"]');
      expect(robots).not.toBeNull();
      expect(robots?.getAttribute('content')).toBe('index, follow');
    });

    it('sets noindex, nofollow on private routes (/dashboard and auth routes)', () => {
      applyRouteMeta('/dashboard');

      const canonicals = document.head.querySelectorAll('link[rel="canonical"]');
      expect(canonicals.length).toBe(1);
      expect(canonicals[0].getAttribute('href')).toBe('https://nextjob.ai/dashboard');

      const robots = document.head.querySelector('meta[name="robots"]');
      expect(robots?.getAttribute('content')).toBe('noindex, nofollow');

      applyRouteMeta('/login');
      expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
        'noindex, nofollow'
      );

      applyRouteMeta('/auth/callback');
      expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
        'noindex, nofollow'
      );
    });

    it('ignores query strings and trailing slashes in canonical URL (/privacy/?x=1)', () => {
      applyRouteMeta('/privacy/?x=1');

      const canonicals = document.head.querySelectorAll('link[rel="canonical"]');
      expect(canonicals.length).toBe(1);
      expect(canonicals[0].getAttribute('href')).toBe('https://nextjob.ai/privacy');

      const enAlts = document.head.querySelectorAll('link[rel="alternate"][hreflang="en"]');
      expect(enAlts[0].getAttribute('href')).toBe('https://nextjob.ai/privacy');
    });

    it('handles root / correctly', () => {
      applyRouteMeta('/');

      const canonicals = document.head.querySelectorAll('link[rel="canonical"]');
      expect(canonicals.length).toBe(1);
      expect(canonicals[0].getAttribute('href')).toBe('https://nextjob.ai/');

      const robots = document.head.querySelector('meta[name="robots"]');
      expect(robots?.getAttribute('content')).toBe('index, follow');
    });

    it('replaces existing tags on successive calls rather than appending duplicates', () => {
      applyRouteMeta('/privacy');
      applyRouteMeta('/terms');
      applyRouteMeta('/dashboard');

      expect(document.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
      expect(document.head.querySelectorAll('link[rel="alternate"][hreflang="en"]').length).toBe(1);
      expect(
        document.head.querySelectorAll('link[rel="alternate"][hreflang="x-default"]').length
      ).toBe(1);
      expect(document.head.querySelectorAll('meta[name="robots"]').length).toBe(1);

      expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
        'https://nextjob.ai/dashboard'
      );
      expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
        'noindex, nofollow'
      );
    });
  });
});
