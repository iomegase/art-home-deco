import { db } from "@/server/db/client";
import { logger } from "@/lib/logger";
import { getEnv } from "@/server/env";
import { shopcaisseRequest } from "./client";
import { mapShopcaisseStockPayload } from "./mapper";

export async function syncShopcaisseStock() {
  const env = getEnv();
  const startedAt = new Date();
  const remotePayload = await shopcaisseRequest<unknown>({
    url: env.SHOPCAISSE_STOCK_SYNC_URL,
  });
  const remoteItems = mapShopcaisseStockPayload(remotePayload);

  let updatedCount = 0;
  let unmatchedCount = 0;

  for (const item of remoteItems) {
    const matchers: Array<Record<string, string>> = [];

    if (item.externalStockId) {
      matchers.push({ externalStockId: item.externalStockId });
    }

    if (item.sku) {
      matchers.push({ sku: item.sku });
    }

    if (item.barcode) {
      matchers.push({ barcode: item.barcode });
    }

    if (matchers.length === 0) {
      unmatchedCount += 1;
      continue;
    }

    const product = await db.product.findFirst({
      where: {
        OR: matchers,
      },
    });

    if (!product) {
      unmatchedCount += 1;
      continue;
    }

    await db.product.update({
      where: { id: product.id },
      data: {
        stock: Math.max(0, Math.floor(item.quantity)),
        stockSource: "shopcaisse",
        lastStockSyncAt: startedAt,
        lastStockSyncStatus: "success",
        lastStockSyncError: null,
      },
    });

    updatedCount += 1;
  }

  await logger.integration("info", {
    provider: "shopcaisse",
    eventType: "stock_sync",
    status: "success",
    message: "Shopcaisse stock synchronization completed.",
    payload: {
      updatedCount,
      unmatchedCount,
      remoteCount: remoteItems.length,
    },
  });

  return {
    updatedCount,
    unmatchedCount,
    remoteCount: remoteItems.length,
  };
}

export async function verifyShopcaisseStockBeforeCheckout(items: Array<{ sku: string; quantity: number }>) {
  const env = getEnv();

  if (!env.SHOPCAISSE_STOCK_VERIFY_URL) {
    return { verified: false as const, reason: "not_configured" as const };
  }

  const payload = await shopcaisseRequest<unknown>({
    url: env.SHOPCAISSE_STOCK_VERIFY_URL,
    method: "POST",
    body: { items },
  });

  await logger.integration("info", {
    provider: "shopcaisse",
    eventType: "stock_verify",
    status: "success",
    message: "Shopcaisse stock verification completed.",
    payload,
  });

  return { verified: true as const, payload };
}
