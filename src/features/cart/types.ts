export type StoredCartItem = {
  productId: string;
  quantity: number;
};

export type CartQuoteLine = {
  productId: string;
  externalStockId?: string;
  slug: string;
  title: string;
  sku: string;
  imageUrl?: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  stock: number;
  shippingClass: string;
  pickupOnly: boolean;
};

export type CartQuote = {
  lines: CartQuoteLine[];
  subtotalCents: number;
  shippingCostCents: number;
  totalCents: number;
  currency: "eur";
  shippingMethod: "pickup" | "colissimo_home" | "colissimo_pickup";
};
