import type { BillingPlan, BillingPlanId } from './types';

export const BILLING_PLANS: Readonly<Record<BillingPlanId, BillingPlan>> = {
  free: {
    id: 'free',
    name: 'Free Tier',
    priceInCents: 0,
    billingPeriodDays: 30,
    tailoringQuotaPerPeriod: 3, // Limited assistance per FR-MON-01
    features: {
      profileBuilder: true,
      jobDiscovery: true,
      fitExplanations: true,
      applicationTracker: true,
      interviewPrep: false,
      unlimitedTailoring: false,
      automatedSubmission: false,
    },
  },
  search: {
    id: 'search',
    name: 'Search Pass',
    priceInCents: 3900, // $39 per 30-day period per FR-MON-02
    billingPeriodDays: 30,
    tailoringQuotaPerPeriod: 'unlimited',
    features: {
      profileBuilder: true,
      jobDiscovery: true,
      fitExplanations: true,
      applicationTracker: true,
      interviewPrep: true,
      unlimitedTailoring: true,
      automatedSubmission: false,
    },
  },
  agent: {
    id: 'agent',
    name: 'Agent Tier',
    priceInCents: 9900, // Full automation tier per FR-MON-03
    billingPeriodDays: 30,
    tailoringQuotaPerPeriod: 'unlimited',
    features: {
      profileBuilder: true,
      jobDiscovery: true,
      fitExplanations: true,
      applicationTracker: true,
      interviewPrep: true,
      unlimitedTailoring: true,
      automatedSubmission: true,
    },
  },
};
