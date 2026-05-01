export type StockSource = "local" | "shopcaisse";

export type ProductStatus = "draft" | "active" | "archived" | "out_of_stock";

export type ShippingClass = "XS" | "S" | "M" | "L" | "XL" | "PICKUP_ONLY";

export type ProductImage = {
  url: string;
  alt?: string;
  position: number;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  sku: string;
  barcode?: string;
  externalStockId?: string;
  externalProvider?: "shopcaisse";
  stockSource?: StockSource;
  lastStockSyncAt?: Date;
  lastStockSyncStatus?: "success" | "failed" | "pending";
  lastStockSyncError?: string;
  shortDescription?: string;
  description?: string;
  priceCents: number;
  images: ProductImage[];
  categoryIds: string[];
  stock: number;
  status: ProductStatus;
  shippingClass: ShippingClass;
  estimatedWeightGrams: number;
  isFragile: boolean;
  pickupOnly: boolean;
  seoTitle?: string;
  seoDescription?: string;
};
