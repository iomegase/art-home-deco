import { NextResponse } from "next/server";
import { listOrdersForAdmin } from "@/server/repositories/order.repository";
import { requireAdmin } from "@/server/security/auth";

export async function GET() {
  await requireAdmin();

  const orders = await listOrdersForAdmin();
  const header = [
    "orderNumber",
    "customerEmail",
    "paymentStatus",
    "orderStatus",
    "shippingMethod",
    "trackingNumber",
    "totalCents",
  ];

  const rows = orders.map((order) =>
    [
      order.orderNumber,
      order.customerEmail,
      order.paymentStatus,
      order.orderStatus,
      order.shippingMethod,
      order.trackingNumber ?? "",
      String(order.totalCents),
    ].join(","),
  );

  return new NextResponse([header.join(","), ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="orders-export.csv"',
    },
  });
}
