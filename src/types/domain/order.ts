export type OrderPaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type OrderStatus =
  | "pending"
  | "paid"
  | "preparing"
  | "ready_for_pickup"
  | "shipped"
  | "completed"
  | "cancelled";

export type ShippingMethod = "pickup" | "colissimo_home" | "colissimo_pickup";

export type ShopcaisseSyncStatus = "pending" | "success" | "failed" | "not_required";

export type OrderCustomer = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
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
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  trackingNumber?: string;
  shopcaisseSyncStatus?: ShopcaisseSyncStatus;
  shopcaisseSyncAt?: Date;
  shopcaisseSyncError?: string;
};
