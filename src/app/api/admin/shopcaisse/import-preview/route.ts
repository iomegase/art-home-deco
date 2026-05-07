import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/security/auth";
import { logger } from "@/lib/logger";
import { getShopcaisseProductImportPreview } from "@/server/repositories/shopcaisse-product-import.repository";
import { shopcaisseImportPreviewQuerySchema } from "@/schemas/api/shopcaisse-import.schema";

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const url = new URL(request.url);
    const parsed = shopcaisseImportPreviewQuerySchema.parse({
      familyName: url.searchParams.get("familyName") ?? undefined,
      familyNames: url.searchParams.getAll("familyNames"),
      q: url.searchParams.get("q") ?? undefined,
      hasStock: url.searchParams.get("hasStock") ?? undefined,
      hasPrice: url.searchParams.get("hasPrice") ?? undefined,
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    });

    const preview = await getShopcaisseProductImportPreview(parsed);
    const checkedAt = new Date().toISOString();

    await logger.integration("info", {
      provider: "shopcaisse",
      eventType: "catalog_import_preview",
      status: "success",
      message: "Shopcaisse import preview fetched successfully.",
      payload: {
        totalCacheItems: preview.totalCacheItems,
        importableCount: preview.importableCount,
        alreadyLinkedCount: preview.alreadyLinkedCount,
        missingPriceCount: preview.missingPriceCount,
        missingStockCount: preview.missingStockCount,
        missingImageCount: preview.missingImageCount,
        selectedFamily: preview.selectedFamily,
        selectedFamilies: preview.selectedFamilies,
      },
    });

    return NextResponse.json({
      success: true,
      availableFamilies: preview.availableFamilies,
      familyStats: preview.familyStats,
      selectedFamily: preview.selectedFamily,
      selectedFamilies: preview.selectedFamilies,
      totalCacheItems: preview.totalCacheItems,
      importableCount: preview.importableCount,
      alreadyLinkedCount: preview.alreadyLinkedCount,
      missingPriceCount: preview.missingPriceCount,
      missingStockCount: preview.missingStockCount,
      missingImageCount: preview.missingImageCount,
      sampleItems: preview.sampleItems,
      page: preview.page,
      limit: preview.limit,
      totalPages: preview.totalPages,
      q: preview.query,
      hasStock: preview.hasStock,
      hasPrice: preview.hasPrice,
      checkedAt,
    });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    const message = error instanceof Error ? error.message : "Impossible de previsualiser l'import Shopcaisse.";

    await logger.integration("error", {
      provider: "shopcaisse",
      eventType: "catalog_import_preview",
      status: "failed",
      message,
      payload: { status },
    });

    return NextResponse.json(
      {
        success: false,
        totalCacheItems: 0,
        availableFamilies: [],
        familyStats: [],
        selectedFamily: null,
        selectedFamilies: [],
        importableCount: 0,
        alreadyLinkedCount: 0,
        missingPriceCount: 0,
        missingStockCount: 0,
        missingImageCount: 0,
        sampleItems: [],
        page: 1,
        limit: 10,
        totalPages: 1,
        q: null,
        hasStock: null,
        hasPrice: null,
        checkedAt: new Date().toISOString(),
        message,
      },
      { status },
    );
  }
}
