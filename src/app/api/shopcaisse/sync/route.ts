import { NextResponse } from "next/server";
import { syncShopcaisseStock } from "@/server/services/shopcaisse/stock";
import { requireAdmin } from "@/server/security/auth";

export async function POST() {
  await requireAdmin();

  try {
    await syncShopcaisseStock();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Shopcaisse sync failed.";
    return NextResponse.json(
      { ok: false, error: message },
      { status: message.includes("documented outbound items endpoint") ? 501 : 500 },
    );
  }
}
