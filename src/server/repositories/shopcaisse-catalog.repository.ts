import { Prisma } from "@prisma/client";
import { db, getDbClient } from "@/server/db/client";
import { getEnv } from "@/server/env";
import { listShopcaisseStocks } from "@/server/services/shopcaisse/client";
import type { ShopcaisseCatalogItem, ShopcaisseFamilyRecord } from "@/server/services/shopcaisse/catalog.types";
import { normalizeFamilyRecords, buildUniqueCategorySlug } from "@/server/services/shopcaisse/families";
import { slugify } from "@/lib/slugify";

type SyncError = {
  externalProductId: string;
  message: string;
};

type ShopcaisseCacheLookupItem = {
  productId?: string;
  shopcaisseProductId?: string;
};

function toRawJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}

function toJsonArray(value: string[] | undefined): Prisma.InputJsonValue | Prisma.JsonNullValueInput {
  if (!value || value.length === 0) {
    return Prisma.JsonNull;
  }

  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function buildExternalKey(item: ShopcaisseCatalogItem, storeId: string) {
  return `${storeId}:${item.externalProductId}:${item.externalVariantId ?? "base"}`;
}

async function findLinkedProductId(item: ShopcaisseCatalogItem) {
  const matchers: Array<Record<string, string>> = [];

  if (item.externalProductId) {
    matchers.push({ externalStockId: item.externalProductId });
  }

  if (item.sku) {
    matchers.push({ sku: item.sku });
  }

  if (item.barcode) {
    matchers.push({ barcode: item.barcode });
  }

  if (matchers.length === 0) {
    return null;
  }

  const product = await db.product.findFirst({
    where: {
      OR: matchers,
    },
    select: {
      id: true,
    },
  });

  return product?.id ?? null;
}

export async function syncShopcaisseCatalogCache(items: ShopcaisseCatalogItem[]) {
  const env = getEnv();
  const client = getDbClient();
  const cacheDelegate = client.shopcaisseProductCache;

  if (!env.SHOPCAISSE_STORE_ID) {
    throw new Error("Shopcaisse store ID is not configured.");
  }

  if (!cacheDelegate || typeof cacheDelegate.findMany !== "function") {
    throw new Error("Prisma delegate shopcaisseProductCache is unavailable.");
  }

  const storeId = env.SHOPCAISSE_STORE_ID;
  const syncedAt = new Date();
  const errors: SyncError[] = [];

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  const keys = items.map((item) => buildExternalKey(item, storeId));
  const existingRows = await cacheDelegate.findMany({
    where: {
      shopcaisseExternalKey: {
        in: keys,
      },
    },
    select: {
      id: true,
      shopcaisseExternalKey: true,
    },
  });
  const existingKeySet = new Set(existingRows.map((row) => row.shopcaisseExternalKey));

  for (const item of items) {
    if (!item.externalProductId) {
      skippedCount += 1;
      continue;
    }

    try {
      const linkedProductId = await findLinkedProductId(item);
      const shopcaisseExternalKey = buildExternalKey(item, storeId);

      await cacheDelegate.upsert({
        where: {
          shopcaisseExternalKey,
        },
        update: {
          linkedProductId,
          shopcaisseProductId: item.externalProductId,
          shopcaisseVariantId: item.externalVariantId ?? null,
          shopcaisseStoreId: storeId,
          name: item.name,
          sku: item.sku ?? null,
          barcode: item.barcode ?? null,
          imageUrl: item.imageUrl ?? null,
          images: toJsonArray(item.images),
          priceCents: item.priceCents ?? null,
          currency: item.currency ?? null,
          stockQuantity: item.stockQuantity ?? null,
          familyName: item.familyName ?? null,
          familyId: item.familyId ?? null,
          source: "shopcaisse",
          rawJson: toRawJson(item.raw),
          lastShopcaisseSyncAt: syncedAt,
        },
        create: {
          shopcaisseExternalKey,
          linkedProductId,
          shopcaisseProductId: item.externalProductId,
          shopcaisseVariantId: item.externalVariantId ?? null,
          shopcaisseStoreId: storeId,
          name: item.name,
          sku: item.sku ?? null,
          barcode: item.barcode ?? null,
          imageUrl: item.imageUrl ?? null,
          images: toJsonArray(item.images),
          priceCents: item.priceCents ?? null,
          currency: item.currency ?? null,
          stockQuantity: item.stockQuantity ?? null,
          familyName: item.familyName ?? null,
          familyId: item.familyId ?? null,
          source: "shopcaisse",
          rawJson: toRawJson(item.raw),
          lastShopcaisseSyncAt: syncedAt,
        },
      });

      if (existingKeySet.has(shopcaisseExternalKey)) {
        updatedCount += 1;
      } else {
        createdCount += 1;
      }
    } catch (error) {
      skippedCount += 1;

      if (errors.length < 10) {
        errors.push({
          externalProductId: item.externalProductId,
          message: error instanceof Error ? error.message : "Unknown Shopcaisse sync error.",
        });
      }
    }
  }

  return {
    createdCount,
    updatedCount,
    skippedCount,
    errors,
    syncedAt,
  };
}

export async function findShopcaisseCacheEntries(items: ShopcaisseCacheLookupItem[]) {
  const client = getDbClient();
  const cacheDelegate = client.shopcaisseProductCache;
  const productIds = items
    .map((item) => item.productId)
    .filter((productId): productId is string => Boolean(productId));
  const shopcaisseProductIds = items
    .map((item) => item.shopcaisseProductId)
    .filter((shopcaisseProductId): shopcaisseProductId is string => Boolean(shopcaisseProductId));

  if (productIds.length === 0 && shopcaisseProductIds.length === 0) {
    return [];
  }

  if (!cacheDelegate || typeof cacheDelegate.findMany !== "function") {
    throw new Error("Prisma delegate shopcaisseProductCache is unavailable.");
  }

  return cacheDelegate.findMany({
    where: {
      OR: [
        ...(productIds.length > 0 ? [{ linkedProductId: { in: productIds } }] : []),
        ...(shopcaisseProductIds.length > 0 ? [{ shopcaisseProductId: { in: shopcaisseProductIds } }] : []),
      ],
    },
    orderBy: { updatedAt: "desc" },
    include: {
      linkedProduct: {
        select: {
          id: true,
          stock: true,
          stockSource: true,
          lastStockSyncAt: true,
          lastStockSyncStatus: true,
          externalStockId: true,
        },
      },
    },
  });
}

export async function syncShopcaisseCategories(families: ShopcaisseFamilyRecord[]) {
  const normalized = normalizeFamilyRecords(families);

  const existing = await db.category.findMany({
    select: { id: true, slug: true, externalFamilyId: true },
  });
  const usedSlugs = new Set(existing.map((category) => category.slug));
  const bySlug = new Map(existing.map((category) => [category.slug, category]));
  const byExternalId = new Map(
    existing
      .filter((category) => category.externalFamilyId)
      .map((category) => [category.externalFamilyId as string, category]),
  );

  let createdCount = 0;
  let updatedCount = 0;
  let adoptedCount = 0;

  for (const family of normalized) {
    const matchedById = byExternalId.get(family.externalFamilyId);
    if (matchedById) {
      await db.category.update({
        where: { id: matchedById.id },
        data: { title: family.name, position: family.position, source: "shopcaisse" },
      });
      updatedCount += 1;
      continue;
    }

    // Name-based adoption: only matches the unsuffixed canonical slug.
    // A pre-existing category created with a collision suffix won't be adopted here.
    const candidateSlug = slugify(family.name) || "categorie";
    const matchedBySlug = bySlug.get(candidateSlug);
    if (matchedBySlug && !matchedBySlug.externalFamilyId) {
      await db.category.update({
        where: { id: matchedBySlug.id },
        data: {
          externalFamilyId: family.externalFamilyId,
          title: family.name,
          position: family.position,
          source: "shopcaisse",
        },
      });
      const adopted = { ...matchedBySlug, externalFamilyId: family.externalFamilyId };
      byExternalId.set(family.externalFamilyId, adopted);
      // Keep bySlug current so a later family with the same canonical slug
      // takes the update-by-externalFamilyId path instead of re-adopting the
      // now-linked row (which would hit the unique constraint).
      bySlug.set(candidateSlug, adopted);
      adoptedCount += 1;
      continue;
    }

    const slug = buildUniqueCategorySlug(family.name, usedSlugs);
    usedSlugs.add(slug);
    const created = await db.category.create({
      data: {
        title: family.name,
        slug,
        position: family.position,
        source: "shopcaisse",
        externalFamilyId: family.externalFamilyId,
      },
      select: { id: true, slug: true, externalFamilyId: true },
    });
    bySlug.set(created.slug, created);
    byExternalId.set(family.externalFamilyId, created);
    createdCount += 1;
  }

  return { createdCount, updatedCount, adoptedCount, total: normalized.length };
}

export async function refreshShopcaisseCacheStockQuantities() {
  const env = getEnv();
  const client = getDbClient();
  const cacheDelegate = client.shopcaisseProductCache;

  if (!env.SHOPCAISSE_STORE_ID) {
    throw new Error("Shopcaisse store ID is not configured.");
  }

  if (!cacheDelegate || typeof cacheDelegate.updateMany !== "function") {
    throw new Error("Prisma delegate shopcaisseProductCache is unavailable.");
  }

  const stocks = await listShopcaisseStocks();
  const syncedAt = new Date();
  let updatedCount = 0;

  for (const stock of stocks) {
    if (!stock.item) {
      continue;
    }

    const quantity = typeof stock.stock === "number" ? Math.max(0, Math.floor(stock.stock)) : null;

    const result = await cacheDelegate.updateMany({
      where: {
        shopcaisseStoreId: env.SHOPCAISSE_STORE_ID,
        shopcaisseProductId: stock.item,
      },
      data: {
        stockQuantity: quantity,
        lastShopcaisseSyncAt: syncedAt,
      },
    });

    updatedCount += result.count;
  }

  return {
    updatedCount,
    syncedAt,
  };
}
