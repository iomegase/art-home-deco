"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/security/auth";
import { syncShopcaisseStock } from "@/server/services/shopcaisse/stock";

export async function runShopcaisseSyncAction() {
  await requireAdmin();
  await syncShopcaisseStock();
  revalidatePath("/admin/sync/shopcaisse");
  revalidatePath("/admin/settings/shopcaisse");
}
