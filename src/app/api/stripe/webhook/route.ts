import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { getEnv } from "@/server/env";
import { handleStripeWebhookUseCase } from "@/server/use-cases/handle-stripe-webhook.use-case";

export async function POST(request: Request) {
  const env = getEnv();
  const stripe = getStripeClient(env.STRIPE_SECRET_KEY);

  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook is not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  try {
    const event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    const result = await handleStripeWebhookUseCase(event);
    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid Stripe webhook" },
      { status: 400 },
    );
  }
}
