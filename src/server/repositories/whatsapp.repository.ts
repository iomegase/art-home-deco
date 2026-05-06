import { db } from "@/server/db/client";

type ConversationDelegate = typeof db.whatsAppConversation;
type MessageDelegate = typeof db.whatsAppMessage;

export function getWhatsAppDelegates(): {
  conversations: ConversationDelegate;
  messages: MessageDelegate;
} {
  const prismaMaybe = db as unknown as {
    whatsAppConversation?: ConversationDelegate;
    whatsAppMessage?: MessageDelegate;
  };
  const conversations = prismaMaybe.whatsAppConversation;
  const messages = prismaMaybe.whatsAppMessage;

  if (!conversations || !messages) {
    throw new Error(
      "Prisma WhatsApp models are unavailable. Run prisma db push, prisma generate, then restart next dev.",
    );
  }

  return { conversations, messages };
}
