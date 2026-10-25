export interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export const PUBLIC_PAGES: SitemapEntry[] = [
  { url: '/', lastmod: '2026-01-15', changefreq: 'weekly', priority: 1.0 },
  { url: '/privacy', lastmod: '2026-01-15', changefreq: 'yearly', priority: 0.3 },
  { url: '/terms', lastmod: '2026-01-15', changefreq: 'yearly', priority: 0.3 },
  { url: '/login', lastmod: '2026-01-15', changefreq: 'monthly', priority: 0.5 },
  { url: '/signup', lastmod: '2026-01-15', changefreq: 'monthly', priority: 0.7 },
  { url: '/forgot-password', lastmod: '2026-01-15', changefreq: 'yearly', priority: 0.3 },
];

export function getPublicPages(): SitemapEntry[] {
  return PUBLIC_PAGES;
}

export function generateSitemapXml(baseUrl: string = 'https://nextjob.ai'): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');

  const urlsXml = PUBLIC_PAGES.map((page) => {
    const fullUrl = `${cleanBase}${page.url}`;
    return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority.toFixed(1)}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;
}

export interface SearchConsoleSubmissionResult {
  success: boolean;
  sitemapUrl: string;
  pingUrl: string;
  status?: number;
  message: string;
}

export async function submitSitemapToSearchConsole(
  sitemapUrl: string = 'https://nextjob.ai/sitemap.xml'
): Promise<SearchConsoleSubmissionResult> {
  const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
  try {
    const response = await fetch(pingUrl, { method: 'GET' });
    return {
      success: response.ok,
      sitemapUrl,
      pingUrl,
      status: response.status,
      message: response.ok
        ? 'Sitemap successfully submitted to Google Search Console ping endpoint.'
        : `Ping failed with status ${response.status}`,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      sitemapUrl,
      pingUrl,
      message: `Failed to ping Google Search Console: ${errorMessage}`,
    };
  }
}

export default function sitemap() {
  return PUBLIC_PAGES.map((page) => ({
    url: `https://nextjob.ai${page.url}`,
    lastModified: new Date(page.lastmod),
    changeFrequency: page.changefreq,
    priority: page.priority,
  }));
}
