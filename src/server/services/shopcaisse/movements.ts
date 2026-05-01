import { logger } from "@/lib/logger";
import { getEnv } from "@/server/env";
import { shopcaisseRequest } from "./client";

export async function pushShopcaisseStockMovement(input: {
  orderId: string;
  orderNumber: string;
  items: Array<{ sku: string; quantity: number }>;
}) {
  const env = getEnv();

  if (!env.SHOPCAISSE_MOVEMENT_URL) {
    await logger.integration("warn", {
      provider: "shopcaisse",
      eventType: "stock_movement",
      status: "skipped",
      targetType: "order",
      targetId: input.orderId,
      message: "Shopcaisse movement skipped: URL not configured.",
      payload: input,
    });
    return { pushed: false as const, reason: "not_configured" as const };
  }

  const payload = await shopcaisseRequest<unknown>({
    url: env.SHOPCAISSE_MOVEMENT_URL,
    method: "POST",
    body: {
      orderId: input.orderId,
      orderNumber: input.orderNumber,
      items: input.items,
    },
  });

  await logger.integration("info", {
    provider: "shopcaisse",
    eventType: "stock_movement",
    status: "success",
    targetType: "order",
    targetId: input.orderId,
    message: "Shopcaisse stock movement pushed.",
    payload,
  });

  return { pushed: true as const, payload };
}
