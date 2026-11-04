import {
  createCheckout,
  getCustomer,
  getOrder,
} from "@lemonsqueezy/lemonsqueezy.js";

import {
  BillingModel,
  BillingType,
  config,
  findVariantById,
} from "@workspace/billing";
import {
  getCustomerById,
  getCustomerByExternalId,
  getCustomersByReferenceId,
  getOrganizationBillableSeatsCount,
  upsertOrder,
} from "@workspace/billing/server";
import { HttpStatusCode } from "@workspace/shared/constants";
import { logger } from "@workspace/shared/logger";
import { HttpException } from "@workspace/shared/utils";

import { BillingProvider } from "../types";
import { createOrRetrieveCustomer } from "./customer";
import { env } from "./env";
import { toPaymentStatus } from "./mappers/to-billing-status";

import type { CheckoutPayload, GetBillingPortalPayload } from "../../schema";
import type { BillingUser } from "../types";

export const checkout = async ({
  user,
  referenceId,
  variant: { id },
  discount,
  redirect,
}: CheckoutPayload & { user: BillingUser }) => {
  try {
    const variant = config.plans
      .find((plan) => plan.variants.some((v) => v.id === id))
      ?.variants.find((v) => v.id === id);

    if (!variant) {
      throw new HttpException(HttpStatusCode.NOT_FOUND, {
        code: "billing:error.variantNotFound",
      });
    }

    const { customer, lemonSqueezyCustomer } = await createOrRetrieveCustomer({
      referenceId,
      email: user.email,
    });
    const quantity =
      variant.type === BillingType.PER_SEAT
        ? await getOrganizationBillableSeatsCount(referenceId)
        : undefined;

    const session = await createCheckout(env.LEMON_SQUEEZY_STORE_ID, id, {
      checkoutData: {
        email: lemonSqueezyCustomer.attributes.email,
        name: lemonSqueezyCustomer.attributes.name,
        custom: {
          customer_id: customer?.id,
          user_id: user.id,
        },
        ...(quantity ? { quantity } : {}),
        ...(discount && { discountCode: discount.code }),
      },
      productOptions: {
        enabledVariants: [Number(id)],
        redirectUrl: redirect.success,
      },
    });

    return { url: session.data?.data.attributes.url ?? null };
  } catch (e) {
    logger.error(e);
    throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, {
      code: "billing:error.checkout",
    });
  }
};

export const getBillingPortal = async ({
  referenceId,
}: GetBillingPortalPayload & { user: BillingUser }) => {
  const defaultUrl = `https://${env.LEMON_SQUEEZY_STORE_ID}.lemonsqueezy.com/billing`;

  try {
    const [customer] = await getCustomersByReferenceId(referenceId, {
      provider: BillingProvider.LEMON_SQUEEZY,
    });

    if (!customer) {
      return {
        url: defaultUrl,
      };
    }

    const lemonCustomer = await getCustomer(customer.externalId);

    const url = lemonCustomer.data?.data.attributes.urls.customer_portal;

    return { url: url ?? defaultUrl };
  } catch (e) {
    logger.error(e);
    throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, {
      code: "billing:error.portal",
    });
  }
};

export const checkoutStatusChangeHandler = async ({
  id,
  customerId,
}: {
  id: string;
  customerId?: string;
}) => {
  const { data } = await getOrder(id);

  const order = data?.data;

  if (!order) {
    throw new HttpException(HttpStatusCode.NOT_FOUND, {
      code: "billing:error.orderNotFound",
    });
  }

  const variantId = order.attributes.first_order_item.variant_id.toString();

  if (findVariantById(variantId)?.model === BillingModel.RECURRING) {
    logger.info(
      `ℹ️ Order ${order.id} belongs to a subscription, skipping order upsert`,
    );
    return;
  }

  const customer = customerId
    ? await getCustomerById(customerId)
    : await getCustomerByExternalId(order.attributes.customer_id.toString());

  if (!customer) {
    throw new HttpException(HttpStatusCode.NOT_FOUND, {
      code: "billing:error.customerNotFound",
    });
  }

  const status = toPaymentStatus(order.attributes.status);

  await upsertOrder({
    customerId: customer.id,
    externalId: order.id,
    variantId,
    status,
    store: BillingProvider.LEMON_SQUEEZY,
  });

  logger.info(
    `✅ Order ${order.id} status changed for customer ${customer.id} to ${status}`,
  );
};
