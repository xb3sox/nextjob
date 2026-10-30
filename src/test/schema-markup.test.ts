import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { getStructuredData } from '../lib/schema';

/**
 * Guards structured data (JSON-LD) markup and AI search optimization assets (llms.txt, schema.ts).
 */

const repoRoot = path.resolve(process.cwd());
const indexHtml = readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
const llmsTxtPath = path.join(repoRoot, 'public', 'llms.txt');

const CANONICAL_URL = 'https://nextjob.ai';

interface SchemaEntity {
  '@type': string;
  url?: string;
  [key: string]: unknown;
}

interface GraphSchema {
  '@context': string;
  '@graph': SchemaEntity[];
}

function extractLdJsonBlocks(html: string): string[] {
  const matches =
    html.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) ??
    [];
  return matches.map((block) => {
    const match = /<script\b[^>]*>([\s\S]*?)<\/script>/i.exec(block);
    return match?.[1]?.trim() ?? '';
  });
}

describe('schema markup (JSON-LD) and AI search optimization', () => {
  it('contains exactly one application/ld+json script block in index.html', () => {
    const blocks = extractLdJsonBlocks(indexHtml);
    expect(blocks).toHaveLength(1);
  });

  it('holds valid JSON-LD with @context and @graph containing Organization, WebSite, SoftwareApplication, DefinedTermSet, and FAQPage', () => {
    const blocks = extractLdJsonBlocks(indexHtml);
    expect(blocks).toHaveLength(1);

    const schema = JSON.parse(blocks[0]) as GraphSchema;

    expect(schema['@context']).toBe('https://schema.org');
    expect(Array.isArray(schema['@graph'])).toBe(true);

    const graph = schema['@graph'];
    const types = graph.map((entity) => entity['@type']);

    expect(types).toContain('Organization');
    expect(types).toContain('WebSite');
    expect(types).toContain('SoftwareApplication');
    expect(types).toContain('DefinedTermSet');
    expect(types).toContain('FAQPage');

    const org = graph.find((entity) => entity['@type'] === 'Organization');
    const website = graph.find((entity) => entity['@type'] === 'WebSite');

    expect(org?.url).toBe(CANONICAL_URL);
    expect(website?.url).toBe(CANONICAL_URL);
  });

  it('provides matching schema graph generator from src/lib/schema.ts', () => {
    const schema = getStructuredData();
    expect(schema['@context']).toBe('https://schema.org');
    expect(Array.isArray(schema['@graph'])).toBe(true);

    const types = schema['@graph'].map((entity) => entity['@type']);
    expect(types).toEqual([
      'Organization',
      'WebSite',
      'SoftwareApplication',
      'DefinedTermSet',
      'FAQPage',
    ]);
  });

  it('has a comprehensive public/llms.txt file for AI crawlers', () => {
    const content = readFileSync(llmsTxtPath, 'utf8');

    expect(content).toContain('# NextJob');
    expect(content).toContain('## Core Entities & Concepts');
    expect(content).toContain('AI Career Agent');
    expect(content).toContain('Career Graph');
    expect(content).toContain('Submission Receipt');
    expect(content).toContain('Eligibility Engine');
    expect(content).toContain('## Frequently Asked Questions');
  });
});
