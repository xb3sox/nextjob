import { SubscriptionStatus } from "@workspace/billing";

import type { WebhookEvent } from "../schema/webhook-event";

export const toSubscriptionStatus = ({
  type,
  data,
}: WebhookEvent): SubscriptionStatus => {
  if (type === "billing_issue") {
    return SubscriptionStatus.PAST_DUE;
  }

  if (type === "subscription_paused") {
    return SubscriptionStatus.PAUSED;
  }

  if (type === "expiration") {
    return SubscriptionStatus.CANCELED;
  }

  if (type === "cancellation") {
    if (
      data.cancelReason === "CUSTOMER_SUPPORT" ||
      (data.expirationAt != null && data.expirationAt <= Date.now())
    ) {
      return SubscriptionStatus.CANCELED;
    }

    if (data.cancelReason === "BILLING_ERROR") {
      return SubscriptionStatus.PAST_DUE;
    }
  }

  if (data.periodType === "TRIAL") {
    return SubscriptionStatus.TRIALING;
  }

  return SubscriptionStatus.ACTIVE;
};
