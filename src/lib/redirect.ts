/**
 * Post-login redirect helpers.
 *
 * Guards against open-redirect vectors: only same-origin absolute paths are
 * accepted, and anchor targets produced by in-app `href="#…"` links (which
 * react-router captures into `location.hash`) are rejected so users aren't
 * bounced back to the landing page after signing in.
 *
 * Security considerations:
 * - Rejects ASCII control characters (0x00-0x1F, 0x7F) such as \t, \r, \n
 *   which browsers strip or normalize to protocol-relative URLs.
 * - Rejects URL-encoded slashes (%2f), backslashes (%5c), or double-encoding
 *   (%25) at the start of the path to prevent open redirect bypasses.
 * - Decodes URI components and validates the decoded path to ensure nested or
 *   encoded open-redirect payloads are caught.
 */

function hasControlChars(str: string): boolean {
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if ((code >= 0 && code <= 31) || code === 127) {
      return true;
    }
  }
  return false;
}

export function isSafeInternalPath(p: unknown): p is string {
  if (typeof p !== 'string') return false;

  // Reject ASCII control characters (0x00-0x1F, 0x7F) which can be used
  // for header injection or browser URL normalization bypasses.
  if (hasControlChars(p)) return false;

  // Reject in-page anchors
  if (p.includes('#')) return false;

  // Must start with a single forward slash and NOT be followed by /, \, whitespace,
  // or URL-encoded slashes/backslashes/percent signs.
  if (!/^\/(?!\/|\\|\s)/.test(p)) return false;

  // Reject URL-encoded slashes (%2f), backslashes (%5c), or double-encoded (%25) at start
  if (/^\/(?:%2f|%5c|%25)/i.test(p)) return false;

  // Validate the URI-decoded path to prevent double-encoding or encoded bypasses
  try {
    const decoded = decodeURIComponent(p);
    if (hasControlChars(decoded)) return false;
    if (!/^\/(?!\/|\\|\s)/.test(decoded)) return false;
  } catch {
    // Malformed URI encoding
    return false;
  }

  return true;
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
