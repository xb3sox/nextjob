import { beforeEach, describe, expect, it } from 'vitest';
import {
  AnalyticsService,
  anonymizeUserId,
  InMemoryAnalyticsSink,
  sanitizeAnalyticsPayload,
  scrubString,
} from './index';

describe('Product Analytics & Privacy Safeguards (T-48, FR-ANA-01, FR-ANA-02, AC-11)', () => {
  let sink: InMemoryAnalyticsSink;
  let service: AnalyticsService;

  const TENANT_ID = 'tenant_001';
  const RAW_USER_ID = 'candidate@domain.com';

  beforeEach(() => {
    sink = new InMemoryAnalyticsSink();
    service = new AnalyticsService(sink);
  });

  describe('AC-11 & FR-ANA-02: Privacy Safeguards & Zero PII', () => {
    it('anonymizes raw user email into a 16-character deterministic hash', () => {
      const hashed1 = anonymizeUserId(RAW_USER_ID);
      const hashed2 = anonymizeUserId(RAW_USER_ID);

      expect(hashed1).toHaveLength(16);
      expect(hashed1).toBe(hashed2);
      expect(hashed1).not.toContain('candidate@domain.com');
    });

    it('redacts inline PII patterns in string fields', () => {
      const text = 'Contact recruiter@tech.com or call 555-123-4567, SSN: 000-11-2222';
      const clean = scrubString(text);

      expect(clean).not.toContain('recruiter@tech.com');
      expect(clean).not.toContain('555-123-4567');
      expect(clean).not.toContain('000-11-2222');
      expect(clean).toContain('[REDACTED_EMAIL]');
      expect(clean).toContain('[REDACTED_PHONE]');
      expect(clean).toContain('[REDACTED_SSN]');
    });

    it('enforces AC-11: redacts raw resumes, sensitive demographic answers, and credentials from payload', () => {
      const sensitivePayload = {
        jobId: 'job_123',
        resumeText: 'Full confidential resume and career background',
        cv: 'Raw CV PDF extracted text',
        coverLetterBody: 'Dear Hiring Manager, here is my private application content',
        disability: 'yes',
        race: 'prefer_not_to_say',
        salary: 150000,
        password: 'mypassword',
        apiKey: 'key_live_secret',
        metadata: {
          applicantPhone: '555-987-6543',
        },
      };

      const sanitized = sanitizeAnalyticsPayload(sensitivePayload);

      expect(sanitized.resumeText).toBe('[REDACTED]');
      expect(sanitized.cv).toBe('[REDACTED]');
      expect(sanitized.coverLetterBody).toBe('[REDACTED]');
      expect(sanitized.disability).toBe('[REDACTED]');
      expect(sanitized.race).toBe('[REDACTED]');
      expect(sanitized.salary).toBe('[REDACTED]');
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.apiKey).toBe('[REDACTED]');
      expect(sanitized.jobId).toBe('job_123');
      expect(sanitized.metadata.applicantPhone).toContain('[REDACTED_PHONE]');
    });
  });

  describe('FR-ANA-01: Product Event Tracking Coverage', () => {
    it('tracks onboarding lifecycle events', async () => {
      const start = await service.trackOnboarding(TENANT_ID, RAW_USER_ID, 'started');
      expect(start.eventName).toBe('onboarding_started');
      expect(start.userId).not.toContain('@');

      const complete = await service.trackOnboarding(TENANT_ID, RAW_USER_ID, 'completed', {
        stepCount: 4,
        durationMs: 45000,
      });
      expect(complete.eventName).toBe('onboarding_completed');
      expect(complete.properties.stepCount).toBe(4);
      expect(complete.properties.durationMs).toBe(45000);
    });

    it('tracks claim verification events', async () => {
      const verified = await service.trackClaimVerification(
        TENANT_ID,
        RAW_USER_ID,
        'claim_001',
        'verified',
        { claimType: 'experience', confidence: 0.95 }
      );

      expect(verified.eventName).toBe('claim_verified');
      expect(verified.properties.claimId).toBe('claim_001');
      expect(verified.properties.claimType).toBe('experience');

      const rejected = await service.trackClaimVerification(
        TENANT_ID,
        RAW_USER_ID,
        'claim_002',
        'rejected'
      );
      expect(rejected.eventName).toBe('claim_rejected');
    });

    it('tracks job impressions and candidate actions', async () => {
      const impression = await service.trackJobImpression(TENANT_ID, RAW_USER_ID, 'job_999', {
        fitScore: 88,
        eligibilityStatus: 'eligible',
      });
      expect(impression.eventName).toBe('job_impression');
      expect(impression.properties.fitScore).toBe(88);

      const action = await service.trackJobAction(
        TENANT_ID,
        RAW_USER_ID,
        'job_999',
        'start_application'
      );
      expect(action.eventName).toBe('job_action');
      expect(action.properties.action).toBe('start_application');
    });

    it('tracks eligibility evaluation outcomes', async () => {
      const event = await service.trackEligibility(TENANT_ID, RAW_USER_ID, 'job_999', {
        status: 'eligible',
        confidence: 0.98,
        ruleCount: 8,
      });

      expect(event.eventName).toBe('eligibility_evaluated');
      expect(event.properties.status).toBe('eligible');
      expect(event.properties.confidence).toBe(0.98);
      expect(event.properties.ruleCount).toBe(8);
    });

    it('tracks tailoring lifecycle without leaking candidate statements', async () => {
      const started = await service.trackTailoring(TENANT_ID, RAW_USER_ID, 'job_999', 'started');
      expect(started.eventName).toBe('tailoring_started');

      const completed = await service.trackTailoring(
        TENANT_ID,
        RAW_USER_ID,
        'job_999',
        'completed',
        {
          claimCount: 5,
          durationMs: 1200,
          success: true,
        }
      );
      expect(completed.eventName).toBe('tailoring_completed');
      expect(completed.properties.claimCount).toBe(5);
      expect(completed.properties.durationMs).toBe(1200);
    });

    it('tracks risk approvals and decisions', async () => {
      const requested = await service.trackApproval(
        TENANT_ID,
        RAW_USER_ID,
        'req_123',
        'requested',
        {
          riskLevel: 'high',
          reason: 'Missing non-critical skill',
        }
      );
      expect(requested.eventName).toBe('approval_requested');
      expect(requested.properties.riskLevel).toBe('high');

      const decided = await service.trackApproval(TENANT_ID, RAW_USER_ID, 'req_123', 'granted');
      expect(decided.eventName).toBe('approval_decided');
      expect(decided.properties.decision).toBe('granted');
    });

    it('tracks submission status (started, completed, failed)', async () => {
      await service.trackSubmission(TENANT_ID, RAW_USER_ID, 'app_001', 'started');
      await service.trackSubmission(TENANT_ID, RAW_USER_ID, 'app_001', 'completed', {
        connector: 'greenhouse',
      });
      await service.trackSubmission(TENANT_ID, RAW_USER_ID, 'app_002', 'failed', {
        connector: 'workday',
        failureCategory: 'rate_limited',
      });

      const events = sink.events;
      expect(events).toHaveLength(3);
      expect(events[0].eventName).toBe('submission_started');
      expect(events[1].eventName).toBe('submission_completed');
      expect(events[1].properties.connector).toBe('greenhouse');
      expect(events[2].eventName).toBe('submission_failed');
      expect(events[2].properties.failureCategory).toBe('rate_limited');
    });

    it('tracks outcomes and interviews', async () => {
      const outcome = await service.trackOutcome(TENANT_ID, RAW_USER_ID, 'app_001', 'interview', {
        daysElapsed: 4,
      });
      expect(outcome.eventName).toBe('outcome_recorded');
      expect(outcome.properties.outcome).toBe('interview');
      expect(outcome.properties.daysElapsed).toBe(4);

      const interview = await service.trackInterview(TENANT_ID, RAW_USER_ID, 'app_001', {
        round: 1,
        format: 'technical',
      });
      expect(interview.eventName).toBe('interview_scheduled');
      expect(interview.properties.round).toBe(1);
    });

    it('tracks billing subscription events', async () => {
      const upgraded = await service.trackBilling(TENANT_ID, RAW_USER_ID, 'upgraded', {
        planId: 'search',
        quota: 'unlimited',
      });
      expect(upgraded.eventName).toBe('billing_upgraded');
      expect(upgraded.properties.planId).toBe('search');

      const exceeded = await service.trackBilling(TENANT_ID, RAW_USER_ID, 'quota_exceeded', {
        planId: 'free',
        quota: 3,
      });
      expect(exceeded.eventName).toBe('billing_quota_exceeded');
    });
  });
});
