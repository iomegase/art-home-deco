import { NextResponse } from "next/server";
import { cartQuoteRequestSchema } from "@/schemas/api/cart.schema";
import { recalculateCartUseCase } from "@/server/use-cases/recalculate-cart.use-case";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = cartQuoteRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const quote = await recalculateCartUseCase(parsed.data);
    return NextResponse.json({ quote });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Impossible de recalculer le panier." },
      { status: 409 },
    );
  }
}
