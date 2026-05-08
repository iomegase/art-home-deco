import { NextResponse } from "next/server";
import { listOrdersReadyForColishipExport } from "@/server/repositories/order.repository";
import { requireAdmin } from "@/server/security/auth";
import { calculateOrderShippingEstimate } from "@/server/services/shipping/order-shipping";
import { buildColishipClassicCsv } from "@/server/services/shipping/exports/coliship-legacy-csv";
import { buildExpeditionsProCsv } from "@/server/services/shipping/exports/expeditions-pro-csv";
import { hasCompleteShippingAddress } from "@/server/services/shipping/exports/shared";

const supportedFormats = ["expeditions-pro", "coliship-classic"] as const;
type ExportFormat = (typeof supportedFormats)[number];

function isSupportedFormat(format: string | null): format is ExportFormat {
  return supportedFormats.includes((format ?? "") as ExportFormat);
}

export async function GET(request: Request) {
  await requireAdmin();
  const { searchParams } = new URL(request.url);
  const requestedFormat = searchParams.get("format");
  const format: ExportFormat = isSupportedFormat(requestedFormat) ? requestedFormat : "expeditions-pro";

  const orders = await listOrdersReadyForColishipExport();

  const exportableOrders = orders.filter((order) => {
    if (!hasCompleteShippingAddress(order)) {
      return false;
    }

    const shippingEstimate = calculateOrderShippingEstimate(order);
    return !shippingEstimate.hasPickupOnlyItem;
  });
  const dateLabel = new Date().toISOString().slice(0, 10);
  const csv = format === "coliship-classic"
    ? buildColishipClassicCsv(exportableOrders)
    : buildExpeditionsProCsv(exportableOrders);
  const fileName = format === "coliship-classic"
    ? `coliship-classic-orders-${dateLabel}.csv`
    : `expeditions-pro-orders-${dateLabel}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
