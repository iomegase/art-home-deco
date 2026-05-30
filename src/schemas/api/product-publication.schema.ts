import { z } from "zod";

export const productIdsRequestSchema = z.object({
  productIds: z.array(z.string().min(1)).min(1).max(500),
});

export type ProductIdsRequest = z.infer<typeof productIdsRequestSchema>;
