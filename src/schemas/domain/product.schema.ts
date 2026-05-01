import { z } from "zod";

export const shippingClassSchema = z.enum(["XS", "S", "M", "L", "XL", "PICKUP_ONLY"]);

export const productStatusSchema = z.enum(["draft", "active", "archived", "out_of_stock"]);

export const productSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  sku: z.string().min(1),
  barcode: z.string().optional(),
  externalStockId: z.string().optional(),
  externalProvider: z.enum(["shopcaisse"]).optional(),
  stockSource: z.enum(["local", "shopcaisse"]).optional(),
  lastStockSyncAt: z.date().optional(),
  lastStockSyncStatus: z.enum(["success", "failed", "pending"]).optional(),
  lastStockSyncError: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  priceCents: z.number().int().nonnegative(),
  images: z.array(
    z.object({
      url: z.string().url(),
      alt: z.string().optional(),
      position: z.number().int().nonnegative(),
    }),
  ),
  categoryIds: z.array(z.string()),
  stock: z.number().int().nonnegative(),
  status: productStatusSchema,
  shippingClass: shippingClassSchema,
  estimatedWeightGrams: z.number().int().nonnegative(),
  isFragile: z.boolean(),
  pickupOnly: z.boolean(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export type ProductSchema = z.infer<typeof productSchema>;
