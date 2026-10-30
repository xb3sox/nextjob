import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Production Rollback Procedures Documentation (T-41)', () => {
  const rollbackDocPath = path.resolve(__dirname, 'ROLLBACK.md');

  it('verifies that docs/ROLLBACK.md exists', () => {
    expect(fs.existsSync(rollbackDocPath)).toBe(true);
  });

  it('documents recovery point and recovery time objectives (RPO <= 15min, RTO <= 4hr)', () => {
    const content = fs.readFileSync(rollbackDocPath, 'utf8');
    expect(content).toMatch(/RPO.*15.*min/i);
    expect(content).toMatch(/RTO.*4.*hour/i);
  });

  it('documents distinct rollback procedures across all 4 architecture tiers', () => {
    const content = fs.readFileSync(rollbackDocPath, 'utf8');
    expect(content).toContain('Web Frontend Rollback');
    expect(content).toContain('API Backend Rollback');
    expect(content).toContain('Temporal');
    expect(content).toContain('Database Rollback');
  });

  it('documents severity classifications (SEV-0, SEV-1, SEV-2) and triggers', () => {
    const content = fs.readFileSync(rollbackDocPath, 'utf8');
    expect(content).toContain('SEV-0');
    expect(content).toContain('SEV-1');
    expect(content).toContain('SEV-2');
    expect(content).toContain('P99 latency');
  });

  it('enforces expand/contract migration contract and PITR procedures', () => {
    const content = fs.readFileSync(rollbackDocPath, 'utf8');
    expect(content).toContain('Expand / Contract');
    expect(content).toContain('Point-in-Time Recovery');
    expect(content).toContain('Post-Rollback Verification Checklist');
  });
});
