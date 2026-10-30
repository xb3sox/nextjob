import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('T-87 Email Nurture Sequences Verification', () => {
  const docPath = path.resolve(__dirname, 'email-sequences.md');

  it('ensures docs/marketing/email-sequences.md exists and is substantive', () => {
    expect(fs.existsSync(docPath)).toBe(true);
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content.length).toBeGreaterThan(1500);
  });

  it('references FR-CONT-05 requirement and core sequence pillars', () => {
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('FR-CONT-05');
    expect(content).toContain('Welcome Series');
    expect(content).toContain('Onboarding Series');
    expect(content).toContain('Re-engagement Series');
  });

  it('documents 3 emails in Welcome series over 7 days', () => {
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('Email W1 (Day 0)');
    expect(content).toContain('Email W2 (Day 3)');
    expect(content).toContain('Email W3 (Day 7)');
  });

  it('documents 5 emails in Onboarding series over 14 days', () => {
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('Email O1 (Day 1)');
    expect(content).toContain('Email O2 (Day 4)');
    expect(content).toContain('Email O3 (Day 7)');
    expect(content).toContain('Email O4 (Day 10)');
    expect(content).toContain('Email O5 (Day 14)');
  });

  it('documents monthly Re-engagement email', () => {
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('Email R1 (Day 30)');
  });

  it('verifies alignment with copywriting guidelines', () => {
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('Copywriting Guidelines Alignment Check');
    expect(content).toContain('< 20 Words / Sentence');
    expect(content).toContain('Active Voice');
  });
});
