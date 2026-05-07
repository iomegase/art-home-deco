import { logger } from "@/lib/logger";
import {
  findShopcaisseCacheEntries,
  refreshShopcaisseCacheStockQuantities,
} from "@/server/repositories/shopcaisse-catalog.repository";

const SHOPCAISSE_CACHE_FRESHNESS_MS = 10 * 60 * 1000;

export type ShopcaisseStockVerificationInputItem = {
  productId?: string;
  shopcaisseProductId?: string;
  quantity: number;
};

export type StockVerificationResult = {
  success: boolean;
  checkedAt: string;
  isCacheFresh: boolean;
  errors: Array<{
    productId?: string;
    shopcaisseProductId?: string;
    message: string;
  }>;
  items: Array<{
    productId?: string;
    shopcaisseProductId: string;
    requestedQuantity: number;
    availableQuantity: number | null;
    status: "available" | "insufficient" | "not_found" | "unknown";
  }>;
};

export class ShopcaisseCheckoutStockError extends Error {
  verification: StockVerificationResult;

  constructor(message: string, verification: StockVerificationResult) {
    super(message);
    this.name = "ShopcaisseCheckoutStockError";
    this.verification = verification;
  }
}

function isFresh(date: Date | null) {
  if (!date) {
    return false;
  }

  return Date.now() - date.getTime() < SHOPCAISSE_CACHE_FRESHNESS_MS;
}

export async function verifyShopcaisseStockBeforeCheckout(
  items: ShopcaisseStockVerificationInputItem[],
): Promise<StockVerificationResult> {
  const checkedAt = new Date().toISOString();
  const cacheEntries = await findShopcaisseCacheEntries(items);

  let isCacheFresh = cacheEntries.length > 0 && cacheEntries.every((entry) => isFresh(entry.lastShopcaisseSyncAt));
  const errors: StockVerificationResult["errors"] = [];

  if (!isCacheFresh && cacheEntries.length > 0) {
    try {
      await refreshShopcaisseCacheStockQuantities();
    } catch (error) {
      errors.push({
        message: "Le stock Shopcaisse n'a pas pu etre rafraichi. Merci de reessayer dans quelques instants.",
      });

      await logger.integration("warn", {
        provider: "shopcaisse",
        eventType: "stock_verify_refresh",
        status: "failed",
        message: "Shopcaisse stock refresh failed before checkout.",
        payload: {
          error: error instanceof Error ? error.message : "Unknown stock refresh error.",
        },
      });
    }
  }

  const effectiveEntries = !isCacheFresh && cacheEntries.length > 0
    ? await findShopcaisseCacheEntries(items)
    : cacheEntries;

  isCacheFresh = effectiveEntries.length > 0 && effectiveEntries.every((entry) => isFresh(entry.lastShopcaisseSyncAt));

  const entryByProductId = new Map(
    effectiveEntries
      .filter((entry) => Boolean(entry.linkedProductId))
      .map((entry) => [entry.linkedProductId as string, entry]),
  );
  const entryByShopcaisseProductId = new Map(
    effectiveEntries
      .filter((entry) => Boolean(entry.shopcaisseProductId))
      .map((entry) => [entry.shopcaisseProductId, entry]),
  );

  const resultItems: StockVerificationResult["items"] = items.map((item) => {
    const cacheEntry = (item.productId ? entryByProductId.get(item.productId) : undefined)
      ?? (item.shopcaisseProductId ? entryByShopcaisseProductId.get(item.shopcaisseProductId) : undefined);
    const shopcaisseProductId = cacheEntry?.shopcaisseProductId ?? item.shopcaisseProductId ?? "unknown";

    if (!cacheEntry) {
      errors.push({
        productId: item.productId,
        shopcaisseProductId: item.shopcaisseProductId,
        message: "Produit Shopcaisse introuvable dans le cache local.",
      });

      return {
        productId: item.productId,
        shopcaisseProductId,
        requestedQuantity: item.quantity,
        availableQuantity: null,
        status: "not_found" as const,
      };
    }

    if (cacheEntry.stockQuantity === null) {
      errors.push({
        productId: item.productId,
        shopcaisseProductId: cacheEntry.shopcaisseProductId,
        message: "Stock Shopcaisse inconnu pour ce produit.",
      });

      return {
        productId: item.productId,
        shopcaisseProductId: cacheEntry.shopcaisseProductId,
        requestedQuantity: item.quantity,
        availableQuantity: null,
        status: "unknown" as const,
      };
    }

    if (cacheEntry.stockQuantity < item.quantity) {
      errors.push({
        productId: item.productId,
        shopcaisseProductId: cacheEntry.shopcaisseProductId,
        message: "Quantite demandee superieure au stock Shopcaisse disponible.",
      });

      return {
        productId: item.productId,
        shopcaisseProductId: cacheEntry.shopcaisseProductId,
        requestedQuantity: item.quantity,
        availableQuantity: cacheEntry.stockQuantity,
        status: "insufficient" as const,
      };
    }

    return {
      productId: item.productId,
      shopcaisseProductId: cacheEntry.shopcaisseProductId,
      requestedQuantity: item.quantity,
      availableQuantity: cacheEntry.stockQuantity,
      status: "available" as const,
    };
  });

  if (!isCacheFresh) {
    errors.push({
      message: "Le cache Shopcaisse n'est pas assez recent pour garantir une verification parfaite.",
    });
  }

  const success = errors.length === 0 && resultItems.every((item) => item.status === "available");

  return {
    success,
    checkedAt,
    isCacheFresh,
    errors,
    items: resultItems,
  };
}
