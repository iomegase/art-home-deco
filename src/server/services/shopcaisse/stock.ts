import { db } from "@/server/db/client";
import { logger } from "@/lib/logger";
import { ShopcaisseConfigError } from "./errors";
import { mapShopcaisseStockPayload } from "./mapper";
import {
  verifyShopcaisseStockBeforeCheckout as verifyShopcaisseStockBeforeCheckoutFromCache,
  type ShopcaisseStockVerificationInputItem,
} from "./stock-verification";

export async function applyShopcaisseStockSnapshot(
  payload: unknown,
  context?: { sourceEvent?: string; targetType?: string; targetId?: string },
) {
  const startedAt = new Date();
  const remoteItems = mapShopcaisseStockPayload(payload);

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
        externalProvider: "easyshop",
        lastStockSyncAt: startedAt,
        lastStockSyncStatus: "success",
        lastStockSyncError: null,
      },
    });

    updatedCount += 1;
  }

  const result = {
    updatedCount,
    unmatchedCount,
    remoteCount: remoteItems.length,
  };

  await logger.integration("info", {
    provider: "shopcaisse",
    eventType: context?.sourceEvent ?? "stock_sync",
    status: "success",
    targetType: context?.targetType,
    targetId: context?.targetId,
    message: "EasyShop stock snapshot applied to local catalog.",
    payload: result,
  });

  return result;
}

export async function syncShopcaisseStock() {
  throw new ShopcaisseConfigError(
    "Manual EasyShop sync requires a documented outbound items endpoint. Webhook sync remains available.",
  );
}

export async function verifyShopcaisseStockBeforeCheckout(items: ShopcaisseStockVerificationInputItem[]) {
  return verifyShopcaisseStockBeforeCheckoutFromCache(items);
}
