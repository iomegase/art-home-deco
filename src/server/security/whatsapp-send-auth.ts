import { timingSafeEqual } from "node:crypto";
import { getEnv } from "@/server/env";
import { getAdminSession } from "@/server/security/auth";

function safeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function extractApiKey(request: Request) {
  const direct = request.headers.get("x-api-key") ?? request.headers.get("x-whatsapp-send-key");
  if (direct) {
    return direct.trim();
  }

  const authorization = request.headers.get("authorization");
  if (!authorization) {
    return null;
  }

  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? null;
}

export async function canSendWhatsAppTemplate(request: Request) {
  const env = getEnv();
  const apiKey = extractApiKey(request);

  if (env.WHATSAPP_SEND_API_KEY && apiKey && safeEquals(apiKey, env.WHATSAPP_SEND_API_KEY)) {
    return true;
  }

  const adminSession = await getAdminSession();
  return !!adminSession;
}

