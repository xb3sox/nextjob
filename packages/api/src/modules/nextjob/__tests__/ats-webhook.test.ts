import { Hono } from "hono";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as z from "zod";

import { atsWebhookRouter } from "../webhook-router";
import {
  computeHmacSha256,
  createAtsWebhookSignature,
  normalizeSignature,
  processAtsWebhookEvent,
  timingSafeCompare,
  verifyAtsWebhookSignature,
  verifyGreenhouseSignature,
  verifyHmacSha256,
  verifyLeverSignature,
} from "../webhook-service";

describe("Inbound Enterprise ATS Webhook Verification (Issue #311)", () => {
  const greenhouseSecret = "gh_sec_test_secret_key_998877";
  const leverSecret = "lever_sec_test_token_445566";

  const webhookSuccessSchema = z.object({
    success: z.boolean(),
    provider: z.string(),
    eventType: z.string(),
    handled: z.boolean().optional(),
  });

  const webhookErrorSchema = z.object({
    error: z.string(),
    message: z.string().optional(),
  });

  beforeEach(() => {
    process.env.GREENHOUSE_WEBHOOK_SECRET = greenhouseSecret;
    process.env.LEVER_WEBHOOK_SECRET = leverSecret;
  });

  afterEach(() => {
    delete process.env.GREENHOUSE_WEBHOOK_SECRET;
    delete process.env.LEVER_WEBHOOK_SECRET;
  });

  // --------------------------------------------------------------------------
  // Core HMAC-SHA256 Utility Tests
  // --------------------------------------------------------------------------
  describe("HMAC-SHA256 Core Verification & Timing Safety", () => {
    it("compares strings in constant time and rejects mismatching lengths or characters", () => {
      expect(timingSafeCompare("abcdef123456", "abcdef123456")).toBe(true);
      expect(timingSafeCompare("abcdef123456", "abcdef123457")).toBe(false);
      expect(timingSafeCompare("abcdef123456", "abcdef12345")).toBe(false);
      expect(timingSafeCompare("", "")).toBe(true);
    });

    it("normalizes algorithm prefixes and whitespace", () => {
      expect(
        normalizeSignature(
          "sha256 37d2725109df92747ffcee59833a1d1262d74b9703fa1234c789407218b4a4ef",
        ),
      ).toBe(
        "37d2725109df92747ffcee59833a1d1262d74b9703fa1234c789407218b4a4ef",
      );
      expect(
        normalizeSignature(
          "sha256=37d2725109df92747ffcee59833a1d1262d74b9703fa1234c789407218b4a4ef ",
        ),
      ).toBe(
        "37d2725109df92747ffcee59833a1d1262d74b9703fa1234c789407218b4a4ef",
      );
    });

    it("verifies valid HMAC-SHA256 hex signatures and rejects tampered digests", () => {
      const payload = JSON.stringify({ action: "ping", timestamp: 123456 });
      const validHex = computeHmacSha256(payload, greenhouseSecret, "hex");

      expect(verifyHmacSha256(payload, validHex, greenhouseSecret)).toBe(true);

      // Tampered signature character
      const tamperedHex =
        validHex.slice(0, -1) + (validHex.endsWith("0") ? "1" : "0");
      expect(verifyHmacSha256(payload, tamperedHex, greenhouseSecret)).toBe(
        false,
      );

      // Tampered payload
      const tamperedPayload = JSON.stringify({
        action: "ping",
        timestamp: 123457,
      });
      expect(
        verifyHmacSha256(tamperedPayload, validHex, greenhouseSecret),
      ).toBe(false);

      // Wrong secret
      expect(verifyHmacSha256(payload, validHex, "wrong_secret_123")).toBe(
        false,
      );
    });
  });

  // --------------------------------------------------------------------------
  // Greenhouse ATS Webhook Verification
  // --------------------------------------------------------------------------
  describe("Greenhouse Webhook Verification", () => {
    const greenhousePayload = JSON.stringify({
      action: "candidate_stage_change",
      payload: {
        candidate: {
          id: 98765,
          first_name: "Alex",
          last_name: "Candidate",
        },
        application: {
          id: 54321,
          status: "active",
          current_stage: { name: "Technical Interview" },
        },
      },
    });

    it("verifies valid Greenhouse signatures with `sha256 <hex>` format", () => {
      const { headerValue } = createAtsWebhookSignature(
        "greenhouse",
        greenhousePayload,
        greenhouseSecret,
      );

      const isValid = verifyGreenhouseSignature(
        greenhousePayload,
        headerValue,
        greenhouseSecret,
      );
      expect(isValid).toBe(true);
    });

    it("verifies valid Greenhouse signatures with plain hex and `sha256=` format", () => {
      const rawHex = computeHmacSha256(
        greenhousePayload,
        greenhouseSecret,
        "hex",
      );

      expect(
        verifyGreenhouseSignature(greenhousePayload, rawHex, greenhouseSecret),
      ).toBe(true);
      expect(
        verifyGreenhouseSignature(
          greenhousePayload,
          `sha256=${rawHex}`,
          greenhouseSecret,
        ),
      ).toBe(true);
    });

    it("rejects tampered Greenhouse signatures", () => {
      const { headerValue } = createAtsWebhookSignature(
        "greenhouse",
        greenhousePayload,
        greenhouseSecret,
      );
      const tamperedHeader = `${headerValue.slice(0, -2)}ff`;

      expect(
        verifyGreenhouseSignature(
          greenhousePayload,
          tamperedHeader,
          greenhouseSecret,
        ),
      ).toBe(false);
    });

    it("rejects Greenhouse webhooks when payload has been modified", () => {
      const { headerValue } = createAtsWebhookSignature(
        "greenhouse",
        greenhousePayload,
        greenhouseSecret,
      );
      const modifiedPayload = greenhousePayload.replace(
        "Technical Interview",
        "Offer",
      );

      expect(
        verifyGreenhouseSignature(
          modifiedPayload,
          headerValue,
          greenhouseSecret,
        ),
      ).toBe(false);
    });

    it("rejects Greenhouse webhooks with missing signature or empty secret", () => {
      expect(
        verifyGreenhouseSignature(greenhousePayload, null, greenhouseSecret),
      ).toBe(false);
      expect(
        verifyGreenhouseSignature(
          greenhousePayload,
          undefined,
          greenhouseSecret,
        ),
      ).toBe(false);
      expect(verifyGreenhouseSignature(greenhousePayload, "any-sig", "")).toBe(
        false,
      );
    });
  });

  // --------------------------------------------------------------------------
  // Lever ATS Webhook Verification
  // --------------------------------------------------------------------------
  describe("Lever Webhook Verification", () => {
    it("verifies valid Lever body-embedded signatures (`secret + triggeredAt`)", () => {
      const triggeredAt = 1710000000000;
      const { signature } = createAtsWebhookSignature(
        "lever",
        {},
        leverSecret,
        { triggeredAt },
      );

      const leverBody: Record<string, unknown> = {
        event: "candidateStageChange",
        triggeredAt,
        signature,
        data: {
          candidateId: "cand-001",
          toStage: "Offer Extended",
        },
      };

      const rawBody = JSON.stringify(leverBody);
      const isValid = verifyLeverSignature(rawBody, {
        parsedBody: leverBody,
        secret: leverSecret,
      });

      expect(isValid).toBe(true);
    });

    it("rejects tampered Lever signatures in body", () => {
      const triggeredAt = 1710000000000;
      const { signature } = createAtsWebhookSignature(
        "lever",
        {},
        leverSecret,
        { triggeredAt },
      );

      const tamperedBody: Record<string, unknown> = {
        event: "candidateStageChange",
        triggeredAt,
        signature: signature.slice(0, -2) + "aa",
        data: { candidateId: "cand-001" },
      };

      expect(
        verifyLeverSignature(JSON.stringify(tamperedBody), {
          parsedBody: tamperedBody,
          secret: leverSecret,
        }),
      ).toBe(false);
    });

    it("rejects Lever webhooks if triggeredAt timestamp is altered", () => {
      const triggeredAt = 1710000000000;
      const { signature } = createAtsWebhookSignature(
        "lever",
        {},
        leverSecret,
        { triggeredAt },
      );

      const alteredTimestampBody: Record<string, unknown> = {
        event: "candidateStageChange",
        triggeredAt: triggeredAt + 5000,
        signature,
        data: { candidateId: "cand-001" },
      };

      expect(
        verifyLeverSignature(JSON.stringify(alteredTimestampBody), {
          parsedBody: alteredTimestampBody,
          secret: leverSecret,
        }),
      ).toBe(false);
    });

    it("verifies Lever requests signed via header fallback", () => {
      const rawBody = JSON.stringify({ event: "ping", id: "evt_123" });
      const rawHex = computeHmacSha256(rawBody, leverSecret, "hex");

      const isValid = verifyLeverSignature(rawBody, {
        signatureHeader: rawHex,
        secret: leverSecret,
      });
      expect(isValid).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // Unified verifyAtsWebhookSignature & Event Processing
  // --------------------------------------------------------------------------
  describe("Unified ATS Webhook Verifier", () => {
    it("handles Greenhouse and Lever with appropriate configuration", () => {
      const ghPayload = JSON.stringify({ action: "ping" });
      const { headerValue: ghHeader } = createAtsWebhookSignature(
        "greenhouse",
        ghPayload,
        greenhouseSecret,
      );

      const ghResult = verifyAtsWebhookSignature({
        provider: "greenhouse",
        rawBody: ghPayload,
        signatureHeader: ghHeader,
        secret: greenhouseSecret,
      });
      expect(ghResult.valid).toBe(true);

      const triggeredAt = 1710000000000;
      const { signature: leverSig } = createAtsWebhookSignature(
        "lever",
        {},
        leverSecret,
        { triggeredAt },
      );
      const leverBody = { event: "ping", triggeredAt, signature: leverSig };

      const leverResult = verifyAtsWebhookSignature({
        provider: "lever",
        rawBody: JSON.stringify(leverBody),
        parsedBody: leverBody,
        secret: leverSecret,
      });
      expect(leverResult.valid).toBe(true);
    });

    it("returns descriptive error on missing secret", () => {
      const result = verifyAtsWebhookSignature({
        provider: "greenhouse",
        rawBody: "{}",
        secret: "",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Missing webhook secret");
    });

    it("processes webhook event metadata accurately", () => {
      const ghResult = processAtsWebhookEvent("greenhouse", {
        action: "candidate_hired",
        payload: { candidate: { id: 1 } },
      });
      expect(ghResult.success).toBe(true);
      expect(ghResult.eventType).toBe("candidate_hired");
      expect(ghResult.handled).toBe(true);

      const leverResult = processAtsWebhookEvent("lever", {
        event: "candidateHired",
        data: { candidateId: "c_1" },
      });
      expect(leverResult.success).toBe(true);
      expect(leverResult.eventType).toBe("candidateHired");
      expect(leverResult.handled).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // Endpoint & Router Tests
  // --------------------------------------------------------------------------
  describe("ATS Webhook Router Endpoints", () => {
    it("POST /greenhouse returns 200 on valid signature", async () => {
      const payload = JSON.stringify({
        action: "candidate_stage_change",
        payload: { candidate: { id: 123 } },
      });
      const { headerValue } = createAtsWebhookSignature(
        "greenhouse",
        payload,
        greenhouseSecret,
      );

      const res = await atsWebhookRouter.request("/greenhouse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Signature: headerValue,
        },
        body: payload,
      });

      expect(res.status).toBe(200);
      const body = webhookSuccessSchema.parse(await res.json());
      expect(body.success).toBe(true);
      expect(body.provider).toBe("greenhouse");
      expect(body.eventType).toBe("candidate_stage_change");
      expect(body.handled).toBe(true);
    });

    it("POST /greenhouse returns 401 Unauthorized on tampered signature", async () => {
      const payload = JSON.stringify({ action: "ping" });
      const { headerValue } = createAtsWebhookSignature(
        "greenhouse",
        payload,
        greenhouseSecret,
      );
      const tamperedHeader = `${headerValue.slice(0, -2)}00`;

      const res = await atsWebhookRouter.request("/greenhouse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Signature: tamperedHeader,
        },
        body: payload,
      });

      expect(res.status).toBe(401);
      const body = webhookErrorSchema.parse(await res.json());
      expect(body.error).toBe("Unauthorized");
      expect(body.message).toContain("signature");
    });

    it("POST /greenhouse returns 401 Unauthorized on missing signature", async () => {
      const payload = JSON.stringify({ action: "ping" });

      const res = await atsWebhookRouter.request("/greenhouse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
      });

      expect(res.status).toBe(401);
      const body = webhookErrorSchema.parse(await res.json());
      expect(body.error).toBe("Unauthorized");
    });

    it("POST /lever returns 200 on valid body-embedded signature", async () => {
      const triggeredAt = 1715000000000;
      const { signature } = createAtsWebhookSignature(
        "lever",
        {},
        leverSecret,
        { triggeredAt },
      );

      const leverPayload = JSON.stringify({
        event: "candidateStageChange",
        triggeredAt,
        signature,
        data: { candidateId: "cand_lever_99" },
      });

      const res = await atsWebhookRouter.request("/lever", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: leverPayload,
      });

      expect(res.status).toBe(200);
      const body = webhookSuccessSchema.parse(await res.json());
      expect(body.success).toBe(true);
      expect(body.provider).toBe("lever");
      expect(body.eventType).toBe("candidateStageChange");
    });

    it("POST /lever returns 401 Unauthorized on tampered signature", async () => {
      const triggeredAt = 1715000000000;
      const leverPayload = JSON.stringify({
        event: "candidateStageChange",
        triggeredAt,
        signature: "invalid_hex_digest_1234567890abcdef",
        data: { candidateId: "cand_lever_99" },
      });

      const res = await atsWebhookRouter.request("/lever", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: leverPayload,
      });

      expect(res.status).toBe(401);
      const body = webhookErrorSchema.parse(await res.json());
      expect(body.error).toBe("Unauthorized");
    });

    it("POST /:provider returns 400 Bad Request on unsupported ATS provider", async () => {
      const res = await atsWebhookRouter.request("/workday_custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ping" }),
      });

      expect(res.status).toBe(400);
      const body = webhookErrorSchema.parse(await res.json());
      expect(body.error).toBe("Bad Request");
      expect(body.message).toContain("Unsupported ATS provider");
    });

    it("returns 400 Bad Request on empty or malformed JSON payload", async () => {
      const resEmpty = await atsWebhookRouter.request("/greenhouse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "",
      });
      expect(resEmpty.status).toBe(400);

      const resMalformed = await atsWebhookRouter.request("/greenhouse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{ action: broken-json }",
      });
      expect(resMalformed.status).toBe(400);
    });

    it("routes webhooks through parent router without requiring user session authentication", async () => {
      const parentRouter = new Hono()
        .route("/webhooks", atsWebhookRouter)
        .use(async (c, next) => {
          const auth = c.req.header("authorization");
          if (!auth) {
            return c.json({ error: "Unauthorized" }, 401);
          }
          await next();
        })
        .get("/today", (c) => c.json({ ok: true }));

      const payload = JSON.stringify({ action: "ping" });
      const { headerValue } = createAtsWebhookSignature(
        "greenhouse",
        payload,
        greenhouseSecret,
      );

      // Webhook route inside parentRouter (/webhooks/greenhouse) must succeed without session auth
      const webhookRes = await parentRouter.request("/webhooks/greenhouse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Signature: headerValue,
        },
        body: payload,
      });

      expect(webhookRes.status).toBe(200);

      // Authenticated route (/today) still strictly requires auth
      const protectedRes = await parentRouter.request("/today", {
        method: "GET",
      });
      expect(protectedRes.status).toBe(401);
    });
  });
});
