import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/security/auth";
import { logger } from "@/lib/logger";
import { syncShopcaisseCatalogCache, syncShopcaisseCategories } from "@/server/repositories/shopcaisse-catalog.repository";
import { getShopcaisseCatalogSnapshot } from "@/server/services/shopcaisse/client";
import { ShopcaisseConfigError, ShopcaisseResponseError } from "@/server/services/shopcaisse/errors";

// Fetching the full Shopcaisse catalog (2000+ products + prices, paginated and
// sequential) takes ~20s before the DB writes even start. Vercel's default
// serverless timeout (10s Hobby / 15s Pro) kills the function mid-sync, leaving
// the cache empty -> the import list shows nothing. Give it the room it needs.
// NB: maxDuration > 10s requires a Vercel Pro plan (Hobby is capped at 10s).
export const runtime = "nodejs";
export const maxDuration = 300;

function resolveStatus(error: unknown) {
  if (error instanceof ShopcaisseResponseError && error.statusCode) {
    if ([401, 403, 404].includes(error.statusCode)) {
      return error.statusCode;
    }

    return 500;
  }

  return 500;
}

export async function POST() {
  try {
    await requireAdmin();

    const snapshot = await getShopcaisseCatalogSnapshot();
    const result = await syncShopcaisseCatalogCache(snapshot.items);
    const categoryResult = await syncShopcaisseCategories(snapshot.families);

    await logger.integration("info", {
      provider: "shopcaisse",
      eventType: "catalog_sync",
      status: "success",
      message: "Shopcaisse catalog cache synced successfully.",
      payload: {
        createdCount: result.createdCount,
        updatedCount: result.updatedCount,
        skippedCount: result.skippedCount,
        errors: result.errors.length,
        categoriesCreated: categoryResult.createdCount,
        categoriesAdopted: categoryResult.adoptedCount,
        categoriesUpdated: categoryResult.updatedCount,
      },
    });

    return NextResponse.json({
      success: true,
      createdCount: result.createdCount,
      updatedCount: result.updatedCount,
      skippedCount: result.skippedCount,
      errors: result.errors,
      syncedAt: result.syncedAt.toISOString(),
      categories: categoryResult,
    });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : resolveStatus(error);
    const message = error instanceof ShopcaisseConfigError
      ? error.message
      : error instanceof Error && error.message === "Unauthorized"
        ? "Unauthorized"
        : error instanceof Error
          ? error.message
          : "Shopcaisse catalog sync failed.";

    await logger.integration("error", {
      provider: "shopcaisse",
      eventType: "catalog_sync",
      status: "failed",
      message,
      payload: {
        status,
      },
    });

    return NextResponse.json(
      {
        success: false,
        createdCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        errors: [{ externalProductId: "unknown", message }].slice(0, 10),
        syncedAt: new Date().toISOString(),
      },
      { status },
    );
  }
}
