import Stripe from "stripe";

let stripeClient: Stripe | undefined;

export function getStripeClient(secretKey?: string) {
  if (!secretKey) {
    return null;
  }

  stripeClient ??= new Stripe(secretKey);
  return stripeClient;
}
