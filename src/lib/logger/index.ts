import { db } from "@/server/db/client";

type LogLevel = "info" | "warn" | "error";

async function persistIntegrationEvent(input: {
  provider: string;
  eventType: string;
  status: string;
  message?: string;
  targetType?: string;
  targetId?: string;
  payload?: unknown;
}) {
  try {
    await db.integrationEvent.create({
      data: {
        provider: input.provider,
        eventType: input.eventType,
        status: input.status,
        message: input.message,
        targetType: input.targetType,
        targetId: input.targetId,
        payloadJson: input.payload ? JSON.stringify(input.payload) : null,
      },
    });
  } catch (error) {
    console.error("Failed to persist integration event", error);
  }
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    console.info(message, context ?? {});
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn(message, context ?? {});
  },
  error: (message: string, context?: Record<string, unknown>) => {
    console.error(message, context ?? {});
  },
  integration: async (
    level: LogLevel,
    input: {
      provider: string;
      eventType: string;
      status: string;
      message?: string;
      targetType?: string;
      targetId?: string;
      payload?: unknown;
    },
  ) => {
    const payload = { ...input };
    console[level](input.message ?? `${input.provider}:${input.eventType}`, payload);
    await persistIntegrationEvent(input);
  },
};
