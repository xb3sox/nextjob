import { beforeEach, describe, expect, it } from 'vitest';
import { BillingService } from './billing-service';
import { BillingStore } from './billing-store';
import { QuotaExceededError, type StripeWebhookEvent } from './types';

describe('Stripe Billing & Entitlements (T-32, FR-MON-01..04)', () => {
  let store: BillingStore;
  let service: BillingService;

  const TENANT_A = 'tenant_001';
  const TENANT_B = 'tenant_002';
  const USER_1 = 'user_001';
  const USER_2 = 'user_002';

  beforeEach(() => {
    store = new BillingStore();
    service = new BillingService(store);
  });

  describe('Free Tier Limits (FR-MON-01)', () => {
    it('defaults new user to Free tier with 3 tailoring operations', async () => {
      const entitlements = await service.getEntitlements(TENANT_A, USER_1);

      expect(entitlements.planId).toBe('free');
      expect(entitlements.planName).toBe('Free Tier');
      expect(entitlements.tailoringQuota).toBe(3);
      expect(entitlements.tailoringUsed).toBe(0);
      expect(entitlements.canTailor).toBe(true);
      expect(entitlements.hasInterviewPrep).toBe(false);
      expect(entitlements.hasAutomation).toBe(false);
    });

    it('allows tailoring up to 3 times and blocks 4th attempt', async () => {
      // 1st tailoring
      const use1 = await service.recordTailoringUsage(TENANT_A, USER_1);
      expect(use1).toBe(1);

      // 2nd tailoring
      const use2 = await service.recordTailoringUsage(TENANT_A, USER_1);
      expect(use2).toBe(2);

      // 3rd tailoring
      const use3 = await service.recordTailoringUsage(TENANT_A, USER_1);
      expect(use3).toBe(3);

      const statusAfter3 = await service.getEntitlements(TENANT_A, USER_1);
      expect(statusAfter3.canTailor).toBe(false);
      expect(statusAfter3.tailoringUsed).toBe(3);

      // 4th tailoring throws QuotaExceededError
      await expect(service.recordTailoringUsage(TENANT_A, USER_1)).rejects.toThrow(
        QuotaExceededError
      );

      try {
        await service.recordTailoringUsage(TENANT_A, USER_1);
      } catch (err: unknown) {
        const quotaError = err as QuotaExceededError;
        expect(quotaError.code).toBe('QUOTA_EXCEEDED');
        expect(quotaError.limit).toBe(3);
        expect(quotaError.message).toContain('Upgrade to Search Pass for unlimited access');
      }
    });
  });

  describe('Search Pass ($39/30 days) Upgrade & Entitlements (FR-MON-02)', () => {
    it('generates Stripe checkout session for Search Pass', async () => {
      const session = await service.createCheckoutSession(
        TENANT_A,
        USER_1,
        'search',
        'candidate@example.com'
      );

      expect(session.sessionId).toMatch(/^cs_test_/);
      expect(session.checkoutUrl).toContain('checkout.stripe.com');
      expect(session.checkoutUrl).toContain('candidate%40example.com');
    });

    it('rejects checkout session creation for free plan', async () => {
      await expect(service.createCheckoutSession(TENANT_A, USER_1, 'free')).rejects.toThrow(
        /cannot create checkout session for free tier/i
      );
    });

    it('activates Search Pass via Stripe webhook and grants unlimited tailoring', async () => {
      // Use up 3 free tailoring quotas
      for (let i = 0; i < 3; i++) {
        await service.recordTailoringUsage(TENANT_A, USER_1);
      }
      expect((await service.getEntitlements(TENANT_A, USER_1)).canTailor).toBe(false);

      // Trigger checkout.session.completed webhook
      const webhookEvent: StripeWebhookEvent = {
        id: 'evt_stripe_checkout_001',
        type: 'checkout.session.completed',
        data: {
          object: {
            customer: 'cus_123',
            subscription: 'sub_stripe_search_123',
            metadata: {
              tenantId: TENANT_A,
              userId: USER_1,
              planId: 'search',
            },
          },
        },
      };

      const result = await service.handleStripeWebhook(webhookEvent);
      expect(result.processed).toBe(true);

      const entitlements = await service.getEntitlements(TENANT_A, USER_1);
      expect(entitlements.planId).toBe('search');
      expect(entitlements.planName).toBe('Search Pass');
      expect(entitlements.tailoringQuota).toBe('unlimited');
      expect(entitlements.tailoringUsed).toBe(0); // usage was reset for new billing cycle
      expect(entitlements.canTailor).toBe(true);
      expect(entitlements.hasInterviewPrep).toBe(true);
      expect(entitlements.hasAutomation).toBe(false);

      // Can tailor multiple times with Search Pass without hitting limits
      for (let i = 0; i < 10; i++) {
        await service.recordTailoringUsage(TENANT_A, USER_1);
      }

      const activeEntitlements = await service.getEntitlements(TENANT_A, USER_1);
      expect(activeEntitlements.canTailor).toBe(true);
      expect(activeEntitlements.tailoringUsed).toBe(10);
    });
  });

  describe('Webhook Idempotency & Lifecycle Events', () => {
    it('enforces webhook idempotency: duplicate event IDs are ignored safely', async () => {
      const webhookEvent: StripeWebhookEvent = {
        id: 'evt_idempotent_test_001',
        type: 'checkout.session.completed',
        data: {
          object: {
            customer: 'cus_repeat',
            subscription: 'sub_repeat_001',
            metadata: {
              tenantId: TENANT_A,
              userId: USER_1,
              planId: 'search',
            },
          },
        },
      };

      const firstCall = await service.handleStripeWebhook(webhookEvent);
      expect(firstCall.processed).toBe(true);

      const duplicateCall = await service.handleStripeWebhook(webhookEvent);
      expect(duplicateCall.processed).toBe(false);
      expect(duplicateCall.reason).toBe('ALREADY_PROCESSED');
    });

    it('handles customer.subscription.deleted by downgrading entitlements to free tier', async () => {
      // 1. Activate search subscription
      await service.handleStripeWebhook({
        id: 'evt_init_sub',
        type: 'checkout.session.completed',
        data: {
          object: {
            customer: 'cus_cancel_test',
            subscription: 'sub_to_cancel',
            metadata: {
              tenantId: TENANT_A,
              userId: USER_1,
              planId: 'search',
            },
          },
        },
      });

      expect((await service.getEntitlements(TENANT_A, USER_1)).planId).toBe('search');

      // 2. Cancellation webhook received from Stripe
      await service.handleStripeWebhook({
        id: 'evt_del_sub',
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_to_cancel',
          },
        },
      });

      // 3. Entitlements fall back to free tier
      const entitlements = await service.getEntitlements(TENANT_A, USER_1);
      expect(entitlements.planId).toBe('free');
      expect(entitlements.tailoringQuota).toBe(3);
      expect(entitlements.hasInterviewPrep).toBe(false);
    });

    it('handles invoice.payment_failed by setting status to past_due', async () => {
      await service.handleStripeWebhook({
        id: 'evt_activate_for_failed',
        type: 'checkout.session.completed',
        data: {
          object: {
            customer: 'cus_fail_test',
            subscription: 'sub_fail_123',
            metadata: {
              tenantId: TENANT_A,
              userId: USER_1,
              planId: 'search',
            },
          },
        },
      });

      await service.handleStripeWebhook({
        id: 'evt_invoice_failed',
        type: 'invoice.payment_failed',
        data: {
          object: {
            subscription: 'sub_fail_123',
          },
        },
      });

      const sub = await service.getSubscription(TENANT_A, USER_1);
      expect(sub.status).toBe('past_due');
    });
  });

  describe('Tenant & User Isolation', () => {
    it('isolates subscriptions and quotas across tenants and users', async () => {
      // User 1 uses all 3 free tailoring quotas in Tenant A
      for (let i = 0; i < 3; i++) {
        await service.recordTailoringUsage(TENANT_A, USER_1);
      }
      expect((await service.getEntitlements(TENANT_A, USER_1)).canTailor).toBe(false);

      // User 2 in Tenant B has fresh quota of 3
      const user2Entitlements = await service.getEntitlements(TENANT_B, USER_2);
      expect(user2Entitlements.canTailor).toBe(true);
      expect(user2Entitlements.tailoringUsed).toBe(0);
    });
  });
});
