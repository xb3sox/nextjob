/** @vitest-environment happy-dom */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  cleanupMockAtsPage,
  createMockAtsPage,
  detectFields,
  detectPlatform,
  runSyntheticAtsFill,
} from './index';
import type { CandidateProfile } from './types';

const MOCK_PROFILE: CandidateProfile = {
  firstName: 'Sarah',
  lastName: 'Connor',
  fullName: 'Sarah Connor',
  email: 'sarah.connor@example.com',
  phone: '+1-555-0199',
  linkedin: 'https://linkedin.com/in/sarah-connor',
  github: 'https://github.com/sarah-connor',
  portfolio: 'https://sarahconnor.dev',
  workAuthorization: 'yes',
  sponsorship: 'no',
  customAnswers: {
    comments: 'Excited about the evidence-grounded approach!',
  },
};

describe('ATS Connector Synthetic Test Framework (T-22, Phase 7)', () => {
  beforeEach(() => {
    cleanupMockAtsPage();
  });

  afterEach(() => {
    cleanupMockAtsPage();
  });

  describe('Greenhouse Mock ATS Harness', () => {
    it('detects Greenhouse ATS platform correctly', () => {
      const page = createMockAtsPage('greenhouse');
      expect(detectPlatform(page)).toBe('greenhouse');
    });

    it('scans and maps standard Greenhouse form fields', () => {
      const page = createMockAtsPage('greenhouse');
      const fields = detectFields(page);

      expect(fields.length).toBeGreaterThanOrEqual(7);

      const keys = fields.map((f) => f.key);
      expect(keys).toContain('firstName');
      expect(keys).toContain('lastName');
      expect(keys).toContain('email');
      expect(keys).toContain('phone');
      expect(keys).toContain('linkedin');
      expect(keys).toContain('github');
      expect(keys).toContain('workAuthorization');
    });

    it('autofills Greenhouse synthetic application and logs report', () => {
      const page = createMockAtsPage('greenhouse');
      const report = runSyntheticAtsFill(page, MOCK_PROFILE);

      expect(report.platform).toBe('greenhouse');
      expect(report.detectedCount).toBeGreaterThanOrEqual(7);
      expect(report.filledCount).toBe(7);

      // Verify DOM values
      const firstNameInput = page.querySelector<HTMLInputElement>('#first_name');
      expect(firstNameInput?.value).toBe('Sarah');

      const lastNameInput = page.querySelector<HTMLInputElement>('#last_name');
      expect(lastNameInput?.value).toBe('Connor');

      const emailInput = page.querySelector<HTMLInputElement>('#email');
      expect(emailInput?.value).toBe('sarah.connor@example.com');

      const phoneInput = page.querySelector<HTMLInputElement>('#phone');
      expect(phoneInput?.value).toBe('+1-555-0199');

      const workAuthSelect = page.querySelector<HTMLSelectElement>(
        '#job_application_answers_attributes_2_boolean_value'
      );
      expect(workAuthSelect?.value).toBe('1');

      // Verify logs
      expect(report.logs).toEqual(
        expect.arrayContaining([
          expect.stringContaining('[DETECTOR] Detected ATS platform: greenhouse'),
          expect.stringContaining('[FILL:SUCCESS] firstName'),
          expect.stringContaining('[FILL:SUCCESS] email'),
          expect.stringContaining('[REPORT] Platform: greenhouse'),
        ])
      );
    });
  });

  describe('Lever Mock ATS Harness', () => {
    it('detects Lever ATS platform and fills name, URLs, and comments', () => {
      const page = createMockAtsPage('lever');
      expect(detectPlatform(page)).toBe('lever');

      const report = runSyntheticAtsFill(page, MOCK_PROFILE);
      expect(report.platform).toBe('lever');
      expect(report.filledCount).toBeGreaterThanOrEqual(6);

      const nameInput = page.querySelector<HTMLInputElement>('input[name="name"]');
      expect(nameInput?.value).toBe('Sarah Connor');

      const linkedinInput = page.querySelector<HTMLInputElement>('input[name="urls[LinkedIn]"]');
      expect(linkedinInput?.value).toBe('https://linkedin.com/in/sarah-connor');

      const commentsTextarea = page.querySelector<HTMLTextAreaElement>('textarea[name="comments"]');
      expect(commentsTextarea?.value).toBe('Excited about the evidence-grounded approach!');
    });
  });

  describe('Workday Mock ATS Harness', () => {
    it('detects Workday data-automation-id attributes and fills fields', () => {
      const page = createMockAtsPage('workday');
      expect(detectPlatform(page)).toBe('workday');

      const report = runSyntheticAtsFill(page, MOCK_PROFILE);
      expect(report.platform).toBe('workday');
      expect(report.filledCount).toBe(5);

      const firstNameInput = page.querySelector<HTMLInputElement>(
        '[data-automation-id="firstNameInput"]'
      );
      expect(firstNameInput?.value).toBe('Sarah');

      const emailInput = page.querySelector<HTMLInputElement>('[data-automation-id="emailInput"]');
      expect(emailInput?.value).toBe('sarah.connor@example.com');
    });
  });

  describe('Generic ATS Fallback', () => {
    it('detects generic platform when no recognized vendor signatures exist', () => {
      const div = document.createElement('div');
      div.innerHTML = `<form><input type="email" name="user_email" /></form>`;
      expect(detectPlatform(div)).toBe('generic');

      const report = runSyntheticAtsFill(div, MOCK_PROFILE);
      expect(report.platform).toBe('generic');
      expect(report.filledCount).toBe(1);
    });
  });
});
