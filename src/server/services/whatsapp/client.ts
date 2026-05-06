import { logger } from "@/lib/logger";
import { getEnv } from "@/server/env";

type SendTextInput = {
  to: string;
  body: string;
};

type SendTextResult = {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
};

type WhatsAppGraphError = {
  message?: string;
  code?: number;
  error_subcode?: number;
};

function formatWhatsAppError(error?: WhatsAppGraphError) {
  if (!error) {
    return "WhatsApp send failed.";
  }

  if (error.code === 190 && error.error_subcode === 463) {
    return "Le token WhatsApp Business a expiré. Renouvelez WHATSAPP_ACCESS_TOKEN puis redémarrez l'application.";
  }

  if (error.code === 190) {
    return "Token WhatsApp Business invalide. Vérifiez WHATSAPP_ACCESS_TOKEN.";
  }

  return error.message ?? "WhatsApp send failed.";
}

export async function sendWhatsAppTextMessage(input: SendTextInput): Promise<SendTextResult> {
  const env = getEnv();

  if (!env.WHATSAPP_ACCESS_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) {
    return {
      ok: false,
      error: "WhatsApp API is not configured.",
    };
  }

  const to = input.to.startsWith("+") ? input.to.slice(1) : input.to;
  const url = `https://graph.facebook.com/v22.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: input.body },
      }),
    });

    const payload = (await response.json()) as {
      messages?: Array<{ id?: string }>;
      error?: WhatsAppGraphError;
    };

    if (!response.ok) {
      const errorMessage = formatWhatsAppError(payload.error);

      await logger.integration("warn", {
        provider: "whatsapp",
        eventType: "send_message",
        status: "failed",
        message: errorMessage,
        payload,
      });

      return {
        ok: false,
        error: errorMessage,
      };
    }

    return {
      ok: true,
      providerMessageId: payload.messages?.[0]?.id,
    };
  } catch (error) {
    await logger.integration("error", {
      provider: "whatsapp",
      eventType: "send_message",
      status: "failed",
      message: "WhatsApp send failed (network error).",
      payload: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return {
      ok: false,
      error: "WhatsApp send failed (network error).",
    };
  }
}
