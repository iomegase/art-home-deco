"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { productAiDraftSchema, productEditorSchema } from "@/schemas/forms/product-editor.schema";
import { productImportSchema } from "@/schemas/forms/product-import.schema";
import { createIntegrationEvent } from "@/server/repositories/integration.repository";
import {
  findProductForAdmin,
  updateProductAiDraft,
  updateProductForAdmin,
} from "@/server/repositories/admin-product.repository";
import { requireAdmin } from "@/server/security/auth";
import { importProductsCsvUseCase } from "@/server/use-cases/import-products-csv.use-case";
import { generateAiProductDraftUseCase } from "@/server/use-cases/generate-ai-product-draft.use-case";

function getTrimmedString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function importProductsCsvAction(formData: FormData) {
  const session = await requireAdmin();

  const uploadedFile = formData.get("csvFile");
  const csvText = getTrimmedString(formData, "csvContent");
  const fileText =
    uploadedFile instanceof File && uploadedFile.size > 0 ? await uploadedFile.text() : "";
  const batchLabel = getTrimmedString(formData, "batchLabel");
  const sourceFileName = uploadedFile instanceof File && uploadedFile.size > 0 ? uploadedFile.name : undefined;

  const input = productImportSchema.parse({
    csvContent: fileText || csvText,
    batchLabel: batchLabel || undefined,
  });

  const result = await importProductsCsvUseCase(input);
  const status = result.errors.length === 0 ? "success" : result.created || result.updated ? "partial" : "failed";
  const event = await createIntegrationEvent({
    provider: "catalog",
    eventType: "product_csv_import",
    status,
    targetType: "product",
    actorEmail: session.userId,
    batchLabel: input.batchLabel || undefined,
    message: `${result.created} crees, ${result.updated} mis a jour, ${result.errors.length} erreur(s).`,
    payloadJson: JSON.stringify({
      ...result,
      batchLabel: input.batchLabel || null,
      actorEmail: session.userId,
      sourceFileName: sourceFileName || null,
    }),
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products/new");

  const params = new URLSearchParams({ eventId: event.id });

  redirect(`/admin/products/new?${params.toString()}`);
}

export async function updateProductForAdminAction(formData: FormData) {
  await requireAdmin();

  const parsed = productEditorSchema.parse({
    id: getTrimmedString(formData, "id"),
    title: getTrimmedString(formData, "title"),
    slug: getTrimmedString(formData, "slug"),
    sku: getTrimmedString(formData, "sku"),
    barcode: getTrimmedString(formData, "barcode") || undefined,
    externalStockId: getTrimmedString(formData, "externalStockId") || undefined,
    priceCents: Number.parseInt(getTrimmedString(formData, "priceCents"), 10),
    stock: Number.parseInt(getTrimmedString(formData, "stock"), 10),
    shippingClass: getTrimmedString(formData, "shippingClass"),
    status: getTrimmedString(formData, "status"),
    shortDescription: getTrimmedString(formData, "shortDescription") || undefined,
    description: getTrimmedString(formData, "description") || undefined,
    seoTitle: getTrimmedString(formData, "seoTitle") || undefined,
    seoDescription: getTrimmedString(formData, "seoDescription") || undefined,
    imageUrl: getTrimmedString(formData, "imageUrl") || undefined,
    imageAlt: getTrimmedString(formData, "imageAlt") || undefined,
    pickupOnly: formData.get("pickupOnly") === "on",
    estimatedWeightGrams: Number.parseInt(getTrimmedString(formData, "estimatedWeightGrams"), 10),
    isFragile: formData.get("isFragile") === "on",
    categorySlugs: formData
      .getAll("categorySlugs")
      .map((value) => String(value).trim())
      .filter(Boolean),
  });

  await updateProductForAdmin(parsed);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${parsed.id}/edit`);
  revalidatePath(`/boutique/${parsed.slug}`);

  redirect(`/admin/products/${parsed.id}/edit?saved=1`);
}

export async function generateAiProductDraftAction(formData: FormData) {
  await requireAdmin();

  const parsed = productAiDraftSchema.parse({
    id: getTrimmedString(formData, "id"),
  });

  const product = await findProductForAdmin(parsed.id);

  if (!product) {
    throw new Error("Produit introuvable.");
  }

  const draft = generateAiProductDraftUseCase({
    title: product.title,
    category: product.categories[0]?.category.title,
    shippingClass: product.shippingClass,
    currentShortDescription: product.shortDescription,
    currentDescription: product.description,
  });

  await updateProductAiDraft({
    id: product.id,
    shortDescription: draft.shortDescription,
    description: draft.description,
    seoTitle: draft.seoTitle,
    seoDescription: draft.seoDescription,
    imageAlt: draft.imageAlt,
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${product.id}/edit`);
  revalidatePath(`/boutique/${product.slug}`);

  redirect(`/admin/products/${product.id}/edit?ai=1`);
}
