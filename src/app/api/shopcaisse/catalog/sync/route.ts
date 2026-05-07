import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/security/auth";
import { logger } from "@/lib/logger";
import { syncShopcaisseCatalogCache } from "@/server/repositories/shopcaisse-catalog.repository";
import { getShopcaisseCatalogSnapshot } from "@/server/services/shopcaisse/client";
import { ShopcaisseConfigError, ShopcaisseResponseError } from "@/server/services/shopcaisse/errors";

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
      },
    });

    return NextResponse.json({
      success: true,
      createdCount: result.createdCount,
      updatedCount: result.updatedCount,
      skippedCount: result.skippedCount,
      errors: result.errors,
      syncedAt: result.syncedAt.toISOString(),
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
