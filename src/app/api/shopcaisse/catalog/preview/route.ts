import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/security/auth";
import { logger } from "@/lib/logger";
import { ShopcaisseConfigError, ShopcaisseResponseError } from "@/server/services/shopcaisse/errors";
import { getShopcaisseCatalogSnapshot } from "@/server/services/shopcaisse/client";

// This route also fetches the full Shopcaisse catalog live (~20s), so it needs
// the same extended timeout as the sync route. See the note there.
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

export async function GET() {
  try {
    await requireAdmin();

    const snapshot = await getShopcaisseCatalogSnapshot();
    const checkedAt = new Date().toISOString();

    await logger.integration("info", {
      provider: "shopcaisse",
      eventType: "catalog_preview",
      status: "success",
      message: "Shopcaisse catalog preview fetched successfully.",
      payload: {
        productsCount: snapshot.products.length,
        pricesCount: snapshot.prices.length,
        stocksCount: snapshot.stocks.length,
      },
    });

    return NextResponse.json({
      success: true,
      productsCount: snapshot.products.length,
      pricesCount: snapshot.prices.length,
      stocksCount: snapshot.stocks.length,
      sampleItems: snapshot.items.slice(0, 5).map((item) => ({
        externalProductId: item.externalProductId,
        externalVariantId: item.externalVariantId ?? null,
        name: item.name,
        sku: item.sku ?? null,
        barcode: item.barcode ?? null,
        priceCents: item.priceCents ?? null,
        currency: item.currency ?? null,
        stockQuantity: item.stockQuantity ?? null,
        familyName: item.familyName ?? null,
      })),
      checkedAt,
    });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : resolveStatus(error);
    const message = error instanceof ShopcaisseConfigError
      ? error.message
      : error instanceof Error && error.message === "Unauthorized"
        ? "Unauthorized"
        : error instanceof Error
          ? error.message
          : "Shopcaisse catalog preview failed.";

    await logger.integration("error", {
      provider: "shopcaisse",
      eventType: "catalog_preview",
      status: "failed",
      message,
      payload: {
        status,
      },
    });

    return NextResponse.json(
      {
        success: false,
        productsCount: 0,
        pricesCount: 0,
        stocksCount: 0,
        sampleItems: [],
        checkedAt: new Date().toISOString(),
        message,
      },
      { status },
    );
  }
}
