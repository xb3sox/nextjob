export interface RobotPolicy {
  userAgent: string;
  allow?: string | string[];
  disallow?: string | string[];
}

export interface RobotsConfig {
  rules: RobotPolicy[];
  sitemap: string;
  host?: string;
}

export const AI_BOTS: string[] = [
  'GPTBot',
  'ChatGPT-User',
  'CCBot',
  'Google-Extended',
  'Omgilibot',
  'Omgili',
  'YouBot',
  'ClaudeBot',
  'FacebookBot',
];

export const LEGITIMATE_CRAWLERS: string[] = ['Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot'];

export function getRobotsConfig(baseUrl: string = 'https://nextjob.ai'): RobotsConfig {
  const cleanBase = baseUrl.replace(/\/+$/, '');

  const rules: RobotPolicy[] = [
    {
      userAgent: '*',
      allow: '/',
    },
    ...AI_BOTS.map((bot) => ({
      userAgent: bot,
      disallow: '/',
    })),
    ...LEGITIMATE_CRAWLERS.map((crawler) => ({
      userAgent: crawler,
      allow: '/',
    })),
  ];

  return {
    rules,
    sitemap: `${cleanBase}/sitemap.xml`,
    host: cleanBase,
  };
}

export function generateRobotsTxt(baseUrl: string = 'https://nextjob.ai'): string {
  const config = getRobotsConfig(baseUrl);

  let txt = '# NextJob robots.txt\n';
  txt += `# ${config.host}\n\n`;

  // Default User-agent: *
  txt += 'User-agent: *\nAllow: /\n\n';

  // Block AI training bots
  txt += '# Block AI training bots\n';
  for (const bot of AI_BOTS) {
    txt += `User-agent: ${bot}\nDisallow: /\n\n`;
  }

  // Allow legitimate crawlers
  txt += '# Allow legitimate crawlers\n';
  for (const crawler of LEGITIMATE_CRAWLERS) {
    txt += `User-agent: ${crawler}\nAllow: /\n\n`;
  }

  // Sitemap link
  txt += `# Sitemap\nSitemap: ${config.sitemap}\n`;

  return txt;
}

export default function robots() {
  const config = getRobotsConfig();
  return {
    rules: config.rules.map((rule) => ({
      userAgent: rule.userAgent,
      allow: rule.allow,
      disallow: rule.disallow,
    })),
    sitemap: config.sitemap,
  };
}
