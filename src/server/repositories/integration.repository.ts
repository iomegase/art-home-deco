import { db } from "@/server/db/client";

export async function listRecentIntegrationEvents(provider?: string) {
  return db.integrationEvent.findMany({
    where: provider ? { provider } : undefined,
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}
