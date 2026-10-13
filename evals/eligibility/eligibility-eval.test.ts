/**
 * T-13: Eligibility evaluation dataset harness (G-04 gate).
 *
 * Runs every case in evals/eligibility/cases.json through the real
 * EligibilityEngineService and asserts:
 *   1. Per-rule check statuses match documented expectations.
 *   2. Overall assessment status matches expectedStatus for every case.
 *   3. False-positive rate (engine says eligible where ground truth is
 *      ineligible) is <= 2% — the G-04 acceptance threshold.
 *
 * Run via: npm run test:eval -- eligibility   (or: npx vitest run evals)
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { EligibilityEngineService } from '../../packages/api/src/eligibility/eligibility-engine.js';

const MAX_FALSE_POSITIVE_RATE = 0.02; // G-04
const MIN_CASES = 100; // T-13 acceptance: >= 100 test cases

const here = dirname(fileURLToPath(import.meta.url));
const cases = JSON.parse(readFileSync(resolve(here, 'cases.json'), 'utf-8'));
const manifest = JSON.parse(readFileSync(resolve(here, 'manifest.json'), 'utf-8'));

// Engine returns checks in rule-priority order (ties fall back to insertion
// order because Array.prototype.sort is stable), so index alignment with the
// dataset's rules[] array is guaranteed.
// jobId must be a UUID per EligibilityAssessmentSchema; derive one from the
// case index so each assessment is distinct.
let jobSeq = 0;
function nextJobId() {
  const n = (++jobSeq).toString(16).padStart(12, '0');
  return `00000000-0000-4000-8000-${n}`;
}

async function runCase(engine, testCase) {
  for (const r of testCase.rules) {
    await engine.createRule(r);
  }
  return engine.checkEligibility(
    {
      userId: '00000000-0000-4000-8000-0000000000e2',
      tenantId: '00000000-0000-4000-8000-0000000000e1',
      jobId: nextJobId(),
    },
    testCase.profile,
    testCase.job
  );
}

describe('T-13 eligibility evaluation dataset', () => {
  it('meets minimum size and dimension coverage requirements', () => {
    expect(cases.length).toBeGreaterThanOrEqual(MIN_CASES);
    expect(manifest.totalCases).toBe(cases.length);
    const dimensions = new Set(cases.map((c) => c.dimension));
    for (const d of manifest.dimensions) {
      expect(dimensions.has(d)).toBe(true);
    }
    // All 10 eligibility dimensions plus composite multi_rule scenarios.
    expect(dimensions.size).toBe(11);
  });

  it('has unique case ids and valid expected statuses', () => {
    const ids = new Set(cases.map((c) => c.id));
    expect(ids.size).toBe(cases.length);
    for (const c of cases) {
      expect(['eligible', 'ineligible', 'unknown']).toContain(c.expectedStatus);
      expect(c.rules.length).toBeGreaterThan(0);
    }
  });

  describe('per-case correctness', () => {
    for (const testCase of cases) {
      it(`${testCase.id} (${testCase.dimension}): expects ${testCase.expectedStatus}`, async () => {
        const engine = new EligibilityEngineService();
        const result = await runCase(engine, testCase);

        // Overall status must match ground truth exactly.
        expect(result.assessment.status, `${testCase.id}: ${testCase.rationale}`).toBe(
          testCase.expectedStatus
        );

        // Per-check expectations (index-aligned with rules[]).
        expect(result.assessment.checks.length).toBe(testCase.rules.length);
        for (let i = 0; i < testCase.checks.length; i++) {
          const exp = testCase.checks[i];
          const actual = result.assessment.checks[i];
          if (exp.type) expect(actual.type, `${testCase.id} check[${i}] type`).toBe(exp.type);
          expect(actual.status, `${testCase.id} check[${i}] status`).toBe(exp.status);
          if (exp.reason_contains) {
            expect(actual.reason ?? '', `${testCase.id} check[${i}] reason`).toContain(
              exp.reason_contains
            );
          }
        }
      });
    }
  });

  it(`false-positive rate is <= ${MAX_FALSE_POSITIVE_RATE * 100}% (G-04)`, async () => {
    let falsePositives = 0;
    let negatives = 0;
    const failures = [];

    for (const testCase of cases) {
      if (testCase.expectedStatus !== 'ineligible') continue;
      negatives++;
      const engine = new EligibilityEngineService();
      const result = await runCase(engine, testCase);
      if (result.eligible) {
        falsePositives++;
        failures.push(testCase.id);
      }
    }

    const rate = negatives === 0 ? 0 : falsePositives / negatives;
    console.log(
      `[eligibility-eval] cases=${cases.length} negatives=${negatives} ` +
        `falsePositives=${falsePositives} rate=${(rate * 100).toFixed(2)}%`
    );
    expect(failures, `false positives: ${failures.join(', ')}`).toEqual([]);
    expect(rate).toBeLessThanOrEqual(MAX_FALSE_POSITIVE_RATE);
  });
});
