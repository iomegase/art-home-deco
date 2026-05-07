import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/security/auth";
import { logger } from "@/lib/logger";
import { shopcaisseImportProductsRequestSchema } from "@/schemas/api/shopcaisse-import.schema";
import { importShopcaisseProductsToCatalog } from "@/server/repositories/shopcaisse-product-import.repository";

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json().catch(() => null);
    const parsed = shopcaisseImportProductsRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Shopcaisse import payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const result = await importShopcaisseProductsToCatalog(parsed.data);

    revalidatePath("/admin/products");
    revalidatePath("/admin/settings/shopcaisse");
    revalidatePath("/boutique");

    await logger.integration("info", {
      provider: "shopcaisse",
      eventType: "catalog_import_products",
      status: result.errors.length > 0 ? "partial" : "success",
      message: "Shopcaisse products imported into storefront catalog.",
      payload: {
        mode: parsed.data.mode,
        publishByDefault: parsed.data.publishByDefault,
        requestedIds: parsed.data.shopcaisseProductIds?.length ?? 0,
        requestedFamilies: parsed.data.familyNames?.length ?? 0,
        createdCount: result.createdCount,
        skippedCount: result.skippedCount,
        linkedCount: result.linkedCount,
        errors: result.errors.length,
      },
    });

    return NextResponse.json({
      success: result.errors.length === 0,
      createdCount: result.createdCount,
      skippedCount: result.skippedCount,
      linkedCount: result.linkedCount,
      errors: result.errors,
      importedAt: result.importedAt.toISOString(),
    });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    const message = error instanceof Error ? error.message : "Impossible d'importer les produits Shopcaisse.";

    await logger.integration("error", {
      provider: "shopcaisse",
      eventType: "catalog_import_products",
      status: "failed",
      message,
      payload: { status },
    });

    return NextResponse.json(
      {
        success: false,
        createdCount: 0,
        skippedCount: 0,
        linkedCount: 0,
        errors: [{ shopcaisseProductId: "unknown", message }],
        importedAt: new Date().toISOString(),
      },
      { status },
    );
  }
}
