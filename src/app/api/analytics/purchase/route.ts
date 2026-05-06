import { NextResponse } from "next/server";
import { markPurchaseAnalyticsTracked } from "@/server/repositories/order.repository";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { sessionId?: string } | null;
  const sessionId = body?.sessionId?.trim();

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const result = await markPurchaseAnalyticsTracked(sessionId);

  if (!result.tracked) {
    return NextResponse.json({ tracked: false });
  }

  const order = result.order;

  return NextResponse.json({
    tracked: true,
    order: {
      order_id: order.orderNumber,
      currency: "EUR",
      value: order.totalCents / 100,
      payment_type: "stripe",
      shipping_tier: order.shippingMethod,
      items: order.items.map((item) => ({
        item_id: item.productId ?? item.sku,
        item_name: item.title,
        price: item.unitPriceCents / 100,
        quantity: item.quantity,
        sku: item.sku,
      })),
    },
  });
}
