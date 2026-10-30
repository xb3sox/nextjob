import crypto from 'node:crypto';
import { BILLING_PLANS } from './billing-plans';
import { BillingStore } from './billing-store';
import {
  type BillingPlanId,
  QuotaExceededError,
  type StripeWebhookEvent,
  type UserEntitlements,
  type UserSubscription,
} from './types';

export class BillingService {
  constructor(private readonly store: BillingStore = new BillingStore()) {}

  async getSubscription(tenantId: string, userId: string): Promise<UserSubscription> {
    const existing = await this.store.findSubscriptionByUser(tenantId, userId);
    const now = new Date();

    if (existing) {
      // Check if paid subscription has expired
      if (existing.planId !== 'free' && existing.currentPeriodEnd < now) {
        existing.status = 'expired';
        await this.store.saveSubscription(existing);
      } else {
        return existing;
      }
    }

    // Default to Free Plan with 30-day rolling period
    const defaultEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return {
      id: `sub_free_${userId}`,
      tenantId,
      userId,
      planId: 'free',
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: defaultEnd,
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getEntitlements(tenantId: string, userId: string): Promise<UserEntitlements> {
    const sub = await this.getSubscription(tenantId, userId);
    const isPaidActive = sub.status === 'active' || sub.status === 'trialing';
    const effectivePlanId: BillingPlanId = isPaidActive ? sub.planId : 'free';
    const plan = BILLING_PLANS[effectivePlanId];

    const tailoringUsed = await this.store.getFeatureUsage(tenantId, userId, 'tailoring');
    const canTailor =
      plan.tailoringQuotaPerPeriod === 'unlimited' || tailoringUsed < plan.tailoringQuotaPerPeriod;

    return {
      planId: effectivePlanId,
      planName: plan.name,
      status: sub.status,
      tailoringQuota: plan.tailoringQuotaPerPeriod,
      tailoringUsed,
      canTailor,
      hasInterviewPrep: plan.features.interviewPrep,
      hasAutomation: plan.features.automatedSubmission,
      expiresAt: sub.currentPeriodEnd,
    };
  }

  async recordTailoringUsage(tenantId: string, userId: string): Promise<number> {
    const entitlements = await this.getEntitlements(tenantId, userId);
    if (!entitlements.canTailor) {
      throw new QuotaExceededError('tailored applications', entitlements.tailoringQuota as number);
    }

    return this.store.incrementFeatureUsage(tenantId, userId, 'tailoring');
  }

  async createCheckoutSession(
    tenantId: string,
    userId: string,
    planId: BillingPlanId,
    customerEmail?: string
  ): Promise<{ sessionId: string; checkoutUrl: string }> {
    if (planId === 'free') {
      throw new Error('Cannot create checkout session for free tier');
    }

    const plan = BILLING_PLANS[planId];
    if (!plan) {
      throw new Error(`Invalid plan: ${planId}`);
    }

    const sessionId = `cs_test_${crypto.randomUUID()}`;
    const checkoutUrl = `https://checkout.stripe.com/c/pay/${sessionId}?client_reference_id=${encodeURIComponent(
      `${tenantId}:${userId}`
    )}&email=${encodeURIComponent(customerEmail || '')}`;

    return { sessionId, checkoutUrl };
  }

  async handleStripeWebhook(
    event: StripeWebhookEvent
  ): Promise<{ processed: boolean; reason?: string }> {
    // 1. Enforce idempotency: ignore duplicate webhook calls
    if (this.store.hasProcessedWebhookEvent(event.id)) {
      return { processed: false, reason: 'ALREADY_PROCESSED' };
    }

    const dataObj = event.data.object;

    switch (event.type) {
      case 'checkout.session.completed': {
        const metadata = (dataObj.metadata as Record<string, string>) || {};
        const tenantId = metadata.tenantId;
        const userId = metadata.userId;
        const planId = (metadata.planId as BillingPlanId) || 'search';
        const stripeCustomerId = dataObj.customer as string;
        const stripeSubscriptionId =
          (dataObj.subscription as string) || `sub_stripe_${crypto.randomUUID()}`;

        if (!tenantId || !userId) {
          return { processed: false, reason: 'MISSING_METADATA' };
        }

        const now = new Date();
        const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        await this.store.saveSubscription({
          tenantId,
          userId,
          planId,
          status: 'active',
          stripeCustomerId,
          stripeSubscriptionId,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
        });

        // Reset usage counters for new billing period
        await this.store.resetFeatureUsage(tenantId, userId, 'tailoring');
        break;
      }

      case 'customer.subscription.updated': {
        const subId = dataObj.id as string;
        const status = dataObj.status as string;
        const currentPeriodEndSec = dataObj.current_period_end as number;

        const sub = await this.store.findSubscriptionByStripeId(subId);
        if (sub) {
          if (status === 'active' || status === 'past_due' || status === 'canceled') {
            sub.status = status;
          }
          if (currentPeriodEndSec) {
            sub.currentPeriodEnd = new Date(currentPeriodEndSec * 1000);
          }
          await this.store.saveSubscription(sub);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subId = dataObj.id as string;
        const sub = await this.store.findSubscriptionByStripeId(subId);
        if (sub) {
          sub.status = 'canceled';
          await this.store.saveSubscription(sub);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const subId = dataObj.subscription as string;
        if (subId) {
          const sub = await this.store.findSubscriptionByStripeId(subId);
          if (sub) {
            sub.status = 'past_due';
            await this.store.saveSubscription(sub);
          }
        }
        break;
      }

      default:
        // Ignore unhandled Stripe event types safely
        break;
    }

    this.store.markWebhookEventProcessed(event.id);
    return { processed: true };
  }
}
