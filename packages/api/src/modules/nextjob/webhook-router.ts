import { Hono } from "hono";

import { atsProviderSchema } from "../../schema/nextjob";
import {
  processAtsWebhookEvent,
  verifyAtsWebhookSignature,
  type AtsProvider,
} from "./webhook-service";

import type { Context } from "hono";

const resolveWebhookSecret = (provider: AtsProvider): string | undefined => {
  if (provider === "greenhouse") {
    return (
      process.env.GREENHOUSE_WEBHOOK_SECRET || process.env.ATS_WEBHOOK_SECRET
    );
  }
  return process.env.LEVER_WEBHOOK_SECRET || process.env.ATS_WEBHOOK_SECRET;
};

const handleAtsWebhookRequest = async (c: Context, provider: AtsProvider) => {
  const rawBody = await c.req.text();
  if (!rawBody || rawBody.trim().length === 0) {
    return c.json(
      {
        error: "Bad Request",
        message: "Empty or missing request body",
      },
      400,
    );
  }

  let parsedBody: Record<string, unknown> | null = null;
  try {
    parsedBody = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return c.json(
      {
        error: "Bad Request",
        message: "Invalid JSON payload",
      },
      400,
    );
  }

  const signatureHeader =
    c.req.header("signature") ||
    c.req.header("x-greenhouse-signature") ||
    c.req.header("x-lever-signature") ||
    c.req.header("x-signature");

  const secret = resolveWebhookSecret(provider);
  if (!secret) {
    return c.json(
      {
        error: "Unauthorized",
        message: `Webhook secret not configured for ${provider}`,
      },
      401,
    );
  }

  const verification = verifyAtsWebhookSignature({
    provider,
    rawBody,
    signatureHeader,
    secret,
    parsedBody,
  });

  if (!verification.valid) {
    return c.json(
      {
        error: "Unauthorized",
        message: verification.error || "Invalid webhook signature",
      },
      401,
    );
  }

  const result = processAtsWebhookEvent(provider, parsedBody);
  return c.json(
    {
      success: true,
      provider,
      eventType: result.eventType,
      handled: result.handled,
      timestamp: new Date().toISOString(),
    },
    200,
  );
};

export const atsWebhookRouter = new Hono()
  .post("/greenhouse", async (c) => {
    return handleAtsWebhookRequest(c, "greenhouse");
  })
  .post("/lever", async (c) => {
    return handleAtsWebhookRequest(c, "lever");
  })
  .post("/:provider", async (c) => {
    const rawProvider = c.req.param("provider");
    const parsedProvider = atsProviderSchema.safeParse(
      rawProvider.toLowerCase(),
    );
    if (!parsedProvider.success) {
      return c.json(
        {
          error: "Bad Request",
          message: `Unsupported ATS provider: ${rawProvider}`,
        },
        400,
      );
    }
    return handleAtsWebhookRequest(c, parsedProvider.data);
  });
