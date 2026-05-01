import { z } from "zod";

export const cartItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(99),
});

export const cartQuoteRequestSchema = z.object({
  items: z.array(cartItemInputSchema).min(1),
  shippingMethod: z.enum(["pickup", "colissimo_home", "colissimo_pickup"]).default("pickup"),
});

export type CartItemInput = z.infer<typeof cartItemInputSchema>;
export type CartQuoteRequest = z.infer<typeof cartQuoteRequestSchema>;
