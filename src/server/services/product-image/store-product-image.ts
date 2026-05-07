import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/server/db/client";
import { getRequiredR2Config, getR2Client } from "@/server/services/storage/r2.client";
import { buildProductImageStorageKey } from "@/server/services/storage/r2.keys";
import {
  PRODUCT_IMAGE_ALLOWED_MIME_TYPES,
  PRODUCT_IMAGE_MAX_FILE_SIZE_BYTES,
  PRODUCT_IMAGE_MAX_PER_PRODUCT,
  type ProductImageSource,
  type ProductImageStatus,
} from "./product-image-types";

function extensionFromMimeType(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    default:
      return "bin";
  }
}

export async function storeProductImage(input: {
  productId: string;
  buffer: Buffer;
  contentType: string;
  fileName?: string;
  alt?: string | null;
  source: ProductImageSource;
  status: ProductImageStatus;
  markValidated?: boolean;
}) {
  if (!PRODUCT_IMAGE_ALLOWED_MIME_TYPES.has(input.contentType)) {
    throw new Error(`Format non autorise: ${input.contentType}`);
  }

  if (input.buffer.byteLength > PRODUCT_IMAGE_MAX_FILE_SIZE_BYTES) {
    throw new Error("Fichier image trop volumineux.");
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

  if (product.images.length >= PRODUCT_IMAGE_MAX_PER_PRODUCT) {
    throw new Error(`Maximum ${PRODUCT_IMAGE_MAX_PER_PRODUCT} images par produit.`);
  }

  const r2 = getR2Client();
  const { bucketName, publicBaseUrl } = getRequiredR2Config();

  if (!r2) {
    throw new Error("Cloudflare R2 is not configured.");
  }

  const storageKey = buildProductImageStorageKey({
    productId: product.id,
    fileName: input.fileName ?? `image.${extensionFromMimeType(input.contentType)}`,
  });

  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: storageKey,
        Body: input.buffer,
        ContentType: input.contentType,
      }),
    );

    const image = await db.productImage.create({
      data: {
        productId: product.id,
        url: `${publicBaseUrl}/${storageKey}`,
        alt: input.alt ?? product.title,
        position: product.images.length,
        storageProvider: "r2",
        storageKey,
        mimeType: input.contentType,
        sizeBytes: input.buffer.byteLength,
      },
    });

    await db.product.update({
      where: { id: product.id },
      data: {
        imageStatus: input.status,
        imageSource: input.source,
        imageAlt: input.alt ?? product.title,
        imageUpdatedAt: new Date(),
        imageValidatedAt: input.markValidated ? new Date() : undefined,
      },
    });

    return image;
  } catch (error) {
    await r2.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: storageKey,
      }),
    ).catch(() => undefined);
    throw error;
  }
}
