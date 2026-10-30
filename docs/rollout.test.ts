import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('T-51 Rollout Plan Documentation Verification', () => {
  const rolloutPath = path.resolve(__dirname, 'ROLLOUT.md');

  it('ensures docs/ROLLOUT.md exists and has substantive documentation', () => {
    expect(fs.existsSync(rolloutPath)).toBe(true);
    const content = fs.readFileSync(rolloutPath, 'utf8');
    expect(content.length).toBeGreaterThan(1500);
  });

  it('covers FR-ROL-01 (MVP, 0-3 months) with all required system capabilities', () => {
    const content = fs.readFileSync(rolloutPath, 'utf8');
    expect(content).toContain('FR-ROL-01');
    expect(content).toContain('Phase 1: MVP');
    expect(content).toContain('CareerClaim');
    expect(content).toContain('Eligibility & Ranking Engine');
    expect(content).toContain('Evidence-Constrained Tailoring');
    expect(content).toContain('Submission Receipts');
    expect(content).toContain('Admin Console');
    expect(content).toContain('Privacy');
  });

  it('covers FR-ROL-02 (V1 Growth & Intelligence, 3-6 months)', () => {
    const content = fs.readFileSync(rolloutPath, 'utf8');
    expect(content).toContain('FR-ROL-02');
    expect(content).toContain('Phase 2: V1');
    expect(content).toContain('Automated Outcome Detection');
    expect(content).toContain('Interview');
    expect(content).toContain('Workday');
    expect(content).toContain('Experimentation');
  });

  it('covers FR-ROL-03 (V2 Safe Autopilot & Ecosystem, 6-12 months)', () => {
    const content = fs.readFileSync(rolloutPath, 'utf8');
    expect(content).toContain('FR-ROL-03');
    expect(content).toContain('Phase 3: V2');
    expect(content).toContain('Safe Autopilot Execution');
    expect(content).toContain('Outcome-Informed Ranking');
    expect(content).toContain('Career Vault');
    expect(content).toContain('B2B2C Institutional Ecosystem');
  });

  it('documents progressive rollout rings and emergency kill-switch rollback procedures', () => {
    const content = fs.readFileSync(rolloutPath, 'utf8');
    expect(content).toContain('Ring 0: Canary & Synthetic');
    expect(content).toContain('Ring 1: Alpha Cohort');
    expect(content).toContain('Ring 2: Closed Beta');
    expect(content).toContain('Ring 3: General Availability');
    expect(content).toContain('Connector Kill Switches');
    expect(content).toContain('Zero-Downtime Rollback');
  });
});
