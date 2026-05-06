import { NextResponse } from "next/server";
import { getWhatsAppDelegates } from "@/server/repositories/whatsapp.repository";
import { isMissingTableError } from "@/server/repositories/prisma-errors";
import { startWhatsAppConversationSchema } from "@/server/schemas/whatsapp-chat";
import { normalizeWhatsAppPhone } from "@/server/services/whatsapp/phone";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = startWhatsAppConversationSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const { conversations } = getWhatsAppDelegates();
    const normalizedPhone = normalizeWhatsAppPhone(parsed.data.customerPhone);
    const conversation = await conversations.upsert({
      where: { visitorSessionId: parsed.data.visitorSessionId },
      update: {
        customerName: parsed.data.customerName,
        customerPhone: normalizedPhone,
        consentGivenAt: new Date(),
        status: "active",
      },
      create: {
        visitorSessionId: parsed.data.visitorSessionId,
        customerName: parsed.data.customerName,
        customerPhone: normalizedPhone,
        consentGivenAt: new Date(),
        status: "active",
      },
      select: {
        id: true,
        visitorSessionId: true,
        customerName: true,
        customerPhone: true,
        status: true,
      },
    });

    return NextResponse.json({ conversation });
  } catch (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json(
        { error: "WhatsApp tables are missing. Run prisma db push and restart the app." },
        { status: 503 },
      );
    }
    throw error;
  }
}
