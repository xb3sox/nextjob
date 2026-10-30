import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getStructuredDataJson } from './schema';

const CANONICAL_ORIGIN = 'https://nextjob.ai';

const PRIVATE_ROUTES = ['/dashboard', '/login', '/signup', '/forgot-password', '/reset-password'];

export interface RouteMetadata {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

export const DEFAULT_META: RouteMetadata = {
  title: 'NextJob — Apply with Proof | AI Career Agent',
  description:
    'The trustworthy AI career agent that converts verified career evidence into eligible, high-quality applications.',
  image: 'https://nextjob.ai/og-image.png',
  imageAlt:
    'NextJob — Apply with Proof. AI career agent that turns verified career evidence into eligible, high-quality applications.',
};

export const ROUTE_METADATA: Record<string, RouteMetadata> = {
  '/': DEFAULT_META,
  '/privacy': {
    title: 'Privacy Policy — NextJob',
    description:
      'Learn how NextJob protects your career data with evidence provenance, zero hallucination constraints, and full user ownership.',
    image: 'https://nextjob.ai/og-image.png',
    imageAlt: 'NextJob Privacy Policy — User data ownership and evidence protection.',
  },
  '/terms': {
    title: 'Terms of Service — NextJob',
    description:
      'Read the NextJob terms of service regarding AI career agent assistance, evidence-constrained applications, and transparent data use.',
    image: 'https://nextjob.ai/og-image.png',
    imageAlt: 'NextJob Terms of Service — Transparent AI career assistance.',
  },
  '/data-handling': {
    title: 'Data Handling Transparency — NextJob',
    description:
      'Clear, plain-language transparency on how NextJob handles, protects, and permanently purges your career data.',
    image: 'https://nextjob.ai/og-image.png',
    imageAlt: 'NextJob Data Handling Transparency — Five pillars of career data safety.',
  },
  '/press-kit': {
    title: 'Press Kit & Media Resources — NextJob',
    description:
      'Official brand assets, mission background, product architecture details, and executive media contacts for NextJob.',
    image: 'https://nextjob.ai/og-image.png',
    imageAlt: 'NextJob Press Kit — Media assets and company background.',
  },
  '/tailor': {
    title: 'Evidence-Constrained Tailoring — NextJob',
    description:
      'Review and compare your verified career claims against job requirements before submitting applications.',
    image: 'https://nextjob.ai/og-image.png',
    imageAlt: 'NextJob Evidence-Constrained Tailoring — Grounded application builder.',
  },
  '/dashboard': {
    title: 'Candidate Dashboard — NextJob',
    description:
      'Manage your verified profile, track active applications, and monitor submission receipts.',
    image: 'https://nextjob.ai/og-image.png',
    imageAlt: 'NextJob Candidate Dashboard — Active job applications and receipts.',
  },
  '/applications': {
    title: 'Application Tracker — NextJob',
    description: 'Track the end-to-end lifecycle and submission receipts of your job applications.',
    image: 'https://nextjob.ai/og-image.png',
    imageAlt: 'NextJob Application Tracker — Audit trail and receipts.',
  },
  '/cohort-report': {
    title: 'Cohort Outcomes Report — NextJob',
    description: 'Verified aggregate outcomes and placement metrics across program cohorts.',
    image: 'https://nextjob.ai/og-image.png',
    imageAlt: 'NextJob Cohort Report — Aggregate career outcomes.',
  },
  '/admin': {
    title: 'Admin Console — NextJob',
    description: 'NextJob administration, connector health, and operations console.',
    image: 'https://nextjob.ai/og-image.png',
    imageAlt: 'NextJob Admin Console.',
  },
  '/login': {
    title: 'Sign In — NextJob',
    description: 'Sign in to your NextJob account.',
    image: 'https://nextjob.ai/og-image.png',
    imageAlt: 'NextJob Sign In.',
  },
  '/signup': {
    title: 'Create Account — NextJob',
    description: 'Create your NextJob account and start applying with verified proof.',
    image: 'https://nextjob.ai/og-image.png',
    imageAlt: 'NextJob Create Account.',
  },
  '/forgot-password': {
    title: 'Reset Password — NextJob',
    description: 'Reset your NextJob account password.',
    image: 'https://nextjob.ai/og-image.png',
    imageAlt: 'NextJob Password Reset.',
  },
  '/reset-password': {
    title: 'Set New Password — NextJob',
    description: 'Set a new password for your NextJob account.',
    image: 'https://nextjob.ai/og-image.png',
    imageAlt: 'NextJob Set New Password.',
  },
};

/**
 * Returns metadata definition for a route.
 */
export function getRouteMetadata(cleanPath: string): RouteMetadata {
  return ROUTE_METADATA[cleanPath] || DEFAULT_META;
}

/**
 * Normalizes a route path or URL path string to a canonical path.
 * Strips query string, hash, and trailing slashes (except root '/').
 */
export function normalizeCanonicalPath(rawPath: string): string {
  const pathOnly = rawPath.split('?')[0].split('#')[0];
  const withLeading = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`;
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
 * Updates or creates a meta tag in document.head matching either name or property.
 */
function setMetaTag(key: string, content: string, preferProperty = false): void {
  const existing = Array.from(
    document.head.querySelectorAll<HTMLMetaElement>(`meta[name="${key}"], meta[property="${key}"]`)
  );
  let el: HTMLMetaElement;
  if (existing.length > 0) {
    el = existing[0];
    for (let i = 1; i < existing.length; i++) {
      existing[i].remove();
    }
  } else {
    el = document.createElement('meta');
    el.setAttribute(preferProperty ? 'property' : 'name', key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Applies route-level SEO metadata to document.head:
 * - document.title and meta[name="description"]
 * - Exactly one link[rel="canonical"]
 * - Alternate links for hreflang="en" and hreflang="x-default"
 * - Robots meta tag (noindex, nofollow for private; index, follow for public)
 * - Twitter Card tags (summary_large_image, url, title, description, image, alt)
 * - Open Graph tags (og:type, og:url, og:title, og:description, og:image, og:image:alt)
 * - Structured data (JSON-LD) graph synced with schema definitions
 */
export function applyRouteMeta(pathname: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  const cleanPath = normalizeCanonicalPath(pathname);
  const canonicalUrl =
    cleanPath === '/' ? `${CANONICAL_ORIGIN}/` : `${CANONICAL_ORIGIN}${cleanPath}`;
  const meta = getRouteMetadata(cleanPath);

  // 1. Title and Description
  document.title = meta.title;
  setMetaTag('description', meta.description);

  // 2. Canonical Link
  const existingCanonicals = Array.from(
    document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]')
  );

  let canonicalEl: HTMLLinkElement;
  if (existingCanonicals.length > 0) {
    canonicalEl = existingCanonicals[0];
    for (let i = 1; i < existingCanonicals.length; i++) {
      existingCanonicals[i].remove();
    }
  } else {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  // 3. Hreflang Alternates (en, x-default)
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

  // 4. Robots Meta Tag
  const isPrivate = isPrivateRoute(cleanPath);
  const robotsContent = isPrivate ? 'noindex, nofollow' : 'index, follow';
  setMetaTag('robots', robotsContent);

  // 5. Twitter Card Tags (T-67, FR-SEO-03)
  setMetaTag('twitter:card', 'summary_large_image');
  setMetaTag('twitter:site', '@nextjob');
  setMetaTag('twitter:creator', '@nextjob');
  setMetaTag('twitter:url', canonicalUrl);
  setMetaTag('twitter:title', meta.title);
  setMetaTag('twitter:description', meta.description);
  setMetaTag('twitter:image', meta.image);
  setMetaTag('twitter:image:alt', meta.imageAlt);

  // 6. Open Graph Tags
  setMetaTag('og:type', 'website', true);
  setMetaTag('og:url', canonicalUrl, true);
  setMetaTag('og:title', meta.title, true);
  setMetaTag('og:description', meta.description, true);
  setMetaTag('og:image', meta.image, true);
  setMetaTag('og:image:alt', meta.imageAlt, true);

  // 7. Structured Data (JSON-LD) Script Block
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
