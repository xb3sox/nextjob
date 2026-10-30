import { beforeEach, describe, expect, it } from 'vitest';
import { PolicyEngine } from './policy-engine';

describe('Risk and Policy Engine (T-19, Phase 6)', () => {
  let engine: PolicyEngine;

  beforeEach(() => {
    engine = new PolicyEngine();
  });

  describe('Risk Classification (5 levels)', () => {
    it('classifies standard profile fields as Low risk with auto_fill action', () => {
      const emailField = { key: 'email', label: 'Email Address' };
      const res = engine.evaluateField(emailField);

      expect(res.effectiveClassification.riskLevel).toBe('low');
      expect(res.effectiveClassification.action).toBe('auto_fill');
      expect(res.effectiveClassification.canAutoFill).toBe(true);
      expect(res.effectiveClassification.requiresUserApproval).toBe(false);
    });

    it('classifies tailored cover letter and motivation as Medium risk', () => {
      const coverLetter = { key: 'cover_letter', label: 'Why are you interested in this role?' };
      const res = engine.evaluateField(coverLetter);

      expect(res.effectiveClassification.riskLevel).toBe('medium');
      expect(res.effectiveClassification.action).toBe('auto_fill');
      expect(res.effectiveClassification.canAutoFill).toBe(true);
    });

    it('classifies compensation and start dates as High risk requiring user review', () => {
      const salary = { key: 'desired_salary', label: 'What are your compensation expectations?' };
      const res = engine.evaluateField(salary);

      expect(res.effectiveClassification.riskLevel).toBe('high');
      expect(res.effectiveClassification.action).toBe('suggest_and_review');
      expect(res.effectiveClassification.canAutoFill).toBe(false);
      expect(res.effectiveClassification.requiresUserApproval).toBe(true);
    });

    it('classifies demographic and health fields as Sensitive (FR-03)', () => {
      const disability = {
        key: 'disability_status',
        label: 'Do you have a physical or mental impairment?',
      };
      const res = engine.evaluateField(disability);

      expect(res.effectiveClassification.riskLevel).toBe('sensitive');
      expect(res.effectiveClassification.action).toBe('user_only_input');
      expect(res.effectiveClassification.canAutoFill).toBe(false);
      expect(res.effectiveClassification.authority).toBe('legal_safety');
    });

    it('classifies CAPTCHA and 2FA as Unsupported with block action', () => {
      const captcha = { key: 'recaptcha_token', label: 'Complete the bot verification challenge' };
      const res = engine.evaluateField(captcha);

      expect(res.effectiveClassification.riskLevel).toBe('unsupported');
      expect(res.effectiveClassification.action).toBe('block');
      expect(res.effectiveClassification.canAutoFill).toBe(false);
      expect(res.effectiveClassification.authority).toBe('platform');
    });
  });

  describe('Sensitive Fields Protection (FR-03, AC-03)', () => {
    it('blocks auto-fill on disability questions (AC-03 -> FR-03)', () => {
      const field = {
        key: 'voluntary_disability',
        label: 'Voluntary Self-Identification of Disability',
      };

      expect(engine.isAutoFillAllowed(field)).toBe(false);

      const res = engine.evaluateField(field);
      expect(res.effectiveClassification.action).toBe('user_only_input');
      expect(res.effectiveClassification.canAutoFill).toBe(false);
    });

    it('blocks user or organization policy from overriding sensitive field protection', () => {
      // User attempts to set voluntary_disability to auto_fill
      engine.registerOverride({
        authority: 'user',
        matches: (f) => f.key === 'voluntary_disability',
        riskLevel: 'low',
        action: 'auto_fill',
        reason: 'User wants auto-fill on all demographic questions',
      });

      const res = engine.evaluateField({
        key: 'voluntary_disability',
        label: 'Disability Status',
      });

      // Legal/Safety boundary MUST prevail (FR-03 & FR-07)
      expect(res.effectiveClassification.riskLevel).toBe('sensitive');
      expect(res.effectiveClassification.action).toBe('user_only_input');
      expect(res.effectiveClassification.canAutoFill).toBe(false);
      expect(res.effectiveClassification.authority).toBe('legal_safety');
    });
  });

  describe('Policy Precedence Enforcement (FR-07)', () => {
    it('enforces Legal/Safety > Platform > NextJob > Organization > User > Context', () => {
      // Organization restricts relocation questions to require review
      engine.registerOverride({
        authority: 'organization',
        matches: (f) => f.key === 'relocation',
        riskLevel: 'high',
        action: 'suggest_and_review',
        reason: 'Org policy requires candidate signoff on relocation willingness',
      });

      // User preference wants auto_fill
      engine.registerOverride({
        authority: 'user',
        matches: (f) => f.key === 'relocation',
        riskLevel: 'low',
        action: 'auto_fill',
        reason: 'User preference is to auto-fill relocation',
      });

      const res = engine.evaluateField({
        key: 'relocation',
        label: 'Are you willing to relocate for this position?',
      });

      // Organization (priority 3) beats User (priority 4)
      expect(res.effectiveClassification.authority).toBe('organization');
      expect(res.effectiveClassification.action).toBe('suggest_and_review');
      expect(res.effectiveClassification.requiresUserApproval).toBe(true);
    });

    it('allows user preference to add stricter rules if higher authority allows', () => {
      // Default phone is low risk auto_fill, user wants review on phone numbers
      engine.registerOverride({
        authority: 'user',
        matches: (f) => f.key === 'phone',
        riskLevel: 'high',
        action: 'suggest_and_review',
        reason: 'User wants to review phone number before submission',
      });

      const res = engine.evaluateField({
        key: 'phone',
        label: 'Phone number',
      });

      expect(res.effectiveClassification.action).toBe('suggest_and_review');
      expect(res.effectiveClassification.requiresUserApproval).toBe(true);
    });
  });
});
