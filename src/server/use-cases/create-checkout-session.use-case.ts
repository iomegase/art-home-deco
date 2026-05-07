import { getStripeClient } from "@/lib/stripe/client";
import type { CheckoutRequest } from "@/schemas/api/checkout.schema";
import { db } from "@/server/db/client";
import { getEnv } from "@/server/env";
import { createTrackingToken } from "@/server/services/customer/tracking-token";
import {
  ShopcaisseCheckoutStockError,
  verifyShopcaisseStockBeforeCheckout,
} from "@/server/services/shopcaisse/stock-verification";
import { recalculateCartUseCase } from "./recalculate-cart.use-case";

function createOrderNumber(): string {
  return `AHD-${Date.now().toString(36).toUpperCase()}`;
}

export async function createCheckoutSessionUseCase(input: CheckoutRequest) {
  const env = getEnv();
  const quote = await recalculateCartUseCase({
    items: input.items,
    shippingMethod: input.shippingMethod,
  });

  const stockVerification = await verifyShopcaisseStockBeforeCheckout(
    quote.lines.map((line) => ({
      productId: line.productId,
      shopcaisseProductId: line.externalStockId ?? undefined,
      quantity: line.quantity,
    })),
  );

  if (!stockVerification.success) {
    throw new ShopcaisseCheckoutStockError(
      "Certains articles ne sont plus disponibles dans les quantites demandees. Merci d'actualiser votre panier.",
      stockVerification,
    );
  }

  const stripe = getStripeClient(env.STRIPE_SECRET_KEY);

  if (!stripe) {
    return {
      mode: "missing_stripe_config" as const,
      quote,
    };
  }

  const order = await db.order.create({
    data: {
      orderNumber: createOrderNumber(),
      customerEmail: input.customer.email,
      customerFirstName: input.customer.firstName,
      customerLastName: input.customer.lastName,
      customerPhone: input.customer.phone,
      subtotalCents: quote.subtotalCents,
      shippingCostCents: quote.shippingCostCents,
      totalCents: quote.totalCents,
      currency: quote.currency,
      paymentStatus: "pending",
      orderStatus: "pending",
      shippingMethod: quote.shippingMethod,
      shippingAddressLine1: input.customer.addressLine1,
      shippingAddressLine2: input.customer.addressLine2,
      shippingPostalCode: input.customer.postalCode,
      shippingCity: input.customer.city,
      shippingCountry: input.customer.country,
      trackingToken: createTrackingToken(),
      carrier: quote.shippingMethod === "pickup" ? null : "colissimo",
      shopcaisseSyncStatus: "not_required",
      items: {
        create: quote.lines.map((line) => ({
          productId: line.productId,
          title: line.title,
          sku: line.sku,
          quantity: line.quantity,
          unitPriceCents: line.unitPriceCents,
          lineTotalCents: line.lineTotalCents,
        })),
      },
    },
  });

  const baseUrl = env.NEXT_PUBLIC_APP_URL;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.customer.email,
    success_url: input.successUrl ?? `${baseUrl}/commande/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: input.cancelUrl ?? `${baseUrl}/commande/cancel`,
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
    },
    line_items: [
      ...quote.lines.map((line) => ({
        quantity: line.quantity,
        price_data: {
          currency: quote.currency,
          unit_amount: line.unitPriceCents,
          product_data: {
            name: line.title,
            metadata: {
              productId: line.productId,
              sku: line.sku,
            },
          },
        },
      })),
      ...(quote.shippingCostCents > 0
        ? [
            {
              quantity: 1,
              price_data: {
                currency: quote.currency,
                unit_amount: quote.shippingCostCents,
                product_data: {
                  name: "Livraison",
                },
              },
            },
          ]
        : []),
    ],
  });

  await db.order.update({
    where: { id: order.id },
    data: {
      stripeSessionId: session.id,
    },
  });

  return {
    mode: "stripe_session" as const,
    orderId: order.id,
    orderNumber: order.orderNumber,
    checkoutUrl: session.url,
    sessionId: session.id,
    quote,
  };
}
