import { NextRequest, NextResponse } from "next/server";
import { findIntegrationEventById } from "@/server/repositories/integration.repository";
import { requireAdmin } from "@/server/security/auth";

function escapeCsvField(value: string) {
  const normalized = value.replace(/"/g, "\"\"");
  return `"${normalized}"`;
}

export async function GET(request: NextRequest) {
  await requireAdmin();

  const eventId = request.nextUrl.searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json({ error: "eventId manquant." }, { status: 400 });
  }

  const event = await findIntegrationEventById(eventId);

  if (!event || event.provider !== "catalog" || event.eventType !== "product_csv_import") {
    return NextResponse.json({ error: "Import introuvable." }, { status: 404 });
  }

  const payload = event.payloadJson ? (JSON.parse(event.payloadJson) as { errors?: Array<Record<string, unknown>> }) : {};
  const errors = Array.isArray(payload.errors) ? payload.errors : [];

  const header = ["rowNumber", "sku", "title", "message"];
  const rows = errors.map((error) =>
    [
      String(error.rowNumber ?? ""),
      String(error.sku ?? ""),
      String(error.title ?? ""),
      String(error.message ?? ""),
    ]
      .map(escapeCsvField)
      .join(","),
  );

  return new NextResponse([header.join(","), ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="product-import-errors-${event.id}.csv"`,
    },
  });
}
