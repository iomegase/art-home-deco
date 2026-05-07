import { z } from "zod";

const optionalBooleanQuery = z.union([z.literal("true"), z.literal("false")]).optional();

export const shopcaisseImportPreviewQuerySchema = z.object({
  familyName: z.string().trim().min(1).optional(),
  familyNames: z.array(z.string().trim().min(1)).max(100).optional(),
  q: z.string().trim().min(1).optional(),
  hasStock: optionalBooleanQuery,
  hasPrice: optionalBooleanQuery,
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export const shopcaisseImportProductsRequestSchema = z.object({
  mode: z.enum(["selected", "all", "families", "in_stock_only"]),
  shopcaisseProductIds: z.array(z.string().min(1)).max(500).optional(),
  familyNames: z.array(z.string().min(1)).max(100).optional(),
  publishByDefault: z.boolean().default(false),
}).superRefine((value, ctx) => {
  if (value.mode === "selected" && (!value.shopcaisseProductIds || value.shopcaisseProductIds.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["shopcaisseProductIds"],
      message: "Au moins un identifiant Shopcaisse est requis en mode selected.",
    });
  }

  if (value.mode === "families" && (!value.familyNames || value.familyNames.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["familyNames"],
      message: "Au moins une famille Shopcaisse est requise en mode families.",
    });
  }
});

export type ShopcaisseImportPreviewQuery = z.infer<typeof shopcaisseImportPreviewQuerySchema>;
export type ShopcaisseImportProductsRequest = z.infer<typeof shopcaisseImportProductsRequestSchema>;
