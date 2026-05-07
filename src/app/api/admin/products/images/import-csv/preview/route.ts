import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/security/auth";
import { previewSupplierImagesCsv } from "@/server/services/product-image/import-supplier-images-csv";

const payloadSchema = z.object({
  csvContent: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = payloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid CSV payload", details: parsed.error.flatten() }, { status: 400 });
    }

    const preview = await previewSupplierImagesCsv(parsed.data.csvContent);
    return NextResponse.json({ success: true, ...preview });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Preview CSV impossible." }, { status });
  }
}
