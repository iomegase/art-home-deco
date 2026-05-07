import { db } from "@/server/db/client";
import { storeProductImage } from "@/server/services/product-image/store-product-image";
import { PRODUCT_IMAGE_ALLOWED_MIME_TYPES, PRODUCT_IMAGE_MAX_FILE_SIZE_BYTES, PRODUCT_IMAGE_MAX_PER_PRODUCT } from "./product-image-types";

export async function uploadProductImages(input: {
  productId: string;
  files: File[];
}) {
  if (!input.files.length) {
    throw new Error("Aucun fichier image fourni.");
  }

  const product = await db.product.findUnique({
    where: { id: input.productId },
    include: {
      images: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!product) {
    throw new Error("Produit introuvable.");
  }

  if (product.images.length + input.files.length > PRODUCT_IMAGE_MAX_PER_PRODUCT) {
    throw new Error(`Maximum ${PRODUCT_IMAGE_MAX_PER_PRODUCT} images par produit.`);
  }

  for (const file of input.files) {
    if (!PRODUCT_IMAGE_ALLOWED_MIME_TYPES.has(file.type)) {
      throw new Error(`Format non autorise: ${file.type || file.name}`);
    }

    if (file.size > PRODUCT_IMAGE_MAX_FILE_SIZE_BYTES) {
      throw new Error(`Fichier trop lourd: ${file.name}`);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    await storeProductImage({
      productId: product.id,
      buffer,
      contentType: file.type,
      fileName: file.name,
      alt: product.title,
      source: "manual_upload",
      status: "manual",
      markValidated: false,
    });
  }

  return db.product.findUnique({
    where: { id: product.id },
    include: {
      images: {
        orderBy: { position: "asc" },
      },
    },
  });
}
