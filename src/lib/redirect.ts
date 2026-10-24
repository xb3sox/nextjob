/**
 * Post-login redirect helpers.
 *
 * Guards against open-redirect vectors: only same-origin absolute paths are
 * accepted, and anchor targets produced by in-app `href="#…"` links (which
 * react-router captures into `location.hash`) are rejected so users aren't
 * bounced back to the landing page after signing in.
 */

const INTERNAL_PATH_RE = /^\/(?!\/|\\)/;

export function isSafeInternalPath(p: unknown): p is string {
  return typeof p === 'string' && INTERNAL_PATH_RE.test(p) && !p.includes('#');
}

export function safeReturnPath(raw: unknown, fallback = '/dashboard'): string {
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as { pathname?: unknown; hash?: unknown };
    if (typeof obj.hash === 'string' && obj.hash.length > 0) {
      return fallback;
    }
    return isSafeInternalPath(obj.pathname) ? obj.pathname : fallback;
  }
  return isSafeInternalPath(raw) ? raw : fallback;
}
