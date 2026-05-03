import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { getEnv } from "@/server/env";
import { checkShopcaisseWebhookRateLimit } from "@/server/services/shopcaisse/rate-limit";
import { getShopcaisseWebhookSignatureHeaderName, verifyShopcaisseWebhookSignature } from "@/server/services/shopcaisse/signature";
import { handleShopcaisseWebhook, type ShopcaisseWebhookPayload } from "@/server/services/shopcaisse/webhook";

export async function POST(request: Request) {
  const env = getEnv();

  if (!env.SHOPCAISSE_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, error: "EasyShop webhook secret is not configured." }, { status: 503 });
  }

  const rawBody = await request.text();
  const signatureHeader = getShopcaisseWebhookSignatureHeaderName();
  const providedSignature = request.headers.get(signatureHeader);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimit = checkShopcaisseWebhookRateLimit(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json({ ok: false, error: "Webhook rate limit exceeded." }, { status: 429 });
  }

  if (!verifyShopcaisseWebhookSignature({ payload: rawBody, providedSignature })) {
    await logger.integration("warn", {
      provider: "shopcaisse",
      eventType: "webhook_received",
      status: "rejected",
      message: "EasyShop webhook rejected: invalid HMAC signature.",
      payload: { signatureHeader },
    });

    return NextResponse.json({ ok: false, error: "Invalid webhook signature." }, { status: 401 });
  }

  let payload: ShopcaisseWebhookPayload;

  try {
    payload = JSON.parse(rawBody) as ShopcaisseWebhookPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const result = await handleShopcaisseWebhook({ payload, rawBody });
  return NextResponse.json(result, { status: result.status === "processed" ? 200 : 202 });
}
