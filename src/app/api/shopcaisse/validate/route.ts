import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/security/auth";
import { ShopcaisseConfigError } from "@/server/services/shopcaisse/errors";
import { validateShopcaisseConnection } from "@/server/services/shopcaisse/client";

export async function GET() {
  try {
    await requireAdmin();

    const result = await validateShopcaisseConnection();
    const checkedAt = new Date().toISOString();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          status: result.status,
          message: result.message,
          companyId: null,
          storeId: null,
          posId: null,
          detectedResources: [],
          usefulPermissions: [],
          checkedAt,
        },
        { status: result.status },
      );
    }

    return NextResponse.json({
      success: true,
      status: 200,
      message: "Shopcaisse connection is valid.",
      companyId: result.companyId ?? null,
      storeId: result.storeId ?? null,
      posId: result.posId ?? null,
      detectedResources: result.detectedResources,
      usefulPermissions: result.usefulPermissions,
      checkedAt,
    });
  } catch (error) {
    const message = error instanceof ShopcaisseConfigError
      ? error.message
      : error instanceof Error && error.message === "Unauthorized"
        ? "Unauthorized"
        : "Shopcaisse validation failed.";
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;

    return NextResponse.json(
      {
        success: false,
        status,
        message,
        companyId: null,
        storeId: null,
        posId: null,
        detectedResources: [],
        usefulPermissions: [],
        checkedAt: new Date().toISOString(),
      },
      { status },
    );
  }
}
