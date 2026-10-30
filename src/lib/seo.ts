import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getStructuredDataJson } from './schema';

const CANONICAL_ORIGIN = 'https://nextjob.ai';

const PRIVATE_ROUTES = ['/dashboard', '/login', '/signup', '/forgot-password', '/reset-password'];

/**
 * Normalizes a route path or URL path string to a canonical path.
 * Strips query string, hash, and trailing slashes (except root '/').
 */
export function normalizeCanonicalPath(rawPath: string): string {
  // Strip query and hash if passed
  const pathOnly = rawPath.split('?')[0].split('#')[0];
  // Ensure starts with /
  const withLeading = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`;
  // Remove trailing slashes (unless root '/')
  const trimmed = withLeading.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

/**
 * Determines whether a given route is private and should not be indexed.
 */
export function isPrivateRoute(cleanPath: string): boolean {
  if (PRIVATE_ROUTES.includes(cleanPath)) {
    return true;
  }
  if (cleanPath.startsWith('/auth/')) {
    return true;
  }
  return false;
}

/**
 * Applies route-level SEO metadata to document.head:
 * - Exactly one link[rel="canonical"]
 * - Alternate links for hreflang="en" and hreflang="x-default"
 * - Robots meta tag (noindex, nofollow for private; index, follow for public)
 * - Structured data (JSON-LD) graph synced with schema definitions
 */
export function applyRouteMeta(pathname: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  const cleanPath = normalizeCanonicalPath(pathname);
  const canonicalUrl =
    cleanPath === '/' ? `${CANONICAL_ORIGIN}/` : `${CANONICAL_ORIGIN}${cleanPath}`;

  // 1. Canonical Link
  const existingCanonicals = Array.from(
    document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]')
  );

  let canonicalEl: HTMLLinkElement;
  if (existingCanonicals.length > 0) {
    canonicalEl = existingCanonicals[0];
    // Remove duplicates if any exist
    for (let i = 1; i < existingCanonicals.length; i++) {
      existingCanonicals[i].remove();
    }
  } else {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  // 2. Hreflang Alternates (en, x-default)
  const updateHreflang = (lang: string) => {
    const existing = Array.from(
      document.head.querySelectorAll<HTMLLinkElement>(`link[rel="alternate"][hreflang="${lang}"]`)
    );
    let el: HTMLLinkElement;
    if (existing.length > 0) {
      el = existing[0];
      for (let i = 1; i < existing.length; i++) {
        existing[i].remove();
      }
    } else {
      el = document.createElement('link');
      el.setAttribute('rel', 'alternate');
      el.setAttribute('hreflang', lang);
      document.head.appendChild(el);
    }
    el.setAttribute('href', canonicalUrl);
  };

  updateHreflang('en');
  updateHreflang('x-default');

  // 3. Robots Meta Tag
  const isPrivate = isPrivateRoute(cleanPath);
  const robotsContent = isPrivate ? 'noindex, nofollow' : 'index, follow';

  let robotsEl = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (!robotsEl) {
    robotsEl = document.createElement('meta');
    robotsEl.setAttribute('name', 'robots');
    document.head.appendChild(robotsEl);
  }
  robotsEl.setAttribute('content', robotsContent);

  // 4. Structured Data (JSON-LD) Script Block
  const ldJsonBlocks = Array.from(
    document.head.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')
  );
  let ldJsonEl: HTMLScriptElement;
  if (ldJsonBlocks.length > 0) {
    ldJsonEl = ldJsonBlocks[0];
    for (let i = 1; i < ldJsonBlocks.length; i++) {
      ldJsonBlocks[i].remove();
    }
  } else {
    ldJsonEl = document.createElement('script');
    ldJsonEl.setAttribute('type', 'application/ld+json');
    document.head.appendChild(ldJsonEl);
  }
  ldJsonEl.textContent = getStructuredDataJson();
}

/**
 * RouteMeta component listens to route transitions and updates document.head.
 */
export function RouteMeta(): null {
  const location = useLocation();

  useEffect(() => {
    applyRouteMeta(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
}
