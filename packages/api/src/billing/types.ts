/**
 * Billing, Subscription, and Entitlement types (T-32, FR-MON-01..04).
 */

export type BillingPlanId = 'free' | 'search' | 'agent';

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'expired' | 'trialing';

export interface BillingPlanFeatures {
  profileBuilder: boolean;
  jobDiscovery: boolean;
  fitExplanations: boolean;
  applicationTracker: boolean;
  interviewPrep: boolean;
  unlimitedTailoring: boolean;
  automatedSubmission: boolean;
}

export interface BillingPlan {
  id: BillingPlanId;
  name: string;
  priceInCents: number; // 0 for free, 3900 for Search ($39)
  billingPeriodDays: number;
  tailoringQuotaPerPeriod: number | 'unlimited';
  features: BillingPlanFeatures;
}

export interface UserSubscription {
  id: string;
  tenantId: string;
  userId: string;
  planId: BillingPlanId;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserEntitlements {
  planId: BillingPlanId;
  planName: string;
  status: SubscriptionStatus;
  tailoringQuota: number | 'unlimited';
  tailoringUsed: number;
  canTailor: boolean;
  hasInterviewPrep: boolean;
  hasAutomation: boolean;
  expiresAt: Date;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

export class QuotaExceededError extends Error {
  public readonly code = 'QUOTA_EXCEEDED';
  constructor(
    public readonly feature: string,
    public readonly limit: number
  ) {
    super(
      `Free tier limit exceeded for ${feature} (${limit} allowed per period). Upgrade to Search Pass for unlimited access (FR-MON-02).`
    );
    this.name = 'QuotaExceededError';
  }
}
