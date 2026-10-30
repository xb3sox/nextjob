import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('T-86 Video Scripts Verification', () => {
  const docPath = path.resolve(__dirname, 'video-scripts.md');

  it('ensures docs/marketing/video-scripts.md exists and is substantive', () => {
    expect(fs.existsSync(docPath)).toBe(true);
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content.length).toBeGreaterThan(2500);
  });

  it('covers FR-CONT-04 with the 3 required video script formats', () => {
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('FR-CONT-04');
    expect(content).toContain('1. Product Demo Video (60 Seconds)');
    expect(content).toContain('2. Brand Explainer Video (90 Seconds)');
    expect(content).toContain('3. Customer Testimonial Interview Template');
  });

  it('contains timestamped visual directions and synchronized voiceover', () => {
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('Visual Direction');
    expect(content).toContain('Voiceover (Audio)');
    expect(content).toContain('0:00 - 0:08');
    expect(content).toContain('0:52 - 1:00');
    expect(content).toContain('0:00 - 0:15');
    expect(content).toContain('1:20 - 1:30');
  });

  it('reinforces core messaging pillars (provenance, eligibility, receipts)', () => {
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('CareerClaim');
    expect(content).toContain('SHA-256');
    expect(content).toContain('eligibility engine');
    expect(content).toContain('3.2x callback lift');
  });

  it('includes interview questions, soundbite prompts, and b-roll directions', () => {
    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('Candidate Interview Framework');
    expect(content).toContain('Segment 1: The Pain');
    expect(content).toContain('Segment 2: The Breakthrough');
    expect(content).toContain('Segment 3: The Outcome & Recommendation');
    expect(content).toContain('Required B-Roll Capture Checklist');
  });
});
