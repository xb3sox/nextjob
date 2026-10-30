/** @vitest-environment happy-dom */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createMockGreenhouseHtml } from '../../tests/synthetic/harness';
import { GreenhouseConnector } from './greenhouse';
import type { CandidateProfile } from './types';

const MOCK_PROFILE: CandidateProfile = {
  firstName: 'Elena',
  lastName: 'Rostova',
  fullName: 'Elena Rostova',
  email: 'elena.rostova@example.com',
  phone: '+1-555-0144',
  linkedin: 'https://linkedin.com/in/elena-rostova',
  github: 'https://github.com/elena-rostova',
  portfolio: 'https://elenarostova.dev',
  workAuthorization: 'yes',
  sponsorship: 'no',
};

describe('GreenhouseConnector (T-23, Phase 7)', () => {
  let connector: GreenhouseConnector;
  let container: HTMLDivElement;

  beforeEach(() => {
    connector = new GreenhouseConnector({ storageKey: 'test.submissions.greenhouse' });
    connector.clearHistory();

    container = document.createElement('div');
    container.innerHTML = createMockGreenhouseHtml();
    document.body.appendChild(container);
  });

  afterEach(() => {
    connector.clearHistory();
    container.remove();
  });

  describe('Form Detection', () => {
    it('detects Greenhouse application form and extracts form element', () => {
      const detection = connector.detect(container);

      expect(detection.isDetected).toBe(true);
      expect(detection.platform).toBe('greenhouse');
      expect(detection.confidence).toBeGreaterThanOrEqual(0.9);
      expect(detection.formElement).not.toBeNull();
      expect(detection.formElement?.id).toBe('application_form');
    });

    it('returns isDetected false when no Greenhouse form is present', () => {
      const emptyDiv = document.createElement('div');
      emptyDiv.innerHTML = '<form><input type="text" name="other" /></form>';

      const detection = connector.detect(emptyDiv);
      expect(detection.isDetected).toBe(false);
      expect(detection.formElement).toBeNull();
    });
  });

  describe('Field Autofill', () => {
    it('fills standard Greenhouse inputs from candidate profile', () => {
      const result = connector.fill(container, {
        jobId: 'greenhouse-job-101',
        idempotencyKey: 'idem-key-001',
        profile: MOCK_PROFILE,
      });

      expect(result.success).toBe(true);
      expect(result.detected).toBe(true);
      expect(result.isDuplicate).toBe(false);
      expect(result.filledFieldCount).toBeGreaterThanOrEqual(7);

      const firstName = container.querySelector<HTMLInputElement>('#first_name');
      const lastName = container.querySelector<HTMLInputElement>('#last_name');
      const email = container.querySelector<HTMLInputElement>('#email');
      const phone = container.querySelector<HTMLInputElement>('#phone');
      const linkedin = container.querySelector<HTMLInputElement>(
        '#job_application_answers_attributes_0_text_value'
      );
      const github = container.querySelector<HTMLInputElement>(
        '#job_application_answers_attributes_1_text_value'
      );
      const workAuth = container.querySelector<HTMLSelectElement>(
        '#job_application_answers_attributes_2_boolean_value'
      );

      expect(firstName?.value).toBe('Elena');
      expect(lastName?.value).toBe('Rostova');
      expect(email?.value).toBe('elena.rostova@example.com');
      expect(phone?.value).toBe('+1-555-0144');
      expect(linkedin?.value).toBe('https://linkedin.com/in/elena-rostova');
      expect(github?.value).toBe('https://github.com/elena-rostova');
      expect(workAuth?.value).toBe('1');
    });
  });

  describe('Idempotency', () => {
    it('skips redundant element writes when form already has desired values', () => {
      // First fill
      const firstResult = connector.fill(container, {
        jobId: 'greenhouse-job-102',
        idempotencyKey: 'idem-key-002',
        profile: MOCK_PROFILE,
      });

      expect(firstResult.filledFieldCount).toBeGreaterThanOrEqual(7);
      expect(firstResult.skippedFieldCount).toBe(0);

      // Second fill with identical profile on same form
      const secondResult = connector.fill(container, {
        jobId: 'greenhouse-job-102',
        idempotencyKey: 'idem-key-002-repeat',
        profile: MOCK_PROFILE,
      });

      expect(secondResult.success).toBe(true);
      expect(secondResult.filledFieldCount).toBe(0);
      expect(secondResult.skippedFieldCount).toBeGreaterThanOrEqual(7);

      // Verify values remain intact
      const email = container.querySelector<HTMLInputElement>('#email');
      expect(email?.value).toBe('elena.rostova@example.com');
    });
  });

  describe('Duplicate Prevention', () => {
    it('blocks fill attempt when application for job has already been submitted', () => {
      const jobId = 'greenhouse-job-200';
      const idempotencyKey = 'idem-submit-200';

      // Verify not duplicate initially
      expect(connector.isDuplicate(jobId)).toBe(false);

      // Record completed submission
      connector.recordSubmission(jobId, idempotencyKey);

      // Verify detected as duplicate
      expect(connector.isDuplicate(jobId)).toBe(true);
      expect(connector.isDuplicate('different-job', idempotencyKey)).toBe(true);

      // Attempt fill should now be rejected
      const result = connector.fill(container, {
        jobId,
        idempotencyKey: 'attempt-2',
        profile: MOCK_PROFILE,
      });

      expect(result.success).toBe(false);
      expect(result.isDuplicate).toBe(true);
      expect(result.error).toContain('Application duplicate blocked');
      expect(result.filledFieldCount).toBe(0);
    });

    it('allows submission when allowDuplicates is explicitly enabled', () => {
      const permissiveConnector = new GreenhouseConnector({
        storageKey: 'test.submissions.permissive',
        allowDuplicates: true,
      });

      const jobId = 'greenhouse-job-300';
      permissiveConnector.recordSubmission(jobId, 'idem-300');

      expect(permissiveConnector.isDuplicate(jobId)).toBe(false);

      const result = permissiveConnector.fill(container, {
        jobId,
        idempotencyKey: 'idem-301',
        profile: MOCK_PROFILE,
      });

      expect(result.success).toBe(true);
      expect(result.isDuplicate).toBe(false);
    });

    it('clears history correctly', () => {
      connector.recordSubmission('job-400', 'idem-400');
      expect(connector.isDuplicate('job-400')).toBe(true);

      connector.clearHistory();
      expect(connector.isDuplicate('job-400')).toBe(false);
    });
  });
});
