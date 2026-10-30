import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('T-84 Copywriting Guidelines Verification', () => {
  const docPath = path.resolve(__dirname, 'copywriting-guidelines.md');

  it('ensures docs/marketing/copywriting-guidelines.md exists and is substantive', () => {
    expect(fs.existsSync(docPath)).toBe(true);
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content.length).toBeGreaterThan(2000);
  });

  it('covers FR-CONT-02 and the 3 core tone of voice pillars', () => {
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('FR-CONT-02');
    expect(content).toContain('Conversational');
    expect(content).toContain('Confident');
    expect(content).toContain('Trustworthy');
  });

  it('defines banned jargon and preferred alternative terminology', () => {
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('Banned Buzzwords & Preferred Alternatives');
    expect(content).toContain('AI Magic');
    expect(content).toContain('Leverage');
    expect(content).toContain('Guaranteed interview');
    expect(content).toContain('CareerClaim');
  });

  it('specifies the < 20 words sentence structure and active voice rules', () => {
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('Keep Sentences Under 20 Words');
    expect(content).toContain('Active Voice Over Passive Voice');
    expect(content).toContain('Complete Sentence Headlines');
  });

  it('provides concrete before and after examples for all key principles', () => {
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('Principle A: Conversational');
    expect(content).toContain('Principle B: Confident');
    expect(content).toContain('Principle C: Trustworthy');
    expect(content).toContain('Principle D: Sentence Structure');
    expect(content).toContain('Principle E: Active Voice');
    expect(content).toContain('Error Messages & Microcopy');
  });
});
