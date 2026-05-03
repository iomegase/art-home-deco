import { NextResponse } from "next/server";
import { listRecentIntegrationEvents } from "@/server/repositories/integration.repository";
import { requireAdmin } from "@/server/security/auth";

export async function GET() {
  await requireAdmin();

  const events = await listRecentIntegrationEvents();
  const header = ["provider", "eventType", "status", "targetType", "targetId", "message", "createdAt"];
  const rows = events.map((event) =>
    [
      event.provider,
      event.eventType,
      event.status,
      event.targetType ?? "",
      event.targetId ?? "",
      JSON.stringify(event.message ?? ""),
      event.createdAt.toISOString(),
    ].join(","),
  );

  return new NextResponse([header.join(","), ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="integration-events.csv"',
    },
  });
}
