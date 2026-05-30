import { getEnv } from "@/server/env";
import { ShopcaisseConfigError, ShopcaisseResponseError } from "./errors";
import type {
  ShopcaisseCatalogItem,
  ShopcaisseCatalogSnapshot,
  ShopcaisseFamilyRecord,
  ShopcaissePriceListRecord,
  ShopcaissePriceRecord,
  ShopcaisseProductRecord,
  ShopcaisseStockRecord,
} from "./catalog.types";

type ShopcaisseValidationErrorCode =
  | "INVALID_OR_EXPIRED_KEY"
  | "INSUFFICIENT_PERMISSIONS"
  | "INVALID_ENDPOINT"
  | "SHOPCAISSE_SERVER_ERROR"
  | "INVALID_RESPONSE_SHAPE"
  | "NETWORK_ERROR";

type ShopcaisseValidationFailure = {
  success: false;
  status: 401 | 403 | 404 | 500;
  code: ShopcaisseValidationErrorCode;
  message: string;
};

type ShopcaisseValidationSuccess = {
  success: true;
  companyId?: string;
  storeId?: string;
  posId?: string;
  detectedResources: string[];
  usefulPermissions: string[];
};

export type ShopcaisseConnectionValidationResult = ShopcaisseValidationSuccess | ShopcaisseValidationFailure;

export async function shopcaisseRequest<T>(input: {
  path: string;
  method?: "GET" | "POST";
  body?: unknown;
}) {
  const env = getEnv();

  if (!env.SHOPCAISSE_API_URL) {
    throw new ShopcaisseConfigError("EasyShop API base URL is not configured.");
  }

  if (!env.SHOPCAISSE_API_KEY) {
    throw new ShopcaisseConfigError("EasyShop API key is not configured.");
  }

  const url = new URL(input.path, env.SHOPCAISSE_API_URL).toString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.SHOPCAISSE_API_TIMEOUT_MS ?? 10000);

  try {
    const response = await fetch(url, {
      method: input.method ?? "GET",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${env.SHOPCAISSE_API_KEY}`,
        "Content-Type": "application/json",
        ...(env.SHOPCAISSE_STORE_ID ? { "X-Store-Id": env.SHOPCAISSE_STORE_ID } : {}),
      },
      body: input.body ? JSON.stringify(input.body) : undefined,
    });

    if (!response.ok) {
      throw new ShopcaisseResponseError(`EasyShop request failed with status ${response.status}.`, response.status);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function extractString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function pickResourceId(resources: unknown, prefix: "company" | "store" | "pos"): string | undefined {
  if (Array.isArray(resources)) {
    const match = resources.find((entry): entry is string => typeof entry === "string" && entry.startsWith(`${prefix}.`));
    return match ? match.slice(prefix.length + 1) : undefined;
  }

  if (!resources || typeof resources !== "object") {
    return undefined;
  }

  const resourceRecord = resources as Record<string, unknown>;
  const candidate = resourceRecord[prefix];
  if (candidate && typeof candidate === "object") {
    const directId = extractString((candidate as Record<string, unknown>).id);
    if (directId) {
      return directId;
    }
  }

  return extractString(resourceRecord[`${prefix}Id`]);
}

function normalizePermissions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string");
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  return Object.entries(value as Record<string, unknown>)
    .filter(([, allowed]) => Boolean(allowed))
    .map(([permission]) => permission);
}

function detectUsefulPermissions(permissions: string[]): string[] {
  return permissions.filter((permission) => {
    const normalized = permission.toLowerCase();
    return (
      normalized.includes("stock")
      || normalized.includes("item")
      || normalized.includes("catalog")
      || normalized.includes("order")
    );
  });
}

function normalizeResources(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string");
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  return Object.entries(value as Record<string, unknown>)
    .flatMap(([key, resource]) => {
      if (!resource || typeof resource !== "object") {
        return [];
      }

      const id = extractString((resource as Record<string, unknown>).id);
      return id ? [`${key}.${id}`] : [];
    });
}

type ShopcaissePaginatedResponse<T> = {
  items: T[];
  hasNextPage?: boolean;
  skipped?: number;
};

function coerceString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toPriceCents(value: unknown): number | null {
  const amount = coerceNumber(value);
  return amount === null ? null : Math.round(amount * 100);
}

function normalizeBarcode(value: unknown): string | null {
  if (Array.isArray(value)) {
    const firstBarcode = value.find((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
    return firstBarcode?.trim() ?? null;
  }

  return coerceString(value);
}

function isSensitiveImageUrl(url: URL) {
  const sensitiveKeys = [
    "token",
    "signature",
    "sig",
    "auth",
    "authorization",
    "x-amz-signature",
    "x-amz-credential",
    "x-amz-security-token",
  ];

  return sensitiveKeys.some((key) => url.searchParams.has(key));
}

function normalizeImageUrl(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);

    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    if (isSensitiveImageUrl(url)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function collectImageUrls(value: unknown, accumulator: Set<string>) {
  const directUrl = normalizeImageUrl(value);
  if (directUrl) {
    accumulator.add(directUrl);
    return;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      collectImageUrls(entry, accumulator);
    }
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  const record = value as Record<string, unknown>;

  for (const key of ["image", "imageUrl", "picture", "photo", "thumbnail", "url", "src", "href"]) {
    if (key in record) {
      collectImageUrls(record[key], accumulator);
    }
  }

  for (const key of ["images", "pictures", "photos", "media", "medias", "attachments"]) {
    if (key in record) {
      collectImageUrls(record[key], accumulator);
    }
  }
}

function extractProductImages(product: ShopcaisseProductRecord) {
  const imageUrls = new Set<string>();

  for (const key of [
    "image",
    "imageUrl",
    "images",
    "picture",
    "pictures",
    "photo",
    "photos",
    "media",
    "medias",
    "attachments",
    "thumbnail",
  ]) {
    collectImageUrls(product[key], imageUrls);
  }

  return Array.from(imageUrls);
}

function assertShopcaisseCatalogEnv() {
  const env = getEnv();

  if (!env.SHOPCAISSE_API_URL) {
    throw new ShopcaisseConfigError("EasyShop API base URL is not configured.");
  }

  if (!env.SHOPCAISSE_API_KEY) {
    throw new ShopcaisseConfigError("EasyShop API key is not configured.");
  }

  if (!env.SHOPCAISSE_COMPANY_ID) {
    throw new ShopcaisseConfigError("EasyShop company ID is not configured.");
  }

  if (!env.SHOPCAISSE_STORE_ID) {
    throw new ShopcaisseConfigError("EasyShop store ID is not configured.");
  }

  if (!env.SHOPCAISSE_POS_ID) {
    throw new ShopcaisseConfigError("EasyShop POS ID is not configured.");
  }

  // The documented read endpoints used here are company/store scoped.
  // We still require POS_ID because it is part of the validated Shopcaisse setup
  // and will likely be needed for later checkout or order flows.
  return env;
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function fetchPaginatedShopcaisse<T>(pathBuilder: (page: number) => string) {
  const items: T[] = [];
  let page = 0;

  while (true) {
    const response = await shopcaisseRequest<ShopcaissePaginatedResponse<T>>({
      path: pathBuilder(page),
    });

    items.push(...response.items);

    if (!response.hasNextPage) {
      break;
    }

    page += 1;
  }

  return items;
}

function normalizeShopcaisseCatalogItems(input: {
  products: ShopcaisseProductRecord[];
  prices: ShopcaissePriceRecord[];
  stocks: ShopcaisseStockRecord[];
}) {
  const priceByItemId = new Map(
    input.prices
      .map((entry) => {
        const itemId = coerceString(entry.item);
        const priceCents = toPriceCents(entry.price);

        if (!itemId) {
          return null;
        }

        return [itemId, priceCents] as const;
      })
      .filter((entry): entry is readonly [string, number | null] => entry !== null),
  );

  const stockByItemId = new Map(
    input.stocks
      .map((entry) => {
        const itemId = coerceString(entry.item);
        const stock = coerceNumber(entry.stock);

        if (!itemId) {
          return null;
        }

        return [itemId, stock === null ? null : Math.max(0, Math.floor(stock))] as const;
      })
      .filter((entry): entry is readonly [string, number | null] => entry !== null),
  );

  return input.products.map<ShopcaisseCatalogItem>((product) => {
    const productId = coerceString(product.id) ?? "";
    const inlinePrice = toPriceCents(product.defaultPrice);
    const familyName = coerceString(product.family?.name);
    const familyId = coerceString(product.family?.id);
    const images = extractProductImages(product);

    return {
      externalProductId: productId,
      externalVariantId: null,
      name: coerceString(product.name) ?? "Produit Shopcaisse",
      sku: coerceString(product.reference),
      barcode: normalizeBarcode(product.barcodes),
      imageUrl: images[0] ?? null,
      images,
      priceCents: priceByItemId.get(productId) ?? inlinePrice,
      currency: "EUR",
      stockQuantity: stockByItemId.get(productId) ?? null,
      familyName,
      familyId,
      raw: {
        product,
        price: input.prices.find((entry) => entry.item === productId) ?? null,
        stock: input.stocks.find((entry) => entry.item === productId) ?? null,
      },
    };
  });
}

export async function validateShopcaisseConnection(): Promise<ShopcaisseConnectionValidationResult> {
  const env = getEnv();

  if (!env.SHOPCAISSE_API_URL) {
    throw new ShopcaisseConfigError("EasyShop API base URL is not configured.");
  }

  if (!env.SHOPCAISSE_API_KEY) {
    throw new ShopcaisseConfigError("EasyShop API key is not configured.");
  }

  const url = new URL("/v1/authentication", env.SHOPCAISSE_API_URL).toString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.SHOPCAISSE_API_TIMEOUT_MS ?? 10000);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${env.SHOPCAISSE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      return {
        success: false,
        status: 401,
        code: "INVALID_OR_EXPIRED_KEY",
        message: "Shopcaisse key is invalid or expired.",
      };
    }

    if (response.status === 403) {
      return {
        success: false,
        status: 403,
        code: "INSUFFICIENT_PERMISSIONS",
        message: "Shopcaisse key does not have enough permissions.",
      };
    }

    if (response.status === 404) {
      return {
        success: false,
        status: 404,
        code: "INVALID_ENDPOINT",
        message: "Shopcaisse endpoint /v1/authentication was not found.",
      };
    }

    if (response.status >= 500) {
      return {
        success: false,
        status: 500,
        code: "SHOPCAISSE_SERVER_ERROR",
        message: "Shopcaisse server error while validating the connection.",
      };
    }

    if (!response.ok) {
      throw new ShopcaisseResponseError(`EasyShop request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as {
      bundle?: {
        resources?: unknown;
        permissions?: unknown;
      };
    };

    const resources = payload.bundle?.resources;
    const permissionsRaw = payload.bundle?.permissions;

    if (!resources || permissionsRaw === undefined) {
      return {
        success: false,
        status: 500,
        code: "INVALID_RESPONSE_SHAPE",
        message: "Shopcaisse authentication payload does not include expected bundle resources/permissions.",
      };
    }
    const permissions = normalizePermissions(permissionsRaw);
    const detectedResources = normalizeResources(resources);

    const companyId = pickResourceId(resources, "company");
    const storeId = pickResourceId(resources, "store");
    const posId = pickResourceId(resources, "pos");

    return {
      success: true,
      companyId,
      storeId,
      posId,
      detectedResources,
      usefulPermissions: detectUsefulPermissions(permissions),
    };
  } catch {
    return {
      success: false,
      status: 500,
      code: "NETWORK_ERROR",
      message: "Network error while contacting Shopcaisse authentication endpoint.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function listShopcaisseProducts(): Promise<ShopcaisseProductRecord[]> {
  const env = assertShopcaisseCatalogEnv();

  return fetchPaginatedShopcaisse<ShopcaisseProductRecord>((page) =>
    `/v1/companies/${env.SHOPCAISSE_COMPANY_ID}/items${buildQuery({
      page,
      pageSize: 200,
    })}`,
  );
}

async function listShopcaissePriceLists(): Promise<ShopcaissePriceListRecord[]> {
  const env = assertShopcaisseCatalogEnv();
  const response = await shopcaisseRequest<ShopcaissePaginatedResponse<ShopcaissePriceListRecord>>({
    path: `/v1/companies/${env.SHOPCAISSE_COMPANY_ID}/prices`,
  });

  return response.items;
}

async function listShopcaissePriceValues(priceListId: string): Promise<ShopcaissePriceRecord[]> {
  const env = assertShopcaisseCatalogEnv();

  return fetchPaginatedShopcaisse<ShopcaissePriceRecord>((page) =>
    `/v1/companies/${env.SHOPCAISSE_COMPANY_ID}/prices/${priceListId}${buildQuery({
      page,
      pageSize: 200,
    })}`,
  );
}

async function listShopcaissePricesFromPriceLists(priceLists: ShopcaissePriceListRecord[]) {
  if (priceLists.length === 0) {
    return [];
  }

  const prices = await Promise.all(
    priceLists
      .map((priceList) => coerceString(priceList.id))
      .filter((priceListId): priceListId is string => Boolean(priceListId))
      .map((priceListId) => listShopcaissePriceValues(priceListId)),
  );

  return prices.flat();
}

export async function listShopcaissePrices(): Promise<ShopcaissePriceRecord[]> {
  const priceLists = await listShopcaissePriceLists();
  return listShopcaissePricesFromPriceLists(priceLists);
}

export async function listShopcaisseStocks(): Promise<ShopcaisseStockRecord[]> {
  const env = assertShopcaisseCatalogEnv();

  return fetchPaginatedShopcaisse<ShopcaisseStockRecord>((page) =>
    `/v1/stores/${env.SHOPCAISSE_STORE_ID}/stocks${buildQuery({
      page,
      pageSize: 200,
    })}`,
  );
}

export async function listShopcaisseFamilies(): Promise<ShopcaisseFamilyRecord[]> {
  const env = assertShopcaisseCatalogEnv();

  return fetchPaginatedShopcaisse<ShopcaisseFamilyRecord>((page) =>
    `/v1/companies/${env.SHOPCAISSE_COMPANY_ID}/families${buildQuery({
      page,
      pageSize: 200,
    })}`,
  );
}

export async function getShopcaisseCatalogSnapshot(): Promise<ShopcaisseCatalogSnapshot> {
  const [products, priceLists, stocks, families] = await Promise.all([
    listShopcaisseProducts(),
    listShopcaissePriceLists(),
    listShopcaisseStocks(),
    listShopcaisseFamilies(),
  ]);
  const prices = await listShopcaissePricesFromPriceLists(priceLists);

  return {
    products,
    priceLists,
    prices,
    stocks,
    families,
    items: normalizeShopcaisseCatalogItems({ products, prices, stocks }),
  };
}
