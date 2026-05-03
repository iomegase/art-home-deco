import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/security/auth";

const template = [
  [
    "title",
    "slug",
    "sku",
    "barcode",
    "externalStockId",
    "priceCents",
    "stock",
    "category",
    "categories",
    "shippingClass",
    "pickupOnly",
    "estimatedWeightGrams",
    "isFragile",
    "status",
    "shortDescription",
    "description",
    "imageUrl",
    "imageAlt",
    "seoTitle",
    "seoDescription",
  ].join(","),
  [
    "Vase Brut Atelier",
    "vase-brut-atelier",
    "VASE-BRUT-001",
    "376000000001",
    "SC-1001",
    "6900",
    "8",
    "ceramiques",
    "ceramiques|nouveautes",
    "M",
    "false",
    "1200",
    "true",
    "draft",
    "Vase decoratif texture brute",
    "Brouillon long a relire avant publication",
    "https://images.unsplash.com/photo-1517705008128-361805f42e86",
    "vase brut atelier",
    "Vase Brut Atelier | Art Home Deco",
    "Brouillon SEO a valider avant mise en ligne",
  ].join(","),
].join("\n");

export async function GET() {
  await requireAdmin();

  return new NextResponse(template, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="product-import-template.csv"',
    },
  });
}
