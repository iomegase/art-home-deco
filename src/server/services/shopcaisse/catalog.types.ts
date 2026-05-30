export type ShopcaisseCatalogItem = {
  externalProductId: string;
  externalVariantId?: string | null;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  imageUrl?: string | null;
  images?: string[];
  priceCents?: number | null;
  currency?: string | null;
  stockQuantity?: number | null;
  familyName?: string | null;
  familyId?: string | null;
  raw: unknown;
};

export type ShopcaisseProductRecord = {
  id: string;
  companyId?: string;
  name?: string;
  reference?: string;
  barcodes?: string[];
  defaultPrice?: number;
  family?: {
    id?: string;
    name?: string;
  } | null;
  priceCollections?: Array<{
    priceList?: string;
    item?: string;
    price?: number;
  }>;
  variations?: unknown[];
  [key: string]: unknown;
};

export type ShopcaissePriceListRecord = {
  id: string;
  ownerStoreId?: string;
  name?: string;
  [key: string]: unknown;
};

export type ShopcaissePriceRecord = {
  priceList?: string;
  item?: string;
  price?: number;
  [key: string]: unknown;
};

export type ShopcaisseStockRecord = {
  item?: string;
  stock?: number;
  reservedForCustomers?: number;
  reservedForSuppliers?: number;
  [key: string]: unknown;
};

export type ShopcaisseFamilyRecord = {
  id: string;
  name?: string;
  position?: number;
  active?: boolean;
  [key: string]: unknown;
};

export type ShopcaisseCatalogSnapshot = {
  products: ShopcaisseProductRecord[];
  priceLists: ShopcaissePriceListRecord[];
  prices: ShopcaissePriceRecord[];
  stocks: ShopcaisseStockRecord[];
  families: ShopcaisseFamilyRecord[];
  items: ShopcaisseCatalogItem[];
};
