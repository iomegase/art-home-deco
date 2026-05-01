import { z } from "zod";
import { cartItemInputSchema } from "./cart.schema";

export const checkoutRequestSchema = z.object({
  items: z.array(cartItemInputSchema).min(1),
  shippingMethod: z.enum(["pickup", "colissimo_home", "colissimo_pickup"]),
  customer: z.object({
    email: z.email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional(),
  }),
  successUrl: z.url().optional(),
  cancelUrl: z.url().optional(),
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
