import { getEnv } from "@/server/env";

type SendTemplateInput = {
  to: string;
  templateName: string;
  languageCode: string;
  components?: Array<Record<string, unknown>>;
};

function normalizeRecipient(input: string) {
  return input.replace(/\D/g, "");
}

export async function sendWhatsAppTemplate(input: SendTemplateInput) {
  const env = getEnv();

  if (!env.WHATSAPP_ACCESS_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error("WhatsApp API is not configured.");
  }

  const to = normalizeRecipient(input.to);
  if (!to) {
    throw new Error("Invalid recipient phone number.");
  }

  const response = await fetch(
    `https://graph.facebook.com/v22.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: input.templateName,
          language: { code: input.languageCode },
          components: input.components ?? [],
        },
      }),
    },
  );

  const payload = (await response.json().catch(() => null)) as
    | {
        messages?: Array<{ id?: string }>;
        error?: { message?: string };
      }
    | null;

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "WhatsApp template send failed.");
  }

  return payload;
}

