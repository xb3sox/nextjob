import { describe, expect, it } from 'vitest';
import { isSafeInternalPath, safeReturnPath } from '@/lib/redirect';

describe('safeReturnPath', () => {
  it('accepts same-origin absolute paths', () => {
    expect(safeReturnPath('/dashboard')).toBe('/dashboard');
    expect(safeReturnPath('/jobs/123?q=a')).toBe('/jobs/123?q=a');
    expect(safeReturnPath('/foo%20bar')).toBe('/foo%20bar');
  });

  it('rejects protocol-relative and absolute URLs (open redirect)', () => {
    expect(safeReturnPath('//evil.com')).toBe('/dashboard');
    expect(safeReturnPath('/\\evil.com')).toBe('/dashboard');
    expect(safeReturnPath('https://evil.com')).toBe('/dashboard');
    expect(safeReturnPath(null)).toBe('/dashboard');
    expect(safeReturnPath(undefined)).toBe('/dashboard');
  });

  it('rejects control characters, tabs, and newlines in redirect targets', () => {
    expect(safeReturnPath('/\tevil.com')).toBe('/dashboard');
    expect(safeReturnPath('/\revil.com')).toBe('/dashboard');
    expect(safeReturnPath('/\nevil.com')).toBe('/dashboard');
    expect(safeReturnPath('/\0evil.com')).toBe('/dashboard');
    expect(isSafeInternalPath('/\t/evil.com')).toBe(false);
  });

  it('rejects URL-encoded slashes, backslashes, and double encoding', () => {
    expect(safeReturnPath('/%5Cevil.com')).toBe('/dashboard');
    expect(safeReturnPath('/%2fevil.com')).toBe('/dashboard');
    expect(safeReturnPath('/%252fevil.com')).toBe('/dashboard');
    expect(isSafeInternalPath('/%5C%5Cevil.com')).toBe(false);
  });

  it('rejects in-page anchors captured by the router hash', () => {
    // In-page anchors become location.hash on navigation.
    expect(safeReturnPath({ pathname: '/signup', hash: '#section' })).toBe('/dashboard');
    expect(isSafeInternalPath('/#pricing')).toBe(false);
    expect(isSafeInternalPath('/jobs#top')).toBe(false);
  });
});
