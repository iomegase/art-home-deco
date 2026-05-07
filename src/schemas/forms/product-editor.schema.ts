import { z } from "zod";
import { productStatusSchema, shippingClassSchema } from "@/schemas/domain/product.schema";

export const productEditorSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  sku: z.string().min(1),
  barcode: z.string().optional(),
  externalStockId: z.string().optional(),
  priceCents: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
  shippingClass: shippingClassSchema,
  status: productStatusSchema,
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  imageAlt: z.string().optional(),
  pickupOnly: z.boolean().default(false),
  estimatedWeightGrams: z.number().int().nonnegative().default(0),
  isFragile: z.boolean().default(false),
  categorySlugs: z.array(z.string().min(1)).default([]),
});

export const productAiDraftSchema = z.object({
  id: z.string().min(1),
});

export type ProductEditorInput = z.infer<typeof productEditorSchema>;
