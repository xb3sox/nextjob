import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Security Headers Configuration (T-94, FR-TECH-01)', () => {
  const rootDir = path.resolve(__dirname, '../../');

  it('configures all required security headers in vercel.json', () => {
    const vercelConfig = JSON.parse(fs.readFileSync(path.join(rootDir, 'vercel.json'), 'utf8'));

    const rootHeaders = vercelConfig.headers.find(
      (entry: { source: string }) => entry.source === '/(.*)'
    );
    expect(rootHeaders).toBeDefined();

    const headersMap = new Map<string, string>(
      rootHeaders.headers.map((h: { key: string; value: string }) => [h.key, h.value])
    );

    expect(headersMap.get('X-Frame-Options')).toBe('DENY');
    expect(headersMap.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headersMap.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headersMap.get('Strict-Transport-Security')).toContain('max-age=31536000');
    expect(headersMap.get('Strict-Transport-Security')).toContain('includeSubDomains');
    expect(headersMap.get('Strict-Transport-Security')).toContain('preload');
    expect(headersMap.get('Permissions-Policy')).toContain('camera=()');

    const csp = headersMap.get('Content-Security-Policy');
    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("form-action 'self'");
  });

  it('configures security headers in public/_headers for edge / static hosting', () => {
    const headersFile = fs.readFileSync(path.join(rootDir, 'public/_headers'), 'utf8');

    expect(headersFile).toContain('X-Frame-Options: DENY');
    expect(headersFile).toContain('X-Content-Type-Options: nosniff');
    expect(headersFile).toContain('Referrer-Policy: strict-origin-when-cross-origin');
    expect(headersFile).toContain('Strict-Transport-Security: max-age=31536000');
    expect(headersFile).toContain('Content-Security-Policy:');
    expect(headersFile).toContain("frame-ancestors 'none'");
  });

  it('configures development and preview server security headers in vite.config.js', () => {
    const viteConfig = fs.readFileSync(path.join(rootDir, 'vite.config.js'), 'utf8');

    expect(viteConfig).toContain("'X-Frame-Options': 'DENY'");
    expect(viteConfig).toContain("'X-Content-Type-Options': 'nosniff'");
    expect(viteConfig).toContain("'Content-Security-Policy'");
    expect(viteConfig).toContain('preview:');
  });
});
