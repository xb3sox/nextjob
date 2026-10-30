export type AnalyticsEventType =
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'claim_verified'
  | 'claim_rejected'
  | 'job_impression'
  | 'job_action'
  | 'eligibility_evaluated'
  | 'tailoring_started'
  | 'tailoring_completed'
  | 'approval_requested'
  | 'approval_decided'
  | 'submission_started'
  | 'submission_completed'
  | 'submission_failed'
  | 'outcome_recorded'
  | 'interview_scheduled'
  | 'billing_upgraded'
  | 'billing_quota_exceeded'
  | 'billing_canceled';

export interface ProductAnalyticsEvent {
  id: string;
  eventName: AnalyticsEventType;
  tenantId: string;
  userId: string; // Deterministically anonymized
  timestamp: string;
  properties: Record<string, unknown>;
}

export interface AnalyticsSink {
  record(event: ProductAnalyticsEvent): Promise<void>;
}
