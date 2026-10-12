import { describe, it, expect } from 'vitest';
import { isSafeInternalPath, safeReturnPath } from '@/lib/redirect';

describe('safeReturnPath', () => {
  it('accepts same-origin absolute paths', () => {
    expect(safeReturnPath('/dashboard')).toBe('/dashboard');
    expect(safeReturnPath('/jobs/123?q=a')).toBe('/jobs/123?q=a');
  });

  it('rejects protocol-relative and absolute URLs (open redirect)', () => {
    expect(safeReturnPath('//evil.com')).toBe('/dashboard');
    expect(safeReturnPath('/\\evil.com')).toBe('/dashboard');
    expect(safeReturnPath('https://evil.com')).toBe('/dashboard');
    expect(safeReturnPath(null)).toBe('/dashboard');
    expect(safeReturnPath(undefined)).toBe('/dashboard');
  });

  it('rejects in-page anchors captured by the router hash', () => {
    // Landing CTAs like href="#waitlist" become location.hash on navigation.
    expect(safeReturnPath({ pathname: '/signup', ...{} , })).toBe('/dashboard');
    expect(isSafeInternalPath('/#pricing')).toBe(false);
    expect(isSafeInternalPath('/jobs#top')).toBe(false);
  });
});
