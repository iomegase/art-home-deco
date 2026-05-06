export type OrderPaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type OrderStatus =
  | "pending"
  | "paid"
  | "validated"
  | "label_ready"
  | "shipped"
  | "delivered"
  | "cancelled";

export type ShippingMethod = "pickup" | "colissimo_home" | "colissimo_pickup";

export type ShopcaisseSyncStatus = "pending" | "success" | "failed" | "not_required";

export type OrderCustomer = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
};

export type OrderItem = {
  productId: string;
  title: string;
  sku: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotalCents: number;
  shippingCostCents: number;
  totalCents: number;
  currency: "eur";
  paymentStatus: OrderPaymentStatus;
  orderStatus: OrderStatus;
  shippingMethod: ShippingMethod;
  trackingToken?: string;
  carrier?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  labelUrl?: string;
  labelGeneratedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  trackingNumber?: string;
  shopcaisseSyncStatus?: ShopcaisseSyncStatus;
  shopcaisseSyncAt?: Date;
  shopcaisseSyncError?: string;
  analyticsPurchaseTrackedAt?: Date;
};
