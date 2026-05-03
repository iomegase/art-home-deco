"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/security/auth";
import { db } from "@/server/db/client";
import { deleteProductImage } from "@/server/services/product-image/delete-product-image";
import { reorderProductImages } from "@/server/services/product-image/reorder-product-images";
import { uploadProductImages } from "@/server/services/product-image/upload-product-images";

function redirectPaths(productId: string, productSlug?: string | null) {
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  if (productSlug) {
    revalidatePath(`/boutique/${productSlug}`);
  }
}

export async function uploadProductImagesAction(formData: FormData) {
  await requireAdmin();

  const productId = String(formData.get("productId") ?? "");
  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (!productId) {
    throw new Error("Produit introuvable.");
  }

  await uploadProductImages({ productId, files });

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });

  redirectPaths(productId, product?.slug);
}

export async function deleteProductImageAction(formData: FormData) {
  await requireAdmin();

  const imageId = String(formData.get("imageId") ?? "");

  if (!imageId) {
    throw new Error("Image introuvable.");
  }

  const image = await db.productImage.findUnique({
    where: { id: imageId },
    include: { product: { select: { slug: true } } },
  });

  if (!image) {
    throw new Error("Image produit introuvable.");
  }

  const productId = await deleteProductImage(imageId);
  redirectPaths(productId, image.product.slug);
}

export async function reorderProductImagesAction(formData: FormData) {
  await requireAdmin();

  const productId = String(formData.get("productId") ?? "");
  const imageId = String(formData.get("imageId") ?? "");
  const direction = String(formData.get("direction") ?? "");

  if (!productId || !imageId || !["up", "down"].includes(direction)) {
    throw new Error("Reordonnancement invalide.");
  }

  const images = await db.productImage.findMany({
    where: { productId },
    orderBy: { position: "asc" },
    include: { product: { select: { slug: true } } },
  });

  const index = images.findIndex((image) => image.id === imageId);

  if (index === -1) {
    throw new Error("Image introuvable.");
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (targetIndex < 0 || targetIndex >= images.length) {
    redirectPaths(productId, images[0]?.product.slug);
    return;
  }

  const reordered = [...images];
  const [moved] = reordered.splice(index, 1);
  reordered.splice(targetIndex, 0, moved);

  await reorderProductImages({
    productId,
    orderedImageIds: reordered.map((image) => image.id),
  });

  redirectPaths(productId, images[0]?.product.slug);
}

export async function updateProductImageAltAction(formData: FormData) {
  await requireAdmin();

  const imageId = String(formData.get("imageId") ?? "");
  const alt = String(formData.get("alt") ?? "").trim();

  if (!imageId) {
    throw new Error("Image introuvable.");
  }

  const image = await db.productImage.update({
    where: { id: imageId },
    data: { alt: alt || null },
    include: { product: { select: { id: true, slug: true } } },
  });

  redirectPaths(image.product.id, image.product.slug);
}
