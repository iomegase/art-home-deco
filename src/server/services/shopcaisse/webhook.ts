import { createHash } from "node:crypto";
import { logger } from "@/lib/logger";
import { findLatestIntegrationEventByTarget } from "@/server/repositories/integration.repository";
import { applyShopcaisseStockSnapshot } from "./stock";

export type ShopcaisseWebhookPayload = {
  event: string;
  resource?: {
    id?: string;
    type?: string;
  };
  content?: unknown;
};

function getPayloadFingerprint(rawBody: string) {
  return createHash("sha256").update(rawBody).digest("hex");
}

export async function handleShopcaisseWebhook(input: {
  payload: ShopcaisseWebhookPayload;
  rawBody: string;
}) {
  const fingerprint = getPayloadFingerprint(input.rawBody);
  const duplicate = await findLatestIntegrationEventByTarget({
    provider: "shopcaisse",
    eventType: "webhook_received",
    targetType: "webhook",
    targetId: fingerprint,
  });

  if (duplicate) {
    return {
      ok: true as const,
      duplicate: true as const,
      status: "duplicate",
    };
  }

  await logger.integration("info", {
    provider: "shopcaisse",
    eventType: "webhook_received",
    status: "received",
    targetType: "webhook",
    targetId: fingerprint,
    message: `EasyShop webhook received: ${input.payload.event}`,
    payload: input.payload,
  });

  if (input.payload.event === "company.items") {
    if (!Array.isArray(input.payload.content) || input.payload.content.length === 0) {
      await logger.integration("warn", {
        provider: "shopcaisse",
        eventType: "company.items",
        status: "ignored",
        targetType: input.payload.resource?.type,
        targetId: input.payload.resource?.id,
        message: "EasyShop company.items webhook received without content.",
        payload: input.payload,
      });

      return {
        ok: true as const,
        duplicate: false as const,
        status: "ignored",
      };
    }

    const result = await applyShopcaisseStockSnapshot(input.payload.content, {
      targetType: input.payload.resource?.type,
      targetId: input.payload.resource?.id,
      sourceEvent: input.payload.event,
    });

    return {
      ok: true as const,
      duplicate: false as const,
      status: "processed",
      result,
    };
  }

  await logger.integration("info", {
    provider: "shopcaisse",
    eventType: input.payload.event,
    status: "ignored",
    targetType: input.payload.resource?.type,
    targetId: input.payload.resource?.id,
    message: `EasyShop webhook event ignored: ${input.payload.event}`,
    payload: input.payload,
  });

  return {
    ok: true as const,
    duplicate: false as const,
    status: "ignored",
  };
}
