import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/security/auth";
import { applySupplierImagesCsv } from "@/server/services/product-image/import-supplier-images-csv";

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

    const result = await applySupplierImagesCsv(parsed.data.csvContent);
    revalidatePath("/admin/products");
    revalidatePath("/admin/products/missing-images");

    return NextResponse.json({ success: result.errors.length === 0, ...result });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Import CSV impossible." }, { status });
  }
}
