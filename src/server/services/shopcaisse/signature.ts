import { createHmac, timingSafeEqual } from "node:crypto";
import { getEnv } from "@/server/env";

function normalizeSignature(value: string) {
  return value.trim().replace(/^sha256=/i, "");
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function getShopcaisseWebhookSignatureHeaderName() {
  const env = getEnv();
  return (env.SHOPCAISSE_WEBHOOK_SIGNATURE_HEADER ?? "x-server-authorization-hmac-sha256").toLowerCase();
}

export function computeShopcaisseWebhookHmac(payload: string) {
  const env = getEnv();

  if (!env.SHOPCAISSE_WEBHOOK_SECRET) {
    throw new Error("Shopcaisse webhook secret is not configured.");
  }

  return createHmac("sha256", env.SHOPCAISSE_WEBHOOK_SECRET).update(payload).digest();
}

export function verifyShopcaisseWebhookSignature(input: {
  payload: string;
  providedSignature: string | null;
}) {
  if (!input.providedSignature) {
    return false;
  }

  const provided = normalizeSignature(input.providedSignature);
  const digest = computeShopcaisseWebhookHmac(input.payload);
  const expectedHex = digest.toString("hex");
  const expectedBase64 = digest.toString("base64");

  return safeCompare(provided, expectedHex) || safeCompare(provided, expectedBase64);
}
