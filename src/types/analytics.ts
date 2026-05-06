export type ConsentCategory = "necessary" | "analytics" | "marketing";

export type ConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
  version: 1;
};

export type AnalyticsProduct = {
  item_id: string;
  item_name: string;
  item_category?: string;
  price: number;
  quantity: number;
  sku?: string;
};

export type AnalyticsCartItem = AnalyticsProduct;

export type AnalyticsCart = {
  currency: "EUR";
  value: number;
  items: AnalyticsCartItem[];
};

export type AnalyticsOrder = AnalyticsCart & {
  order_id: string;
  payment_type?: string;
  shipping_tier?: string;
};

export type DataLayerEvent = {
  event: string;
  ecommerce?: Record<string, unknown>;
  [key: string]: unknown;
};
