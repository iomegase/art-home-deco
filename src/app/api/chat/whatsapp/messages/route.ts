import { NextRequest, NextResponse } from "next/server";
import { getWhatsAppDelegates } from "@/server/repositories/whatsapp.repository";
import { listWhatsAppMessagesSchema } from "@/server/schemas/whatsapp-chat";

export async function GET(request: NextRequest) {
  const parsed = listWhatsAppMessagesSchema.safeParse({
    conversationId: request.nextUrl.searchParams.get("conversationId") ?? "",
    visitorSessionId: request.nextUrl.searchParams.get("visitorSessionId") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query", details: parsed.error.flatten() }, { status: 400 });
  }

  const { conversations, messages } = getWhatsAppDelegates();

  const conversation = await conversations.findUnique({
    where: { id: parsed.data.conversationId },
    select: { id: true, visitorSessionId: true },
  });

  if (!conversation || conversation.visitorSessionId !== parsed.data.visitorSessionId) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  const items = await messages.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      direction: true,
      body: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ messages: items });
}
