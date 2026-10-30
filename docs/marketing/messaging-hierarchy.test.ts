import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('T-83 Messaging Hierarchy Documentation Verification', () => {
  const docPath = path.resolve(__dirname, 'messaging-hierarchy.md');

  it('ensures docs/marketing/messaging-hierarchy.md exists and is substantive', () => {
    expect(fs.existsSync(docPath)).toBe(true);
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content.length).toBeGreaterThan(2000);
  });

  it('covers FR-CONT-01 and the complete 5-tier messaging hierarchy', () => {
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('FR-CONT-01');
    expect(content).toContain('Tier 1: Primary Value Proposition');
    expect(content).toContain('Tier 2: Five Core Value Pillars');
    expect(content).toContain('Tier 3: Detailed Feature Specifications');
    expect(content).toContain('Tier 4: Social Proof & Defensible Metrics');
    expect(content).toContain('Tier 5: Final CTA Framework');
  });

  it('specifies the 5 core benefit pillars with clear customer outcomes', () => {
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('Pillar 1: Evidence Provenance');
    expect(content).toContain('Pillar 2: Strict Eligibility Engine');
    expect(content).toContain('Pillar 3: Cryptographic Submission Receipts');
    expect(content).toContain('Pillar 4: Granular Automation Policy');
    expect(content).toContain('Pillar 5: Privacy-First Tenant Isolation');
    expect(content).toContain('CareerClaim');
    expect(content).toContain('SHA-256');
  });

  it('articulates defensible proof points and metrics', () => {
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('93% Time Saved');
    expect(content).toContain('3.2x Interview Callback Lift');
    expect(content).toContain('100% Provenance Coverage');
    expect(content).toContain('≤2% False-Positive Rate');
  });

  it('provides an approved copy matrix across key site sections', () => {
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('### Hero Section');
    expect(content).toContain('### Features Section');
    expect(content).toContain('### Comparison Section');
    expect(content).toContain('### FAQ Section');
    expect(content).toContain('Start free — create your account');
  });
});
