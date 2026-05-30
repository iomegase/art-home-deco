import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/security/auth";
import { logger } from "@/lib/logger";
import { listCacheProductIdsByFamily } from "@/server/repositories/shopcaisse-catalog.repository";
import { importShopcaisseProductsToCatalog } from "@/server/repositories/shopcaisse-product-import.repository";

const publishFamilyRequestSchema = z.object({
  familyId: z.string().min(1),
});

// The import request schema caps shopcaisseProductIds at 500, so publish a
// large category in batches rather than passing an unbounded array.
const IMPORT_BATCH_SIZE = 500;

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json().catch(() => null);
    const parsed = publishFamilyRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const productIds = await listCacheProductIdsByFamily(parsed.data.familyId);

    if (productIds.length === 0) {
      return NextResponse.json({ success: true, createdCount: 0, skippedCount: 0, linkedCount: 0 });
    }

    let createdCount = 0;
    let skippedCount = 0;
    let linkedCount = 0;
    let errorCount = 0;

    for (let offset = 0; offset < productIds.length; offset += IMPORT_BATCH_SIZE) {
      const batch = productIds.slice(offset, offset + IMPORT_BATCH_SIZE);
      const result = await importShopcaisseProductsToCatalog({
        mode: "selected",
        shopcaisseProductIds: batch,
        publishByDefault: false,
      });
      createdCount += result.createdCount;
      skippedCount += result.skippedCount;
      linkedCount += result.linkedCount;
      errorCount += result.errors.length;
    }

    revalidatePath("/admin/products");
    revalidatePath("/admin/shopcaisse/catalogue");

    await logger.integration("info", {
      provider: "shopcaisse",
      eventType: "catalog_publish_family",
      status: errorCount > 0 ? "partial" : "success",
      message: "Shopcaisse category published to draft catalog.",
      payload: {
        familyId: parsed.data.familyId,
        requested: productIds.length,
        createdCount,
        linkedCount,
        errors: errorCount,
      },
    });

    return NextResponse.json({
      success: errorCount === 0,
      createdCount,
      skippedCount,
      linkedCount,
    });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    const message = error instanceof Error ? error.message : "Impossible de publier la catégorie.";

    if (status !== 401) {
      await logger.integration("error", {
        provider: "shopcaisse",
        eventType: "catalog_publish_family",
        status: "failed",
        message,
        payload: { status },
      });
    }

    return NextResponse.json({ success: false, error: message }, { status });
  }
}
