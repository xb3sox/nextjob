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
  const candidate =
    typeof raw === 'string' ? raw : typeof raw === 'object' && raw !== null ? (raw as { pathname?: unknown }).pathname : undefined;
  return isSafeInternalPath(candidate) ? candidate : fallback;
}
