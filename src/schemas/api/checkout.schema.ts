import { z } from "zod";
import { cartItemInputSchema } from "./cart.schema";

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().min(1).optional());

export const checkoutRequestSchema = z
  .object({
    items: z.array(cartItemInputSchema).min(1),
    shippingMethod: z.enum(["pickup", "colissimo_home", "colissimo_pickup"]),
    customer: z.object({
      email: z.email(),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      phone: optionalTrimmedString,
      addressLine1: optionalTrimmedString,
      addressLine2: optionalTrimmedString,
      postalCode: optionalTrimmedString,
      city: optionalTrimmedString,
      country: optionalTrimmedString,
    }),
    successUrl: z.url().optional(),
    cancelUrl: z.url().optional(),
  })
  .superRefine((input, ctx) => {
    if (input.shippingMethod === "pickup") {
      return;
    }

    if (!input.customer.addressLine1) {
      ctx.addIssue({ code: "custom", path: ["customer", "addressLine1"], message: "Adresse requise." });
    }
    if (!input.customer.postalCode) {
      ctx.addIssue({ code: "custom", path: ["customer", "postalCode"], message: "Code postal requis." });
    }
    if (!input.customer.city) {
      ctx.addIssue({ code: "custom", path: ["customer", "city"], message: "Ville requise." });
    }
    if (!input.customer.country) {
      ctx.addIssue({ code: "custom", path: ["customer", "country"], message: "Pays requis." });
    }
  });

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
