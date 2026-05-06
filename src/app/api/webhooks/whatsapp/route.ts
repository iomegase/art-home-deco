import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { getEnv } from "@/server/env";
import { getWhatsAppDelegates } from "@/server/repositories/whatsapp.repository";
import { normalizeWhatsAppPhone } from "@/server/services/whatsapp/phone";

type WhatsAppWebhookPayload = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{
          id?: string;
          from?: string;
          text?: { body?: string };
          type?: string;
        }>;
      };
    }>;
  }>;
};

export async function GET(request: NextRequest) {
  const env = getEnv();
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && env.WHATSAPP_VERIFY_TOKEN && token === env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "ok", { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: Request) {
  const { conversations, messages: messageRepo } = getWhatsAppDelegates();
  const payload = (await request.json().catch(() => null)) as WhatsAppWebhookPayload | null;

  if (!payload) {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const messages =
    payload.entry?.flatMap((entry) =>
      entry.changes?.flatMap((change) => change.value?.messages ?? []) ?? [],
    ) ?? [];

  await logger.integration("info", {
    provider: "whatsapp",
    eventType: "webhook_received",
    status: "received",
    message: `WhatsApp webhook received (${messages.length} message(s)).`,
  });

  for (const message of messages) {
    if (message.type !== "text" || !message.text?.body || !message.from) {
      continue;
    }

    const phone = normalizeWhatsAppPhone(message.from);
    const conversation = await conversations.findFirst({
      where: {
        OR: [
          { customerPhone: phone },
          { customerPhone: message.from },
          { customerPhone: message.from.startsWith("+") ? message.from.slice(1) : `+${message.from}` },
        ],
      },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });

    if (!conversation) {
      await logger.integration("warn", {
        provider: "whatsapp",
        eventType: "webhook_unmatched_message",
        status: "ignored",
        message: `No conversation found for inbound WhatsApp number ${phone}.`,
      });
      continue;
    }

    const exists = message.id
      ? await messageRepo.findUnique({
          where: { providerMsgId: message.id },
          select: { id: true },
        })
      : null;

    if (exists) {
      continue;
    }

    await messageRepo.create({
      data: {
        conversationId: conversation.id,
        direction: "inbound",
        body: message.text.body,
        providerMsgId: message.id ?? null,
        status: "received",
      },
    });
  }

  return NextResponse.json({ ok: true });
}
