import { z } from "zod";

export const startWhatsAppConversationSchema = z.object({
  visitorSessionId: z.string().min(8).max(128),
  customerName: z.string().trim().min(2).max(80).optional(),
  customerPhone: z.string().trim().regex(/^\+?[1-9]\d{7,14}$/),
  consent: z.literal(true),
});

export const sendWhatsAppMessageSchema = z.object({
  conversationId: z.string().min(8),
  visitorSessionId: z.string().min(8).max(128),
  message: z.string().trim().min(1).max(1000),
});

export const listWhatsAppMessagesSchema = z.object({
  conversationId: z.string().min(8),
  visitorSessionId: z.string().min(8).max(128),
});

