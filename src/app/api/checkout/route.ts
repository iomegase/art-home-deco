import { NextResponse } from "next/server";
import { checkoutRequestSchema } from "@/schemas/api/checkout.schema";
import { ShopcaisseCheckoutStockError } from "@/server/services/shopcaisse/stock-verification";
import { createCheckoutSessionUseCase } from "@/server/use-cases/create-checkout-session.use-case";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = checkoutRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await createCheckoutSessionUseCase(parsed.data);

    if (result.mode === "missing_stripe_config") {
      return NextResponse.json(
        {
          error: "Stripe is not configured",
          quote: result.quote,
        },
        { status: 503 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ShopcaisseCheckoutStockError) {
      return NextResponse.json(
        {
          error: error.message,
          stockVerification: error.verification,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Impossible de creer le checkout." },
      { status: 409 },
    );
  }
}
