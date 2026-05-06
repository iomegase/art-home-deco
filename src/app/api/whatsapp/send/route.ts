import { NextResponse } from "next/server";
import { z } from "zod";
import { sendWhatsAppTemplate } from "@/lib/whatsapp";
import { canSendWhatsAppTemplate } from "@/server/security/whatsapp-send-auth";

const sendTemplateSchema = z.object({
  to: z.string().trim().min(8),
  templateName: z.string().trim().min(1).default("hello_world"),
  languageCode: z.string().trim().min(2).default("en_US"),
});

export async function POST(request: Request) {
  try {
    const authorized = await canSendWhatsAppTemplate(request);
    if (!authorized) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = sendTemplateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await sendWhatsAppTemplate({
      to: parsed.data.to,
      templateName: parsed.data.templateName,
      languageCode: parsed.data.languageCode,
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    console.error("WhatsApp send error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
