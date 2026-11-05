import { createHmac, timingSafeEqual } from "node:crypto";

export type AtsProvider = "greenhouse" | "lever";

export interface VerifyLeverOptions {
  signatureHeader?: string | null;
  parsedBody?: Record<string, unknown> | null;
  secret: string;
}

export interface AtsWebhookVerificationOptions {
  provider: AtsProvider;
  rawBody: string | Buffer;
  signatureHeader?: string | null;
  secret: string;
  parsedBody?: Record<string, unknown> | null;
}

export interface AtsWebhookVerificationResult {
  valid: boolean;
  provider: AtsProvider;
  error?: string;
}

export interface AtsWebhookProcessResult {
  success: boolean;
  provider: AtsProvider;
  eventType: string;
  handled: boolean;
  details?: Record<string, unknown>;
}

export interface CreatedAtsSignature {
  signature: string;
  headerValue: string;
  triggeredAt?: number;
}

/**
 * Constant-time comparison between two strings to prevent timing attacks.
 */
export const timingSafeCompare = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
};

/**
 * Strips common hashing algorithm prefixes (e.g. `sha256 `, `sha256=`) and trims whitespace.
 */
export const normalizeSignature = (rawSignature: string): string => {
  let sig = rawSignature.trim();
  const lower = sig.toLowerCase();
  if (lower.startsWith("sha256 ")) {
    sig = sig.slice(7).trim();
  } else if (lower.startsWith("sha256=")) {
    sig = sig.slice(7).trim();
  }
  return sig.toLowerCase();
};

/**
 * Computes HMAC-SHA256 digest of payload using the secret.
 */
export const computeHmacSha256 = (
  payload: string | Buffer,
  secret: string,
  encoding: "hex" | "base64" = "hex",
): string => {
  return createHmac("sha256", secret).update(payload).digest(encoding);
};

/**
 * Generic HMAC-SHA256 signature verification supporting hex and base64 digests with timing-safe comparison.
 */
export const verifyHmacSha256 = (
  payload: string | Buffer,
  signature: string,
  secret: string,
): boolean => {
  if (!signature || !secret) {
    return false;
  }

  const normalized = normalizeSignature(signature);
  const expectedHex = computeHmacSha256(payload, secret, "hex");

  if (timingSafeCompare(expectedHex, normalized)) {
    return true;
  }

  // Also support base64 digest verification if provider sent base64
  const expectedBase64 = computeHmacSha256(payload, secret, "base64");
  return timingSafeCompare(expectedBase64, signature.trim());
};

/**
 * Verifies Greenhouse Harvest / Webhook inbound payload signature.
 * Greenhouse sends the HMAC-SHA256 signature in the `Signature` (or `X-Greenhouse-Signature`) header,
 * formatted as `sha256 <hex_digest>` or `<hex_digest>`.
 */
export const verifyGreenhouseSignature = (
  rawBody: string | Buffer,
  signatureHeader: string | null | undefined,
  secret: string,
): boolean => {
  if (!signatureHeader || !secret) {
    return false;
  }
  return verifyHmacSha256(rawBody, signatureHeader, secret);
};

/**
 * Verifies Lever webhook payload signature.
 * Lever embeds `signature` and `triggeredAt` directly inside the JSON body,
 * signing `${secret}${triggeredAt}` with the secret token.
 * Alternatively, if sent via HTTP headers (`X-Lever-Signature` or `Signature`),
 * the raw payload is verified.
 */
export const verifyLeverSignature = (
  rawBody: string | Buffer,
  options: VerifyLeverOptions,
): boolean => {
  const { secret, signatureHeader, parsedBody } = options;
  if (!secret) {
    return false;
  }

  // 1. Lever native body-embedded specification:
  // Data to sign is `${signatureToken}${triggeredAt}`
  if (
    parsedBody &&
    typeof parsedBody.signature === "string" &&
    (typeof parsedBody.triggeredAt === "number" ||
      typeof parsedBody.triggeredAt === "string")
  ) {
    const triggeredAtStr = String(parsedBody.triggeredAt);
    const dataToSign = `${secret}${triggeredAtStr}`;
    const expectedHex = computeHmacSha256(dataToSign, secret, "hex");
    if (
      timingSafeCompare(expectedHex, normalizeSignature(parsedBody.signature))
    ) {
      return true;
    }
  }

  // 2. Standard header / raw body verification fallback:
  const candidateHeader =
    signatureHeader ||
    (typeof parsedBody?.signature === "string" ? parsedBody.signature : null);

  if (candidateHeader) {
    if (verifyHmacSha256(rawBody, candidateHeader, secret)) {
      return true;
    }
  }

  return false;
};

/**
 * Unified verification for inbound ATS webhook requests.
 */
export const verifyAtsWebhookSignature = (
  options: AtsWebhookVerificationOptions,
): AtsWebhookVerificationResult => {
  const { provider, rawBody, signatureHeader, secret, parsedBody } = options;

  if (!secret) {
    return {
      valid: false,
      provider,
      error: `Missing webhook secret for ${provider}`,
    };
  }

  if (provider === "greenhouse") {
    const isValid = verifyGreenhouseSignature(rawBody, signatureHeader, secret);
    return {
      valid: isValid,
      provider,
      error: isValid ? undefined : "Invalid Greenhouse signature",
    };
  }

  if (provider === "lever") {
    const isValid = verifyLeverSignature(rawBody, {
      signatureHeader,
      parsedBody,
      secret,
    });
    return {
      valid: isValid,
      provider,
      error: isValid ? undefined : "Invalid Lever signature",
    };
  }

  return {
    valid: false,
    provider,
    error: "Unsupported ATS provider",
  };
};

/**
 * Generates valid HMAC-SHA256 signatures for testing and payload signing.
 */
export const createAtsWebhookSignature = (
  provider: AtsProvider,
  payload: string | Record<string, unknown>,
  secret: string,
  options?: { triggeredAt?: number },
): CreatedAtsSignature => {
  if (provider === "greenhouse") {
    const rawBody =
      typeof payload === "string" ? payload : JSON.stringify(payload);
    const digestHex = computeHmacSha256(rawBody, secret, "hex");
    return {
      signature: digestHex,
      headerValue: `sha256 ${digestHex}`,
    };
  }

  // Lever: embed or sign with triggeredAt
  const triggeredAt =
    options?.triggeredAt ??
    (typeof payload === "object" && payload && "triggeredAt" in payload
      ? Number(payload.triggeredAt)
      : Date.now());

  const dataToSign = `${secret}${triggeredAt}`;
  const digestHex = computeHmacSha256(dataToSign, secret, "hex");

  return {
    signature: digestHex,
    headerValue: digestHex,
    triggeredAt,
  };
};

/**
 * Processes validated ATS webhook events and extracts normalized metadata.
 */
export const processAtsWebhookEvent = (
  provider: AtsProvider,
  payload: Record<string, unknown> | null,
): AtsWebhookProcessResult => {
  if (!payload) {
    return {
      success: true,
      provider,
      eventType: "unknown",
      handled: false,
    };
  }

  if (provider === "greenhouse") {
    const eventType =
      typeof payload.action === "string" ? payload.action : "unknown";
    return {
      success: true,
      provider,
      eventType,
      handled: true,
      details: {
        action: eventType,
        hasCandidate:
          Boolean(payload.payload) &&
          typeof payload.payload === "object" &&
          "candidate" in (payload.payload as Record<string, unknown>),
      },
    };
  }

  if (provider === "lever") {
    const eventType =
      typeof payload.event === "string" ? payload.event : "unknown";
    return {
      success: true,
      provider,
      eventType,
      handled: true,
      details: {
        event: eventType,
        hasData: Boolean(payload.data),
      },
    };
  }

  return {
    success: false,
    provider,
    eventType: "unsupported",
    handled: false,
  };
};
