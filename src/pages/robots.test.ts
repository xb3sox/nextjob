import { describe, expect, it } from 'vitest';
import robots, { AI_BOTS, generateRobotsTxt, getRobotsConfig, LEGITIMATE_CRAWLERS } from './robots';

describe('robots', () => {
  it('includes AI bots blocking rules in getRobotsConfig', () => {
    const config = getRobotsConfig('https://nextjob.ai');
    expect(config.sitemap).toBe('https://nextjob.ai/sitemap.xml');

    expect(AI_BOTS).toContain('GPTBot');
    expect(AI_BOTS).toContain('ClaudeBot');
    expect(AI_BOTS).toContain('CCBot');

    for (const bot of AI_BOTS) {
      const rule = config.rules.find((r) => r.userAgent === bot);
      expect(rule).toBeDefined();
      expect(rule?.disallow).toBe('/');
    }
  });

  it('allows legitimate search crawlers', () => {
    const config = getRobotsConfig('https://nextjob.ai');

    for (const crawler of LEGITIMATE_CRAWLERS) {
      const rule = config.rules.find((r) => r.userAgent === crawler);
      expect(rule).toBeDefined();
      expect(rule?.allow).toBe('/');
    }
  });

  it('generates formatted robots.txt with sitemap reference and bot rules', () => {
    const txt = generateRobotsTxt('https://nextjob.ai');

    expect(txt).toContain('User-agent: *');
    expect(txt).toContain('Allow: /');

    // Verify AI bots disallow
    expect(txt).toContain('User-agent: GPTBot\nDisallow: /');
    expect(txt).toContain('User-agent: ClaudeBot\nDisallow: /');
    expect(txt).toContain('User-agent: CCBot\nDisallow: /');

    // Verify legitimate crawlers allow
    expect(txt).toContain('User-agent: Googlebot\nAllow: /');
    expect(txt).toContain('User-agent: Bingbot\nAllow: /');

    // Verify sitemap link
    expect(txt).toContain('Sitemap: https://nextjob.ai/sitemap.xml');
  });

  it('returns valid object structure from default export function', () => {
    const result = robots();
    expect(result).toHaveProperty('rules');
    expect(result).toHaveProperty('sitemap', 'https://nextjob.ai/sitemap.xml');
    expect(result.rules.length).toBeGreaterThan(0);
  });
});
