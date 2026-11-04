import dayjs from "dayjs";

import { PaymentStatus, SubscriptionStatus } from "@workspace/billing";
import {
  getSubscriptionByExternalId,
  upsertCustomer,
  upsertOrder,
  upsertSubscription,
} from "@workspace/billing/server";
import { HttpStatusCode } from "@workspace/shared/constants";
import { logger } from "@workspace/shared/logger";
import { HttpException } from "@workspace/shared/utils";

import { BillingProvider } from "../../../types";
import { toSubscriptionStatus } from "../mappers/to-billing-status";
import { webhookEventSchema } from "../schema/webhook-event";
import { FAILED_PAYMENT_EVENTS, REVENUE_EVENTS } from "./constants";
import { verifySignature } from "./verify";

import type { WebhookCallbacks } from "../../../types";
import type { WebhookEvent } from "../schema/webhook-event";
import type { SelectSubscription } from "@workspace/db/schema";

const getUserIdFromAttributes = (
  attrs: Record<string, unknown> | null | undefined,
) => {
  const candidates = [
    attrs?.referenceId,
    attrs?.organizationId,
    attrs?.userId,
    attrs?.user_id,
    attrs?.uid,
    attrs?.id,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
  }

  return null;
};

const getSubscriptionPeriod = (
  event: WebhookEvent,
  existing: SelectSubscription | null,
) => {
  const periodStartsAt = event.data.purchasedAt
    ? dayjs(event.data.purchasedAt).toDate()
    : existing?.periodStartsAt;
  const periodEndsAt = event.data.expirationAt
    ? dayjs(event.data.expirationAt).toDate()
    : existing?.periodEndsAt;

  if (!periodStartsAt || !periodEndsAt) {
    return null;
  }

  return { periodStartsAt, periodEndsAt };
};

const isOutOfOrder = (
  event: WebhookEvent,
  existing: SelectSubscription | null,
) => {
  if (!existing || !event.data.expirationAt) {
    return false;
  }

  const expirationAt = dayjs(event.data.expirationAt);

  if (expirationAt.isBefore(existing.periodEndsAt)) {
    return true;
  }

  return (
    expirationAt.isSame(existing.periodEndsAt) &&
    existing.status === SubscriptionStatus.CANCELED &&
    event.type !== "uncancellation"
  );
};

export const webhookHandler = async (
  req: Request,
  callbacks?: WebhookCallbacks,
) => {
  const body = await req.text();
  await verifySignature(req.headers, body);

  await callbacks?.onEvent?.(JSON.parse(body));
  const event = webhookEventSchema.parse(JSON.parse(body));
  const userIdFromAttributes = getUserIdFromAttributes(
    event.data.userAttributes ?? null,
  );
  const userId = userIdFromAttributes ?? event.data.originalAppUserId;

  if (!userId) {
    throw new HttpException(HttpStatusCode.BAD_REQUEST, {
      code: "billing:error.webhook.userIdNotFound",
    });
  }

  logger.info(`🔔  Webhook received: ${event.type}`);

  const [customer] = await upsertCustomer({
    referenceId: userId,
    externalId: userId,
    provider: BillingProvider.SUPERWALL,
  });

  if (!customer) {
    throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, {
      code: "billing:error.customerNotFound",
    });
  }

  const productId = event.data.productId;
  const store = event.data.store.toLowerCase();
  const originalTransactionId =
    event.type === "non_renewing_purchase"
      ? null
      : event.data.originalTransactionId;
  const transactionId = event.data.transactionId;

  if (!productId) {
    throw new HttpException(HttpStatusCode.BAD_REQUEST, {
      code: "billing:error.webhook.productIdNotFound",
    });
  }

  if (originalTransactionId) {
    const status = toSubscriptionStatus(event);

    const existingSubscription = await getSubscriptionByExternalId({
      externalId: originalTransactionId,
      store,
    });
    const period = getSubscriptionPeriod(event, existingSubscription);

    if (!period) {
      logger.warn(
        `⚠️ Skipping ${event.type} for subscription ${originalTransactionId}: missing billing period dates`,
      );
    } else if (isOutOfOrder(event, existingSubscription)) {
      logger.info(
        `ℹ️ Skipping out-of-order ${event.type} for subscription ${originalTransactionId}`,
      );
    } else {
      await upsertSubscription({
        customerId: customer.id,
        externalId: originalTransactionId,
        variantId: productId,
        status,
        store,
        ...period,
        ...(event.data.periodType === "TRIAL"
          ? {
              trialStartsAt: event.data.purchasedAt
                ? dayjs(event.data.purchasedAt).toDate()
                : null,
              trialEndsAt: event.data.expirationAt
                ? dayjs(event.data.expirationAt).toDate()
                : null,
            }
          : {}),
      });

      logger.info(
        `✅ Subscription ${originalTransactionId} upserted for customer ${customer.id} with status ${status}`,
      );

      if (event.type === "initial_purchase") {
        await callbacks?.onSubscriptionCreated?.(originalTransactionId);
      } else if (event.type === "cancellation" || event.type === "expiration") {
        await callbacks?.onSubscriptionDeleted?.(originalTransactionId);
      } else {
        await callbacks?.onSubscriptionUpdated?.(originalTransactionId);
      }
    }
  }

  if (transactionId && REVENUE_EVENTS.has(event.type)) {
    await upsertOrder({
      customerId: customer.id,
      externalId: transactionId,
      variantId: productId,
      status: PaymentStatus.SUCCEEDED,
      store,
    });

    logger.info(
      `✅ Order ${transactionId} upserted for customer ${customer.id} with status ${PaymentStatus.SUCCEEDED}`,
    );

    if (event.type === "non_renewing_purchase") {
      await callbacks?.onOneTimePurchaseSucceeded?.(transactionId);
    }
  }

  if (FAILED_PAYMENT_EVENTS.has(event.type)) {
    const attemptId = transactionId ?? event.data.id;

    await upsertOrder({
      customerId: customer.id,
      externalId: attemptId,
      variantId: productId,
      status: PaymentStatus.FAILED,
      store,
    });

    logger.info(
      `⚠️ Order attempt ${attemptId} upserted for customer ${customer.id} with status ${PaymentStatus.FAILED}`,
    );
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
