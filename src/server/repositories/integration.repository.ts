import { db } from "@/server/db/client";

export async function listRecentIntegrationEvents(
  provider?: string,
  eventType?: string,
  filters?: { status?: string; actorEmail?: string; batchLabel?: string },
) {
  return db.integrationEvent.findMany({
    where:
      provider || eventType || filters?.status || filters?.actorEmail || filters?.batchLabel
        ? {
            ...(provider ? { provider } : {}),
            ...(eventType ? { eventType } : {}),
            ...(filters?.status ? { status: filters.status } : {}),
            ...(filters?.actorEmail ? { actorEmail: { contains: filters.actorEmail } } : {}),
            ...(filters?.batchLabel ? { batchLabel: { contains: filters.batchLabel } } : {}),
          }
        : undefined,
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function createIntegrationEvent(input: {
  provider: string;
  eventType: string;
  status: string;
  targetType?: string;
  targetId?: string;
  actorEmail?: string;
  batchLabel?: string;
  message?: string;
  payloadJson?: string;
}) {
  return db.integrationEvent.create({
    data: input,
  });
}

export async function findIntegrationEventById(id: string) {
  return db.integrationEvent.findUnique({
    where: { id },
  });
}
