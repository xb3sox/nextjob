import crypto from 'node:crypto';
import { anonymizeUserId, sanitizeAnalyticsPayload } from './sanitizer';
import type { AnalyticsEventType, AnalyticsSink, ProductAnalyticsEvent } from './types';

export class InMemoryAnalyticsSink implements AnalyticsSink {
  public events: ProductAnalyticsEvent[] = [];

  async record(event: ProductAnalyticsEvent): Promise<void> {
    this.events.push(event);
  }

  clear(): void {
    this.events = [];
  }
}

export class AnalyticsService {
  private sink: AnalyticsSink;

  constructor(sink?: AnalyticsSink) {
    this.sink = sink || new InMemoryAnalyticsSink();
  }

  private async track(
    eventName: AnalyticsEventType,
    tenantId: string,
    rawUserId: string,
    rawProperties: Record<string, unknown> = {}
  ): Promise<ProductAnalyticsEvent> {
    const userId = anonymizeUserId(rawUserId);
    const properties = sanitizeAnalyticsPayload(rawProperties);

    const event: ProductAnalyticsEvent = {
      id: crypto.randomUUID(),
      eventName,
      tenantId,
      userId,
      timestamp: new Date().toISOString(),
      properties,
    };

    await this.sink.record(event);
    return event;
  }

  // --- Domain Event Helpers (FR-ANA-01) ---

  async trackOnboarding(
    tenantId: string,
    userId: string,
    stage: 'started' | 'completed',
    metadata: {
      stepCount?: number;
      durationMs?: number;
      referralCode?: string;
      [key: string]: unknown;
    } = {}
  ): Promise<ProductAnalyticsEvent> {
    return this.track(
      stage === 'started' ? 'onboarding_started' : 'onboarding_completed',
      tenantId,
      userId,
      metadata
    );
  }

  async trackClaimVerification(
    tenantId: string,
    userId: string,
    claimId: string,
    action: 'verified' | 'rejected',
    metadata: { claimType?: string; confidence?: number } = {}
  ): Promise<ProductAnalyticsEvent> {
    return this.track(
      action === 'verified' ? 'claim_verified' : 'claim_rejected',
      tenantId,
      userId,
      { claimId, ...metadata }
    );
  }

  async trackJobImpression(
    tenantId: string,
    userId: string,
    jobId: string,
    metadata: { fitScore?: number; eligibilityStatus?: string } = {}
  ): Promise<ProductAnalyticsEvent> {
    return this.track('job_impression', tenantId, userId, { jobId, ...metadata });
  }

  async trackJobAction(
    tenantId: string,
    userId: string,
    jobId: string,
    action: 'save' | 'hide' | 'start_application',
    metadata: { rank?: number } = {}
  ): Promise<ProductAnalyticsEvent> {
    return this.track('job_action', tenantId, userId, { jobId, action, ...metadata });
  }

  async trackEligibility(
    tenantId: string,
    userId: string,
    jobId: string,
    result: { status: 'eligible' | 'ineligible' | 'unknown'; confidence: number; ruleCount: number }
  ): Promise<ProductAnalyticsEvent> {
    return this.track('eligibility_evaluated', tenantId, userId, {
      jobId,
      status: result.status,
      confidence: result.confidence,
      ruleCount: result.ruleCount,
    });
  }

  async trackTailoring(
    tenantId: string,
    userId: string,
    jobId: string,
    stage: 'started' | 'completed',
    metadata: { claimCount?: number; durationMs?: number; success?: boolean } = {}
  ): Promise<ProductAnalyticsEvent> {
    return this.track(
      stage === 'started' ? 'tailoring_started' : 'tailoring_completed',
      tenantId,
      userId,
      { jobId, ...metadata }
    );
  }

  async trackApproval(
    tenantId: string,
    userId: string,
    requestId: string,
    decision: 'requested' | 'granted' | 'rejected',
    metadata: { riskLevel?: string; reason?: string } = {}
  ): Promise<ProductAnalyticsEvent> {
    return this.track(
      decision === 'requested' ? 'approval_requested' : 'approval_decided',
      tenantId,
      userId,
      { requestId, decision, ...metadata }
    );
  }

  async trackSubmission(
    tenantId: string,
    userId: string,
    applicationId: string,
    status: 'started' | 'completed' | 'failed',
    metadata: { connector?: string; failureCategory?: string } = {}
  ): Promise<ProductAnalyticsEvent> {
    const eventName: AnalyticsEventType =
      status === 'started'
        ? 'submission_started'
        : status === 'completed'
          ? 'submission_completed'
          : 'submission_failed';

    return this.track(eventName, tenantId, userId, { applicationId, status, ...metadata });
  }

  async trackOutcome(
    tenantId: string,
    userId: string,
    applicationId: string,
    outcome: 'interview' | 'rejected' | 'offer' | 'withdrawn' | 'hired',
    metadata: { daysElapsed?: number } = {}
  ): Promise<ProductAnalyticsEvent> {
    return this.track('outcome_recorded', tenantId, userId, {
      applicationId,
      outcome,
      ...metadata,
    });
  }

  async trackInterview(
    tenantId: string,
    userId: string,
    applicationId: string,
    metadata: { round?: number; format?: string } = {}
  ): Promise<ProductAnalyticsEvent> {
    return this.track('interview_scheduled', tenantId, userId, {
      applicationId,
      ...metadata,
    });
  }

  async trackBilling(
    tenantId: string,
    userId: string,
    event: 'upgraded' | 'quota_exceeded' | 'canceled',
    metadata: { planId?: string; quota?: number | string } = {}
  ): Promise<ProductAnalyticsEvent> {
    const eventName: AnalyticsEventType =
      event === 'upgraded'
        ? 'billing_upgraded'
        : event === 'quota_exceeded'
          ? 'billing_quota_exceeded'
          : 'billing_canceled';

    return this.track(eventName, tenantId, userId, metadata);
  }

  getSink(): AnalyticsSink {
    return this.sink;
  }
}
