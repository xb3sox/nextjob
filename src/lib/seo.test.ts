/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  applyRouteMeta,
  DEFAULT_META,
  getRouteMetadata,
  isPrivateRoute,
  normalizeCanonicalPath,
} from './seo';

describe('SEO & Route Meta (T-66, T-67, FR-SEO-03, FR-SEO-06)', () => {
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

  describe('getRouteMetadata', () => {
    it('returns route metadata for known routes', () => {
      const privacyMeta = getRouteMetadata('/privacy');
      expect(privacyMeta.title).toBe('Privacy Policy — NextJob');
      expect(privacyMeta.description).toContain('evidence provenance');
      expect(privacyMeta.image).toBe('https://nextjob.ai/og-image.png');

      const dataHandlingMeta = getRouteMetadata('/data-handling');
      expect(dataHandlingMeta.title).toBe('Data Handling Transparency — NextJob');
      expect(dataHandlingMeta.description).toContain('plain-language transparency');
    });

    it('falls back to default metadata for unknown routes', () => {
      const unknownMeta = getRouteMetadata('/unknown-page');
      expect(unknownMeta).toEqual(DEFAULT_META);
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

    it('sets Twitter Card tags with summary_large_image, url, title, description, and image (T-67, FR-SEO-03)', () => {
      applyRouteMeta('/privacy');

      const getMeta = (key: string) =>
        document.head
          .querySelector(`meta[name="${key}"], meta[property="${key}"]`)
          ?.getAttribute('content');

      expect(getMeta('twitter:card')).toBe('summary_large_image');
      expect(getMeta('twitter:site')).toBe('@nextjob');
      expect(getMeta('twitter:creator')).toBe('@nextjob');
      expect(getMeta('twitter:url')).toBe('https://nextjob.ai/privacy');
      expect(getMeta('twitter:title')).toBe('Privacy Policy — NextJob');
      expect(getMeta('twitter:description')).toContain('evidence provenance');
      expect(getMeta('twitter:image')).toBe('https://nextjob.ai/og-image.png');
      expect(getMeta('twitter:image:alt')).toBe(
        'NextJob Privacy Policy — User data ownership and evidence protection.'
      );

      // Open Graph parity
      expect(getMeta('og:type')).toBe('website');
      expect(getMeta('og:url')).toBe('https://nextjob.ai/privacy');
      expect(getMeta('og:title')).toBe('Privacy Policy — NextJob');
      expect(getMeta('og:description')).toContain('evidence provenance');
      expect(getMeta('og:image')).toBe('https://nextjob.ai/og-image.png');
    });

    it('updates Twitter Card tags dynamically on route transition', () => {
      applyRouteMeta('/');
      const getMeta = (key: string) =>
        document.head
          .querySelector(`meta[name="${key}"], meta[property="${key}"]`)
          ?.getAttribute('content');

      expect(getMeta('twitter:title')).toBe('NextJob — Apply with Proof | AI Career Agent');
      expect(getMeta('twitter:url')).toBe('https://nextjob.ai/');

      applyRouteMeta('/data-handling');
      expect(getMeta('twitter:title')).toBe('Data Handling Transparency — NextJob');
      expect(getMeta('twitter:url')).toBe('https://nextjob.ai/data-handling');
      expect(document.title).toBe('Data Handling Transparency — NextJob');

      applyRouteMeta('/press-kit');
      expect(getMeta('twitter:title')).toBe('Press Kit & Media Resources — NextJob');
      expect(getMeta('twitter:url')).toBe('https://nextjob.ai/press-kit');

      // Verify no duplicates created
      const twitterCardTags = document.head.querySelectorAll(
        'meta[name="twitter:card"], meta[property="twitter:card"]'
      );
      expect(twitterCardTags.length).toBe(1);

      const twitterTitleTags = document.head.querySelectorAll(
        'meta[name="twitter:title"], meta[property="twitter:title"]'
      );
      expect(twitterTitleTags.length).toBe(1);
    });

    it('ignores query strings and trailing slashes in canonical URL (/privacy/?x=1)', () => {
      applyRouteMeta('/privacy/?x=1');

      const canonicals = document.head.querySelectorAll('link[rel="canonical"]');
      expect(canonicals.length).toBe(1);
      expect(canonicals[0].getAttribute('href')).toBe('https://nextjob.ai/privacy');

      const enAlts = document.head.querySelectorAll('link[rel="alternate"][hreflang="en"]');
      expect(enAlts.length).toBe(1);
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
