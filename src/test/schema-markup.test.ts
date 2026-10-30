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
  '@type': string | string[];
  '@id'?: string;
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

  it('holds valid JSON-LD with detailed entity definitions and relationships', () => {
    const blocks = extractLdJsonBlocks(indexHtml);
    expect(blocks).toHaveLength(1);

    const schema = JSON.parse(blocks[0]) as GraphSchema;

    expect(schema['@context']).toBe('https://schema.org');
    expect(Array.isArray(schema['@graph'])).toBe(true);

    const graph = schema['@graph'];
    const getEntityByType = (type: string) =>
      graph.find((entity) =>
        Array.isArray(entity['@type']) ? entity['@type'].includes(type) : entity['@type'] === type
      );

    // Verify entity presence
    const org = getEntityByType('Organization');
    const website = getEntityByType('WebSite');
    const app = getEntityByType('SoftwareApplication');
    const service = getEntityByType('Service');
    const howTo = getEntityByType('HowTo');
    const catalog = getEntityByType('OfferCatalog');
    const offer = getEntityByType('Offer');
    const termsSet = getEntityByType('DefinedTermSet');
    const faq = getEntityByType('FAQPage');

    expect(org).toBeDefined();
    expect(website).toBeDefined();
    expect(app).toBeDefined();
    expect(service).toBeDefined();
    expect(howTo).toBeDefined();
    expect(catalog).toBeDefined();
    expect(offer).toBeDefined();
    expect(termsSet).toBeDefined();
    expect(faq).toBeDefined();

    // Verify Organization details & relationships
    expect(org?.url).toBe(CANONICAL_URL);
    expect(org?.slogan).toBe('Apply with Proof');
    expect(org?.contactPoint).toEqual({
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@nextjob.ai',
      url: `${CANONICAL_URL}/#faq`,
    });
    expect(org?.hasOfferCatalog).toEqual({
      '@id': `${CANONICAL_URL}/#offercatalog`,
    });

    // Verify Offers & Price Specifications
    const freeOffer = graph.find((e) => e['@id'] === `${CANONICAL_URL}/#offer-free`);
    const searchOffer = graph.find((e) => e['@id'] === `${CANONICAL_URL}/#offer-search`);
    expect(freeOffer).toBeDefined();
    expect(freeOffer?.price).toBe('0');
    expect(searchOffer).toBeDefined();
    expect(searchOffer?.price).toBe('39.00');
    expect(searchOffer?.priceSpecification).toBeDefined();

    // Verify HowTo Workflow Steps
    expect(howTo?.name).toBe('How NextJob Submits Verified Job Applications');
    const steps = (howTo?.step ?? []) as Array<{ position: number; name: string; text: string }>;
    expect(Array.isArray(steps)).toBe(true);
    expect(steps).toHaveLength(4);
    expect(steps[0]?.name).toBe('Build & Verify Career Profile');
    expect(steps[3]?.name).toBe('Submit & Emit Immutable Receipt');

    // Verify DefinedTermSet & Codes
    const definedTerms = (termsSet?.definedTerm ?? []) as Array<{
      name: string;
      termCode: string;
      inDefinedTermSet: { '@id': string };
    }>;
    expect(Array.isArray(definedTerms)).toBe(true);
    expect(definedTerms).toHaveLength(4);
    expect(definedTerms.map((t) => t.termCode)).toEqual([
      'AI-AGENT',
      'CAREER-GRAPH',
      'SUBMISSION-RECEIPT',
      'ELIGIBILITY-ENGINE',
    ]);
  });

  it('provides matching schema graph generator from src/lib/schema.ts', () => {
    const schema = getStructuredData();
    expect(schema['@context']).toBe('https://schema.org');
    expect(Array.isArray(schema['@graph'])).toBe(true);

    const ids = schema['@graph'].map((entity) => entity['@id']);
    expect(ids).toEqual([
      `${CANONICAL_URL}/#organization`,
      `${CANONICAL_URL}/#offer-free`,
      `${CANONICAL_URL}/#offer-search`,
      `${CANONICAL_URL}/#offercatalog`,
      `${CANONICAL_URL}/#softwareapplication`,
      `${CANONICAL_URL}/#service`,
      `${CANONICAL_URL}/#workflow`,
      `${CANONICAL_URL}/#terms`,
      `${CANONICAL_URL}/#faq`,
      `${CANONICAL_URL}/#website`,
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
