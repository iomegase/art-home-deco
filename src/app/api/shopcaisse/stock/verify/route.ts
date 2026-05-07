import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/security/auth";
import { verifyShopcaisseStockBeforeCheckout } from "@/server/services/shopcaisse/stock-verification";

const payloadSchema = z.object({
  items: z.array(z.object({
    productId: z.string().optional(),
    shopcaisseProductId: z.string().optional(),
    quantity: z.number().int().positive(),
  })).min(1),
});

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = payloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid stock verification payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await verifyShopcaisseStockBeforeCheckout(parsed.data.items);
    return NextResponse.json(result, { status: result.success ? 200 : 409 });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Impossible de verifier le stock Shopcaisse." },
      { status },
    );
  }
}
