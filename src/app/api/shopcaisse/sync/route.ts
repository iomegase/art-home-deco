import { NextResponse } from "next/server";
import { syncShopcaisseStock } from "@/server/services/shopcaisse/stock";
import { requireAdmin } from "@/server/security/auth";

export async function POST() {
  await requireAdmin();

  try {
    const result = await syncShopcaisseStock();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Shopcaisse sync failed." },
      { status: 500 },
    );
  }
}
