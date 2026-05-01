# Modèles de données

## Product
```ts
type Product = {
  id: string
  title: string
  slug: string
  sku: string
  barcode?: string
  externalStockId?: string
  externalProvider?: "shopcaisse"
  stockSource?: "local" | "shopcaisse"
  lastStockSyncAt?: Date
  lastStockSyncStatus?: "success" | "failed" | "pending"
  lastStockSyncError?: string
  shortDescription?: string
  description?: string
  priceCents: number
  images: ProductImage[]
  categoryIds: string[]
  stock: number
  status: "draft" | "active" | "archived" | "out_of_stock"
  shippingClass: "XS" | "S" | "M" | "L" | "XL" | "PICKUP_ONLY"
  estimatedWeightGrams: number
  isFragile: boolean
  pickupOnly: boolean
  seoTitle?: string
  seoDescription?: string
}
```

## Order
```ts
type Order = {
  id: string
  orderNumber: string
  customer: OrderCustomer
  items: OrderItem[]
  subtotalCents: number
  shippingCostCents: number
  totalCents: number
  currency: "eur"
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  orderStatus: "pending" | "paid" | "preparing" | "ready_for_pickup" | "shipped" | "completed" | "cancelled"
  shippingMethod: "pickup" | "colissimo_home" | "colissimo_pickup"
  stripeSessionId?: string
  stripePaymentIntentId?: string
  trackingNumber?: string
  shopcaisseSyncStatus?: "pending" | "success" | "failed" | "not_required"
  shopcaisseSyncAt?: Date
  shopcaisseSyncError?: string
}
```
