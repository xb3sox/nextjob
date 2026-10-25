import { describe, expect, it, vi } from 'vitest';
import sitemap, {
  generateSitemapXml,
  getPublicPages,
  PUBLIC_PAGES,
  submitSitemapToSearchConsole,
} from './sitemap';

describe('sitemap', () => {
  it('includes all public pages in PUBLIC_PAGES', () => {
    const pages = getPublicPages();
    expect(pages).toHaveLength(6);

    const urls = pages.map((p) => p.url);
    expect(urls).toContain('/');
    expect(urls).toContain('/privacy');
    expect(urls).toContain('/terms');
    expect(urls).toContain('/login');
    expect(urls).toContain('/signup');
    expect(urls).toContain('/forgot-password');
  });

  it('assigns proper lastmod, changefreq, and priority attributes', () => {
    for (const page of PUBLIC_PAGES) {
      expect(page.lastmod).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']).toContain(
        page.changefreq
      );
      expect(page.priority).toBeGreaterThanOrEqual(0.0);
      expect(page.priority).toBeLessThanOrEqual(1.0);
    }
  });

  it('generates valid sitemap XML with sitemaps.org schema', () => {
    const xml = generateSitemapXml('https://nextjob.ai');
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://nextjob.ai/</loc>');
    expect(xml).toContain('<loc>https://nextjob.ai/privacy</loc>');
    expect(xml).toContain('<loc>https://nextjob.ai/terms</loc>');
    expect(xml).toContain('<loc>https://nextjob.ai/login</loc>');
    expect(xml).toContain('<loc>https://nextjob.ai/signup</loc>');
    expect(xml).toContain('<loc>https://nextjob.ai/forgot-password</loc>');
    expect(xml).toContain('</urlset>');
  });

  it('pings Google Search Console endpoint successfully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await submitSitemapToSearchConsole('https://nextjob.ai/sitemap.xml');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://www.google.com/ping?sitemap=https%3A%2F%2Fnextjob.ai%2Fsitemap.xml',
      { method: 'GET' }
    );
    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
    expect(result.sitemapUrl).toBe('https://nextjob.ai/sitemap.xml');

    vi.unstubAllGlobals();
  });

  it('handles Google Search Console submission errors gracefully', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('fetch', mockFetch);

    const result = await submitSitemapToSearchConsole('https://nextjob.ai/sitemap.xml');

    expect(result.success).toBe(false);
    expect(result.message).toContain('Network error');

    vi.unstubAllGlobals();
  });

  it('returns structured sitemap objects from default export', () => {
    const items = sitemap();
    expect(items).toHaveLength(PUBLIC_PAGES.length);
    expect(items[0]).toHaveProperty('url');
    expect(items[0]).toHaveProperty('lastModified');
    expect(items[0]).toHaveProperty('changeFrequency');
    expect(items[0]).toHaveProperty('priority');
  });
});
