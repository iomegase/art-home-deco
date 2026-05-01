import { z } from "zod";

export const orderSchema = z.object({
  id: z.string().min(1),
  orderNumber: z.string().min(1),
  customer: z.object({
    email: z.email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional(),
  }),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      title: z.string().min(1),
      sku: z.string().min(1),
      quantity: z.number().int().positive(),
      unitPriceCents: z.number().int().nonnegative(),
      lineTotalCents: z.number().int().nonnegative(),
    }),
  ),
  subtotalCents: z.number().int().nonnegative(),
  shippingCostCents: z.number().int().nonnegative(),
  totalCents: z.number().int().nonnegative(),
  currency: z.literal("eur"),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]),
  orderStatus: z.enum(["pending", "paid", "preparing", "ready_for_pickup", "shipped", "completed", "cancelled"]),
  shippingMethod: z.enum(["pickup", "colissimo_home", "colissimo_pickup"]),
  stripeSessionId: z.string().optional(),
  stripePaymentIntentId: z.string().optional(),
  trackingNumber: z.string().optional(),
  shopcaisseSyncStatus: z.enum(["pending", "success", "failed", "not_required"]).optional(),
  shopcaisseSyncAt: z.date().optional(),
  shopcaisseSyncError: z.string().optional(),
});

export type OrderSchema = z.infer<typeof orderSchema>;
