import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/security/auth";
import { logger } from "@/lib/logger";
import { productIdsRequestSchema } from "@/schemas/api/product-publication.schema";
import { setProductsStatus } from "@/server/repositories/product-publication.repository";

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json().catch(() => null);
    const parsed = productIdsRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await setProductsStatus(parsed.data.productIds, "active");

    revalidatePath("/admin/products");
    revalidatePath("/admin/shopcaisse/catalogue");
    revalidatePath("/boutique");
    revalidatePath("/");

    await logger.integration("info", {
      provider: "shopcaisse",
      eventType: "catalog_activate_products",
      status: "success",
      message: "Shopcaisse curated products activated.",
      payload: { requested: parsed.data.productIds.length, updated: result.count },
    });

    return NextResponse.json({ success: true, updated: result.count });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    const message = error instanceof Error ? error.message : "Impossible d'activer les produits.";

    if (status !== 401) {
      await logger.integration("error", {
        provider: "shopcaisse",
        eventType: "catalog_activate_products",
        status: "failed",
        message,
        payload: { status },
      });
    }

    return NextResponse.json({ success: false, error: message }, { status });
  }
}
