import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const EXPECTED_DOMAINS = [
  'auth',
  'users',
  'profile',
  'jobs',
  'eligibility',
  'matches',
  'applications',
  'approvals',
  'organizations',
  'billing',
  'notifications',
  'admin',
  'privacy',
] as const;

describe('API Documentation Suite (T-43)', () => {
  const docsApiDir = path.resolve(process.cwd(), 'docs/api');
  const openApiFilePath = path.join(docsApiDir, 'openapi.json');
  const readmeFilePath = path.join(docsApiDir, 'README.md');

  it('verifies docs/api/README.md exists and covers all 13 domains', () => {
    expect(fs.existsSync(readmeFilePath)).toBe(true);
    const readmeContent = fs.readFileSync(readmeFilePath, 'utf8');

    for (const domain of EXPECTED_DOMAINS) {
      expect(readmeContent).toContain(`${domain}.md`);
    }
  });

  it('verifies all 13 domain Markdown documentation files exist', () => {
    for (const domain of EXPECTED_DOMAINS) {
      const filePath = path.join(docsApiDir, `${domain}.md`);
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content.length).toBeGreaterThan(100);
      expect(content).toContain('Endpoints Summary');
    }
  });

  it('verifies docs/api/openapi.json exists and is valid OpenAPI 3.0', () => {
    expect(fs.existsSync(openApiFilePath)).toBe(true);
    const openApiRaw = fs.readFileSync(openApiFilePath, 'utf8');
    const spec = JSON.parse(openApiRaw);

    expect(spec.openapi).toMatch(/^3\.0\.\d+$/);
    expect(spec.info).toBeDefined();
    expect(spec.info.title).toContain('NextJob');
    expect(spec.paths).toBeDefined();
    expect(Object.keys(spec.paths).length).toBeGreaterThanOrEqual(13);
  });

  it('verifies openapi.json contains tags and security definitions for all domains', () => {
    const spec = JSON.parse(fs.readFileSync(openApiFilePath, 'utf8'));

    expect(spec.tags).toBeDefined();
    expect(spec.tags.length).toBe(13);

    const tagNames = spec.tags.map((t: { name: string }) => t.name.toLowerCase());
    expect(tagNames).toContain('authentication');
    expect(tagNames).toContain('your profile');
    expect(tagNames).toContain('eligibility');
    expect(tagNames).toContain('matches');

    expect(spec.components?.securitySchemes?.BearerAuth).toBeDefined();
    expect(spec.components?.securitySchemes?.TenantHeader).toBeDefined();
  });

  it('verifies all endpoints in openapi.json specify valid response schemas', () => {
    const spec = JSON.parse(fs.readFileSync(openApiFilePath, 'utf8'));

    for (const [pathKey, pathItem] of Object.entries<Record<string, unknown>>(spec.paths)) {
      for (const [method, operation] of Object.entries<Record<string, unknown>>(pathItem)) {
        if (['get', 'post', 'put', 'delete'].includes(method)) {
          const op = operation as { summary?: string; responses?: Record<string, unknown> };
          expect(
            op.summary,
            `Summary missing for ${method.toUpperCase()} ${pathKey}`
          ).toBeDefined();
          expect(
            op.responses,
            `Responses missing for ${method.toUpperCase()} ${pathKey}`
          ).toBeDefined();
          const responses = op.responses ?? {};
          const hasSuccessResponse = ['200', '201', '202'].some((code) => responses[code]);
          expect(
            hasSuccessResponse,
            `Success status code missing for ${method.toUpperCase()} ${pathKey}`
          ).toBe(true);
        }
      }
    }
  });
});
