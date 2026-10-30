import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('T-85 Content Blocks Library Documentation Verification', () => {
  const docPath = path.resolve(__dirname, 'content-blocks.md');

  it('ensures docs/marketing/content-blocks.md exists and is substantive', () => {
    expect(fs.existsSync(docPath)).toBe(true);
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content.length).toBeGreaterThan(1500);
  });

  it('covers FR-CONT-03 requirements and all 6 content block sections', () => {
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('FR-CONT-03');
    expect(content).toContain('1. HeroBlock');
    expect(content).toContain('2. FeatureBlock');
    expect(content).toContain('3. TestimonialBlock');
    expect(content).toContain('4. PricingBlock');
    expect(content).toContain('5. FaqBlock');
    expect(content).toContain('6. CtaBlock');
  });

  it('documents design tokens and accessibility guidelines', () => {
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('.mkt-card');
    expect(content).toContain('.mkt-btn-primary');
    expect(content).toContain('WCAG 2.2 AA Accessibility');
    expect(content).toContain('#0a0a0a');
  });

  it('provides component props tables and code usage examples for each block', () => {
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('`HeroBlockProps`');
    expect(content).toContain('`FeatureBlockProps`');
    expect(content).toContain('`TestimonialBlockProps`');
    expect(content).toContain('`PricingBlockProps`');
    expect(content).toContain('`FaqBlockProps`');
    expect(content).toContain('`CtaBlockProps`');
    expect(content).toContain('import { HeroBlock }');
    expect(content).toContain('import { FeatureBlock }');
  });
});
