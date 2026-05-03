import { z } from "zod";
import { productStatusSchema, shippingClassSchema } from "@/schemas/domain/product.schema";

export const productImportSchema = z.object({
  csvContent: z.string().min(1, "Le CSV est requis."),
  batchLabel: z.string().max(120).optional(),
});

export const productImportRowSchema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  slug: z.string().min(1).optional(),
  sku: z.string().min(1, "Le SKU est requis."),
  barcode: z.string().min(1).optional(),
  externalStockId: z.string().min(1).optional(),
  priceCents: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
  shippingClass: shippingClassSchema.default("M"),
  status: productStatusSchema.default("draft"),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  categorySlugs: z.array(z.string().min(1)).default([]),
  imageUrl: z.string().url().optional(),
  imageAlt: z.string().optional(),
  pickupOnly: z.boolean().default(false),
  estimatedWeightGrams: z.number().int().nonnegative().default(0),
  isFragile: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export type ProductImportInput = z.infer<typeof productImportSchema>;
export type ProductImportRowInput = z.infer<typeof productImportRowSchema>;
