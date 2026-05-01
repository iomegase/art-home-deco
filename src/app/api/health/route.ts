import { NextResponse } from "next/server";
import { getEnv } from "@/server/env";

export async function GET() {
  const env = getEnv();

  return NextResponse.json({
    ok: true,
    service: "art-home-deco",
    integrations: {
      stripe: Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET),
      resend: Boolean(env.RESEND_API_KEY && env.EMAIL_FROM),
      shopcaisse: Boolean(env.SHOPCAISSE_API_KEY && env.SHOPCAISSE_STOCK_SYNC_URL),
    },
  });
}
