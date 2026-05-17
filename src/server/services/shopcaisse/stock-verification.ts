import { logger } from "@/lib/logger";
import { db } from "@/server/db/client";
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

function getEffectiveAvailableQuantity(cacheEntry: Awaited<ReturnType<typeof findShopcaisseCacheEntries>>[number] | undefined) {
  if (!cacheEntry) {
    return null;
  }

  if (typeof cacheEntry.stockQuantity === "number") {
    return cacheEntry.stockQuantity;
  }

  const linkedProduct = cacheEntry.linkedProduct;
  if (
    linkedProduct &&
    typeof linkedProduct.stock === "number" &&
    linkedProduct.stock >= 0 &&
    (
      linkedProduct.stockSource !== "shopcaisse"
      || linkedProduct.lastStockSyncStatus === "success"
      || linkedProduct.lastStockSyncStatus === null
    )
  ) {
    return linkedProduct.stock;
  }

  return null;
}

function getFallbackProductAvailableQuantity(
  product:
    | {
        stock: number;
        stockSource: string;
        lastStockSyncStatus: string | null;
      }
    | undefined,
) {
  if (
    product &&
    typeof product.stock === "number" &&
    (
      product.stockSource !== "shopcaisse"
      || product.lastStockSyncStatus === "success"
      || product.lastStockSyncStatus === null
    )
  ) {
    return product.stock;
  }

  return null;
}

export async function verifyShopcaisseStockBeforeCheckout(
  items: ShopcaisseStockVerificationInputItem[],
): Promise<StockVerificationResult> {
  const checkedAt = new Date().toISOString();
  const cacheEntries = await findShopcaisseCacheEntries(items);
  const productIds = items
    .map((item) => item.productId)
    .filter((productId): productId is string => Boolean(productId));
  const fallbackProducts = productIds.length > 0
    ? await db.product.findMany({
        where: {
          id: { in: productIds },
        },
        select: {
          id: true,
          stock: true,
          stockSource: true,
          lastStockSyncAt: true,
          lastStockSyncStatus: true,
          externalStockId: true,
        },
      })
    : [];
  const fallbackProductById = new Map(fallbackProducts.map((product) => [product.id, product]));
  const initialEntryByProductId = new Map(
    cacheEntries
      .filter((entry) => Boolean(entry.linkedProductId))
      .map((entry) => [entry.linkedProductId as string, entry]),
  );
  const initialEntryByShopcaisseProductId = new Map(
    cacheEntries
      .filter((entry) => Boolean(entry.shopcaisseProductId))
      .map((entry) => [entry.shopcaisseProductId, entry]),
  );

  let isCacheFresh =
    cacheEntries.length > 0 &&
    cacheEntries.every((entry) => isFresh(entry.lastShopcaisseSyncAt) || isFresh(entry.linkedProduct?.lastStockSyncAt ?? null));
  const errors: StockVerificationResult["errors"] = [];
  let refreshFailed = false;
  const hasImmediateVerifiedAvailability = items.every((item) => {
    const cacheEntry = (item.productId ? initialEntryByProductId.get(item.productId) : undefined)
      ?? (item.shopcaisseProductId ? initialEntryByShopcaisseProductId.get(item.shopcaisseProductId) : undefined);
    const fallbackProduct = item.productId ? fallbackProductById.get(item.productId) : undefined;
    const availableQuantity =
      getEffectiveAvailableQuantity(cacheEntry) ?? getFallbackProductAvailableQuantity(fallbackProduct);

    return availableQuantity !== null && availableQuantity >= item.quantity;
  });

  if (!isCacheFresh && cacheEntries.length > 0 && !hasImmediateVerifiedAvailability) {
    try {
      await refreshShopcaisseCacheStockQuantities();
    } catch (error) {
      refreshFailed = true;

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

  isCacheFresh =
    effectiveEntries.length > 0 &&
    effectiveEntries.every((entry) => isFresh(entry.lastShopcaisseSyncAt) || isFresh(entry.linkedProduct?.lastStockSyncAt ?? null));

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
    const fallbackProduct = item.productId ? fallbackProductById.get(item.productId) : undefined;
    const availableQuantity = getEffectiveAvailableQuantity(cacheEntry)
      ?? getFallbackProductAvailableQuantity(fallbackProduct);

    if (!cacheEntry && availableQuantity === null) {
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

    if (availableQuantity === null) {
      errors.push({
        productId: item.productId,
        shopcaisseProductId: cacheEntry?.shopcaisseProductId ?? shopcaisseProductId,
        message: "Stock Shopcaisse inconnu pour ce produit.",
      });

      return {
        productId: item.productId,
        shopcaisseProductId: cacheEntry?.shopcaisseProductId ?? shopcaisseProductId,
        requestedQuantity: item.quantity,
        availableQuantity: null,
        status: "unknown" as const,
      };
    }

    if (availableQuantity < item.quantity) {
      errors.push({
        productId: item.productId,
        shopcaisseProductId: cacheEntry?.shopcaisseProductId ?? shopcaisseProductId,
        message: "Quantite demandee superieure au stock Shopcaisse disponible.",
      });

      return {
        productId: item.productId,
        shopcaisseProductId: cacheEntry?.shopcaisseProductId ?? shopcaisseProductId,
        requestedQuantity: item.quantity,
        availableQuantity,
        status: "insufficient" as const,
      };
    }

    return {
      productId: item.productId,
      shopcaisseProductId: cacheEntry?.shopcaisseProductId ?? shopcaisseProductId,
      requestedQuantity: item.quantity,
      availableQuantity,
      status: "available" as const,
    };
  });

  const hasBlockingItem = resultItems.some((item) => item.status !== "available");

  if (refreshFailed && hasBlockingItem) {
    errors.push({
      message: "Le stock Shopcaisse n'a pas pu etre rafraichi. Merci de reessayer dans quelques instants.",
    });
  }

  if (!isCacheFresh && hasBlockingItem) {
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
