import { NextResponse } from "next/server";
import { getWhatsAppDelegates } from "@/server/repositories/whatsapp.repository";
import { sendWhatsAppMessageSchema } from "@/server/schemas/whatsapp-chat";
import { sendWhatsAppTextMessage } from "@/server/services/whatsapp/client";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = sendWhatsAppMessageSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { conversations, messages } = getWhatsAppDelegates();

  const conversation = await conversations.findUnique({
    where: { id: parsed.data.conversationId },
    select: { id: true, visitorSessionId: true, customerPhone: true, status: true },
  });

  if (!conversation || conversation.visitorSessionId !== parsed.data.visitorSessionId) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  const outbound = await sendWhatsAppTextMessage({
    to: conversation.customerPhone,
    body: parsed.data.message,
  });

  const message = await messages.create({
    data: {
      conversationId: conversation.id,
      direction: "outbound",
      body: parsed.data.message,
      providerMsgId: outbound.providerMessageId ?? null,
      status: outbound.ok ? "sent" : "failed",
    },
    select: {
      id: true,
      direction: true,
      body: true,
      status: true,
      createdAt: true,
    },
  });

  if (!outbound.ok) {
    return NextResponse.json(
      {
        error: outbound.error ?? "WhatsApp send failed.",
        message,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ message });
}
