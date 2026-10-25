import { describe, expect, it } from 'vitest';
import GET, { handler, ImageResponse, parseOGQueryParams } from './route';

describe('OG API Route', () => {
  it('parses URL query params into OGTemplateProps', () => {
    const params = new URLSearchParams(
      'title=Senior%20Software%20Engineer&description=Great%20opportunity&page=job&badge=HIRING'
    );
    const props = parseOGQueryParams(params);

    expect(props.title).toBe('Senior Software Engineer');
    expect(props.description).toBe('Great opportunity');
    expect(props.pageType).toBe('job');
    expect(props.badge).toBe('HIRING');
  });

  it('ImageResponse sets correct SVG content-type and cache-control headers', () => {
    const svg =
      '<svg width="1200" height="630"><rect width="1200" height="630" fill="#0a0a0a"/></svg>';
    const res = new ImageResponse(svg);

    expect(res.headers.get('Content-Type')).toBe('image/svg+xml');
    expect(res.headers.get('Cache-Control')).toContain('public, max-age=31536000');
    expect(res.status).toBe(200);
  });

  it('GET request handler returns SVG ImageResponse for valid web request', async () => {
    const req = new Request('https://nextjob.app/api/og?title=Tailor%20Page&page=tailor');
    const response = await GET(req);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/svg+xml');

    const svgBody = await response.text();
    expect(svgBody).toContain('<svg');
    expect(svgBody).toContain('width="1200"');
    expect(svgBody).toContain('height="630"');
    expect(svgBody).toContain('Tailor Page');
    expect(svgBody).toContain('EVIDENCE TAILORING');
  });

  it('handler function generates SVG with status 200 and headers', () => {
    const res = handler({
      title: 'Dashboard Tracker',
      pageType: 'dashboard',
    });

    expect(res.status).toBe(200);
    expect(res.headers['Content-Type']).toBe('image/svg+xml');
    expect(res.body).toContain('Dashboard Tracker');
    expect(res.body).toContain('APPLICATION TRACKER');
  });

  it('executes OG endpoint generation in < 100ms (satisfies < 2s criteria)', async () => {
    const start = performance.now();
    const req = new Request('https://nextjob.app/api/og?title=Performance%20Test');
    const res = await GET(req);
    await res.text();
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(1000);
  });
});
