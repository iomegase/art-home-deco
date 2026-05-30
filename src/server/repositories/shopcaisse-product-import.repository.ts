import { Prisma } from "@prisma/client";
import { db } from "@/server/db/client";
import { slugify } from "@/lib/slugify";
import { buildUniqueCategorySlug } from "@/server/services/shopcaisse/families";
import type { ShopcaisseImportPreviewQuery, ShopcaisseImportProductsRequest } from "@/schemas/api/shopcaisse-import.schema";

type CachePreviewRow = {
  id: string;
  shopcaisseProductId: string;
  linkedProductId: string | null;
  name: string;
  sku: string | null;
  barcode: string | null;
  imageUrl: string | null;
  images: unknown;
  priceCents: number | null;
  stockQuantity: number | null;
  familyName: string | null;
  familyId: string | null;
  updatedAt: Date;
};

type ExistingProductRow = {
  id: string;
  externalStockId: string | null;
  sku: string;
  barcode: string | null;
  slug: string;
};

type ImportError = {
  shopcaisseProductId: string;
  message: string;
};

type ShopcaisseImportPreviewItem = {
  shopcaisseProductId: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  imageUrl: string | null;
  priceCents: number | null;
  stockQuantity: number | null;
  familyName: string | null;
  alreadyImported: boolean;
};

type FamilyPreviewStat = {
  name: string;
  totalCount: number;
  inStockCount: number;
  outOfStockCount: number;
};

type ImportPreviewResult = {
  availableFamilies: string[];
  familyStats: FamilyPreviewStat[];
  selectedFamily: string | null;
  selectedFamilies: string[];
  totalCacheItems: number;
  importableCount: number;
  alreadyLinkedCount: number;
  missingPriceCount: number;
  missingStockCount: number;
  missingImageCount: number;
  sampleItems: ShopcaisseImportPreviewItem[];
  page: number;
  limit: number;
  totalPages: number;
  query: string | null;
  hasStock: boolean | null;
  hasPrice: boolean | null;
};

type ImportProductsResult = {
  createdCount: number;
  skippedCount: number;
  linkedCount: number;
  errors: ImportError[];
  importedAt: Date;
};

function normalizeString(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function buildExistingProductIndexes(products: ExistingProductRow[]) {
  const byExternalStockId = new Map<string, ExistingProductRow>();
  const bySku = new Map<string, ExistingProductRow>();
  const byBarcode = new Map<string, ExistingProductRow>();

  for (const product of products) {
    if (product.externalStockId) {
      byExternalStockId.set(product.externalStockId, product);
    }

    bySku.set(product.sku, product);

    if (product.barcode) {
      byBarcode.set(product.barcode, product);
    }
  }

  return { byExternalStockId, bySku, byBarcode };
}

function resolveExistingProduct(row: CachePreviewRow, indexes: ReturnType<typeof buildExistingProductIndexes>) {
  return (
    indexes.byExternalStockId.get(row.shopcaisseProductId) ??
    (row.sku ? indexes.bySku.get(row.sku) : undefined) ??
    (row.barcode ? indexes.byBarcode.get(row.barcode) : undefined) ??
    null
  );
}

function isRowImportable(row: CachePreviewRow) {
  return Boolean(row.name.trim()) && row.priceCents !== null;
}

function buildDerivedSku(row: CachePreviewRow, existingSkuSet: Set<string>) {
  const baseCandidates = [normalizeString(row.sku), normalizeString(row.barcode), `SC-${row.shopcaisseProductId}`].filter(
    (value): value is string => Boolean(value),
  );

  for (const candidate of baseCandidates) {
    if (!existingSkuSet.has(candidate)) {
      return candidate;
    }
  }

  let attempt = 2;
  const fallbackBase = `SC-${row.shopcaisseProductId}`;
  while (existingSkuSet.has(`${fallbackBase}-${attempt}`)) {
    attempt += 1;
  }

  return `${fallbackBase}-${attempt}`;
}

function buildUniqueSlug(row: CachePreviewRow, existingSlugSet: Set<string>) {
  const base = slugify(row.name) || `shopcaisse-${row.shopcaisseProductId.toLowerCase()}`;

  if (!existingSlugSet.has(base)) {
    return base;
  }

  const suffixBase = row.shopcaisseProductId.toLowerCase().slice(0, 8) || "item";
  const firstCandidate = `${base}-${suffixBase}`;
  if (!existingSlugSet.has(firstCandidate)) {
    return firstCandidate;
  }

  let attempt = 2;
  while (existingSlugSet.has(`${firstCandidate}-${attempt}`)) {
    attempt += 1;
  }

  return `${firstCandidate}-${attempt}`;
}

function normalizeStoredImages(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
}

function toBooleanFilter(value: ShopcaisseImportPreviewQuery["hasStock"] | ShopcaisseImportPreviewQuery["hasPrice"]) {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return null;
}

function buildPreviewWhere(filters?: ShopcaisseImportPreviewQuery): Prisma.ShopcaisseProductCacheWhereInput | undefined {
  if (!filters) {
    return undefined;
  }

  const where: Prisma.ShopcaisseProductCacheWhereInput = {};
  const and: Prisma.ShopcaisseProductCacheWhereInput[] = [];
  const familyName = normalizeString(filters.familyName);
  const familyNames = (filters.familyNames ?? []).map((value) => value.trim()).filter((value) => value.length > 0);
  const query = normalizeString(filters.q);
  const hasStock = toBooleanFilter(filters.hasStock);
  const hasPrice = toBooleanFilter(filters.hasPrice);

  if (familyNames.length > 0) {
    where.familyName = { in: familyNames };
  } else if (familyName) {
    where.familyName = familyName;
  }

  if (query) {
    and.push({
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { sku: { contains: query, mode: "insensitive" } },
        { barcode: { contains: query, mode: "insensitive" } },
        { shopcaisseProductId: { contains: query, mode: "insensitive" } },
      ],
    });
  }

  if (hasStock === true) {
    and.push({ stockQuantity: { gt: 0 } });
  } else if (hasStock === false) {
    and.push({ OR: [{ stockQuantity: null }, { stockQuantity: { lte: 0 } }] });
  }

  if (hasPrice === true) {
    and.push({ priceCents: { not: null } });
  } else if (hasPrice === false) {
    and.push({ priceCents: null });
  }

  if (and.length > 0) {
    where.AND = and;
  }

  return Object.keys(where).length > 0 ? where : undefined;
}

async function ensureCategoryIdByFamilyName(familyName: string) {
  const normalizedTitle = familyName.trim().replace(/\s+/g, " ");

  const normalizedKey = normalizedTitle
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalizedKey === "pas de famille") {
    return null;
  }

  const slug = slugify(normalizedTitle);

  if (!slug) {
    return null;
  }

  const category = await db.category.upsert({
    where: { slug },
    update: { title: normalizedTitle },
    create: { slug, title: normalizedTitle },
  });

  return category.id;
}

async function ensureCategoryByFamilyId(input: { familyId: string; familyName: string | null }) {
  const existing = await db.category.findUnique({
    where: { externalFamilyId: input.familyId },
    select: { id: true },
  });
  if (existing) {
    return existing.id;
  }

  // Fallback: family not yet synced as a category — create it from the name.
  const title = (input.familyName ?? "").trim();
  if (!title) {
    return null;
  }
  const normalizedKey = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (normalizedKey === "pas de famille" || normalizedKey === "system family") {
    return null;
  }
  const slug = slugify(title);
  if (!slug) {
    return null;
  }

  // A category with this slug may already exist (a local/manual one, or one
  // created before familyId existed). Adopt it when it isn't already linked to
  // another family; otherwise mint a collision-free slug so the create below
  // never trips the unique slug constraint (which would silently skip the row).
  const slugMatch = await db.category.findUnique({
    where: { slug },
    select: { id: true, externalFamilyId: true },
  });
  if (slugMatch && (!slugMatch.externalFamilyId || slugMatch.externalFamilyId === input.familyId)) {
    await db.category.update({
      where: { id: slugMatch.id },
      data: { externalFamilyId: input.familyId, title, source: "shopcaisse" },
    });
    return slugMatch.id;
  }

  const existingSlugs = await db.category.findMany({ select: { slug: true } });
  const uniqueSlug = buildUniqueCategorySlug(title, new Set(existingSlugs.map((category) => category.slug)));

  const category = await db.category.create({
    data: { externalFamilyId: input.familyId, slug: uniqueSlug, title, source: "shopcaisse" },
  });
  return category.id;
}

async function linkCacheRowsToProduct(shopcaisseProductId: string, productId: string) {
  await db.shopcaisseProductCache.updateMany({
    where: { shopcaisseProductId },
    data: { linkedProductId: productId },
  });
}

async function syncProductImages(productId: string, row: Pick<CachePreviewRow, "imageUrl" | "images" | "name">) {
  const imageUrls = Array.from(
    new Set(
      [row.imageUrl, ...normalizeStoredImages(row.images)].filter(
        (value): value is string => typeof value === "string" && value.trim().length > 0,
      ),
    ),
  );

  if (imageUrls.length === 0) {
    return;
  }

  const existingImages = await db.productImage.findMany({
    where: { productId },
    select: { url: true },
  });
  const existingUrlSet = new Set(existingImages.map((image) => image.url));
  const nextPositionStart = existingImages.length;

  const imagesToCreate = imageUrls
    .filter((url) => !existingUrlSet.has(url))
    .map((url, index) => ({
      productId,
      url,
      alt: row.name,
      position: nextPositionStart + index,
    }));

  if (imagesToCreate.length === 0) {
    return;
  }

  await db.productImage.createMany({ data: imagesToCreate });
  await db.product.update({
    where: { id: productId },
    data: {
      imageStatus: "pending_review",
      imageSource: "shopcaisse_import",
      imageAlt: row.name,
      imageUpdatedAt: new Date(),
    },
  });
}

async function listCacheRows(filter?: {
  shopcaisseProductIds?: string[];
  familyNames?: string[];
  inStockOnly?: boolean;
  previewFilters?: ShopcaisseImportPreviewQuery;
  skip?: number;
  take?: number;
}) {
  const and: Prisma.ShopcaisseProductCacheWhereInput[] = [];
  const previewWhere = buildPreviewWhere(filter?.previewFilters);

  if (previewWhere) {
    and.push(previewWhere);
  }

  if (filter?.shopcaisseProductIds?.length) {
    and.push({ shopcaisseProductId: { in: filter.shopcaisseProductIds } });
  }

  if (filter?.familyNames?.length) {
    and.push({ familyName: { in: filter.familyNames } });
  }

  if (filter?.inStockOnly) {
    and.push({ stockQuantity: { gt: 0 } });
  }

  return db.shopcaisseProductCache.findMany({
    where: and.length > 0 ? { AND: and } : undefined,
    orderBy: [{ familyName: "asc" }, { updatedAt: "desc" }, { name: "asc" }],
    skip: filter?.skip,
    take: filter?.take,
    select: {
      id: true,
      shopcaisseProductId: true,
      linkedProductId: true,
      name: true,
      sku: true,
      barcode: true,
      imageUrl: true,
      images: true,
      priceCents: true,
      stockQuantity: true,
      familyName: true,
      familyId: true,
      updatedAt: true,
    },
  });
}

async function listAvailableFamilies() {
  const rows = await db.shopcaisseProductCache.findMany({
    where: { familyName: { not: null } },
    select: { familyName: true },
    distinct: ["familyName"],
    orderBy: { familyName: "asc" },
  });

  return rows.map((row) => row.familyName).filter((value): value is string => Boolean(value));
}

async function listFamilyStats() {
  const rows = await db.shopcaisseProductCache.findMany({
    select: {
      familyName: true,
      stockQuantity: true,
    },
    orderBy: { familyName: "asc" },
  });

  const stats = new Map<string, FamilyPreviewStat>();

  for (const row of rows) {
    const name = normalizeString(row.familyName) ?? "Pas de famille";
    const current = stats.get(name) ?? {
      name,
      totalCount: 0,
      inStockCount: 0,
      outOfStockCount: 0,
    };

    current.totalCount += 1;
    if ((row.stockQuantity ?? 0) > 0) {
      current.inStockCount += 1;
    } else {
      current.outOfStockCount += 1;
    }

    stats.set(name, current);
  }

  return Array.from(stats.values()).sort((left, right) => left.name.localeCompare(right.name, "fr"));
}

async function listExistingProducts() {
  return db.product.findMany({
    select: {
      id: true,
      externalStockId: true,
      sku: true,
      barcode: true,
      slug: true,
    },
  });
}

function dedupeByShopcaisseProductId(rows: CachePreviewRow[]) {
  const seenProductIds = new Set<string>();
  return rows.filter((row) => {
    if (seenProductIds.has(row.shopcaisseProductId)) {
      return false;
    }
    seenProductIds.add(row.shopcaisseProductId);
    return true;
  });
}

export async function getShopcaisseProductImportPreview(filters: ShopcaisseImportPreviewQuery): Promise<ImportPreviewResult> {
  const page = filters.page;
  const limit = filters.limit;
  const skip = (page - 1) * limit;

  const [allFilteredRows, existingProducts, availableFamilies, familyStats] = await Promise.all([
    listCacheRows({ previewFilters: filters }),
    listExistingProducts(),
    listAvailableFamilies(),
    listFamilyStats(),
  ]);
  const existingIndexes = buildExistingProductIndexes(existingProducts);
  const totalCacheItems = allFilteredRows.length;

  const allPreviewItems = dedupeByShopcaisseProductId(allFilteredRows).map((row) => {
    const existingProduct = resolveExistingProduct(row, existingIndexes);
    const alreadyImported = Boolean(row.linkedProductId || existingProduct);

    return {
      shopcaisseProductId: row.shopcaisseProductId,
      name: row.name,
      sku: row.sku,
      barcode: row.barcode,
      imageUrl: row.imageUrl,
      priceCents: row.priceCents,
      stockQuantity: row.stockQuantity,
      familyName: row.familyName,
      alreadyImported,
    } satisfies ShopcaisseImportPreviewItem;
  });

  const previewItems = allPreviewItems.slice(skip, skip + limit);
  const importableCount = allPreviewItems.filter((item) => item.priceCents !== null).length;
  const missingPriceCount = allPreviewItems.filter((item) => item.priceCents === null).length;
  const missingStockCount = allPreviewItems.filter((item) => item.stockQuantity === null || item.stockQuantity <= 0).length;
  const missingImageCount = allPreviewItems.filter((item) => !normalizeString(item.imageUrl)).length;
  const alreadyLinkedCount = allPreviewItems.filter((item) => item.alreadyImported).length;

  return {
    availableFamilies,
    familyStats,
    selectedFamily: normalizeString(filters.familyName),
    selectedFamilies: Array.from(
      new Set((filters.familyNames ?? []).map((value) => value.trim()).filter((value) => value.length > 0)),
    ),
    totalCacheItems,
    importableCount,
    alreadyLinkedCount,
    missingPriceCount,
    missingStockCount,
    missingImageCount,
    sampleItems: previewItems,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(totalCacheItems / limit)),
    query: normalizeString(filters.q),
    hasStock: toBooleanFilter(filters.hasStock),
    hasPrice: toBooleanFilter(filters.hasPrice),
  };
}

export async function importShopcaisseProductsToCatalog(input: ShopcaisseImportProductsRequest): Promise<ImportProductsResult> {
  const [cacheRows, existingProducts] = await Promise.all([
    listCacheRows({
      shopcaisseProductIds: input.mode === "selected" ? input.shopcaisseProductIds : undefined,
      familyNames: input.mode === "families" ? input.familyNames : undefined,
      inStockOnly: input.mode === "in_stock_only",
    }),
    listExistingProducts(),
  ]);

  const candidateRows = dedupeByShopcaisseProductId(cacheRows);
  const existingIndexes = buildExistingProductIndexes(existingProducts);
  const existingSkuSet = new Set(existingProducts.map((product) => product.sku));
  const existingSlugSet = new Set(existingProducts.map((product) => product.slug));
  const errors: ImportError[] = [];
  const importedAt = new Date();

  let createdCount = 0;
  let skippedCount = 0;
  let linkedCount = 0;

  for (const row of candidateRows) {
    if (!isRowImportable(row)) {
      skippedCount += 1;
      continue;
    }

    try {
      const existingProduct = resolveExistingProduct(row, existingIndexes);

      if (existingProduct) {
        await linkCacheRowsToProduct(row.shopcaisseProductId, existingProduct.id);
        await syncProductImages(existingProduct.id, row);
        linkedCount += 1;
        skippedCount += 1;
        continue;
      }

      const sku = buildDerivedSku(row, existingSkuSet);
      const slug = buildUniqueSlug(row, existingSlugSet);
      const categoryId = row.familyId
        ? await ensureCategoryByFamilyId({ familyId: row.familyId, familyName: row.familyName })
        : row.familyName
          ? await ensureCategoryIdByFamilyName(row.familyName)
          : null;

      const product = await db.product.create({
        data: {
          title: row.name,
          slug,
          sku,
          barcode: normalizeString(row.barcode),
          externalStockId: row.shopcaisseProductId,
          externalProvider: "shopcaisse",
          stockSource: "shopcaisse",
          lastStockSyncAt: importedAt,
          lastStockSyncStatus: "success",
          shortDescription: null,
          description: null,
          priceCents: row.priceCents ?? 0,
          stock: Math.max(0, row.stockQuantity ?? 0),
          status: input.publishByDefault ? "active" : "draft",
          shippingClass: "M",
          estimatedWeightGrams: 0,
          isFragile: false,
          pickupOnly: false,
          imageStatus: row.imageUrl || normalizeStoredImages(row.images).length > 0 ? "pending_review" : "missing",
          imageSource: row.imageUrl || normalizeStoredImages(row.images).length > 0 ? "shopcaisse_import" : "none",
          imageAlt: row.imageUrl ? row.name : null,
          imageUpdatedAt: importedAt,
          categories: categoryId
            ? {
                create: [{ categoryId }],
              }
            : undefined,
        },
        select: {
          id: true,
          externalStockId: true,
          sku: true,
          barcode: true,
          slug: true,
        },
      });

      await linkCacheRowsToProduct(row.shopcaisseProductId, product.id);
      await syncProductImages(product.id, row);

      existingProducts.push(product);
      if (product.externalStockId) {
        existingIndexes.byExternalStockId.set(product.externalStockId, product);
      }
      existingIndexes.bySku.set(product.sku, product);
      if (product.barcode) {
        existingIndexes.byBarcode.set(product.barcode, product);
      }
      existingSkuSet.add(product.sku);
      existingSlugSet.add(product.slug);
      createdCount += 1;
    } catch (error) {
      skippedCount += 1;
      if (errors.length < 10) {
        errors.push({
          shopcaisseProductId: row.shopcaisseProductId,
          message: error instanceof Error ? error.message : "Impossible d'importer ce produit Shopcaisse.",
        });
      }
    }
  }

  return {
    createdCount,
    skippedCount,
    linkedCount,
    errors,
    importedAt,
  };
}

export async function listProductsMissingImages(filters: {
  family?: string | null;
  status?: string | null;
  q?: string | null;
  withStockOnly?: boolean;
  shopcaisseOnly?: boolean;
}) {
  const and: Prisma.ProductWhereInput[] = [
    {
      images: {
        none: {},
      },
    },
  ];

  if (filters.family) {
    and.push({
      categories: {
        some: {
          category: {
            slug: slugify(filters.family),
          },
        },
      },
    });
  }

  if (filters.status) {
    and.push({ status: filters.status });
  }

  if (filters.withStockOnly) {
    and.push({ stock: { gt: 0 } });
  }

  if (filters.shopcaisseOnly) {
    and.push({ externalProvider: "shopcaisse" });
  }

  if (filters.q) {
    and.push({
      OR: [
        { title: { contains: filters.q, mode: "insensitive" } },
        { sku: { contains: filters.q, mode: "insensitive" } },
        { barcode: { contains: filters.q, mode: "insensitive" } },
      ],
    });
  }

  return db.product.findMany({
    where: { AND: and },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      categories: { include: { category: true } },
      shopcaisseCacheLinks: {
        select: {
          imageUrl: true,
          images: true,
        },
        take: 1,
      },
    },
    orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
  });
}
