import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const REQUIRED_GUIDES = [
  'onboarding.md',
  'applying.md',
  'tracking.md',
  'privacy-controls.md',
] as const;

describe('User Documentation Suite (T-42)', () => {
  const docsDir = path.resolve(process.cwd(), 'docs/user-guide');
  const readmePath = path.join(docsDir, 'README.md');

  it('verifies docs/user-guide/README.md exists and references all required guides', () => {
    expect(fs.existsSync(readmePath)).toBe(true);
    const content = fs.readFileSync(readmePath, 'utf8');

    for (const guide of REQUIRED_GUIDES) {
      expect(content).toContain(guide);
    }
  });

  it('verifies onboarding.md exists and covers key onboarding flows', () => {
    const filePath = path.join(docsDir, 'onboarding.md');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf8');

    expect(content).toContain('Account Creation');
    expect(content).toContain('Profile Import');
    expect(content).toContain('Claim Verification');
    expect(content).toContain('Preferences Capture');
    expect(content).toContain('Automation Policy');
  });

  it('verifies applying.md exists and covers job discovery, tailoring, and approvals', () => {
    const filePath = path.join(docsDir, 'applying.md');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf8');

    expect(content).toContain('Job Discovery');
    expect(content).toContain('Capability Cards');
    expect(content).toContain('Evidence Constraints');
    expect(content).toContain('Risk Classifications');
    expect(content).toContain('Approval Dialog');
  });

  it('verifies tracking.md exists and covers application status, receipts, and outcomes', () => {
    const filePath = path.join(docsDir, 'tracking.md');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf8');

    expect(content).toContain('Application Tracker');
    expect(content).toContain('Submission Receipts');
    expect(content).toContain('Cryptographic Hashes');
    expect(content).toContain('Outcome Updates');
  });

  it('verifies privacy-controls.md exists and covers data export, deletion, and opt-outs', () => {
    const filePath = path.join(docsDir, 'privacy-controls.md');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf8');

    expect(content).toContain('Inspect & Correct');
    expect(content).toContain('Data Export');
    expect(content).toContain('Cascading Purge');
    expect(content).toContain('DataDeletionReceipt');
    expect(content).toContain('Model Training Opt-Out');
  });
});
