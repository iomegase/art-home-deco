import { logger } from "@/lib/logger";

export async function pushShopcaisseStockMovement(input: {
  orderId: string;
  orderNumber: string;
  items: Array<{ sku: string; quantity: number }>;
}) {
  await logger.integration("warn", {
    provider: "shopcaisse",
    eventType: "stock_movement",
    status: "skipped",
    targetType: "order",
    targetId: input.orderId,
    message: "EasyShop outbound stock movement is not implemented until the official movement endpoint is documented.",
    payload: input,
  });

  return { pushed: false as const, reason: "not_supported_without_documented_endpoint" as const };
}
