import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/server/db/client";
import { getRequiredR2Config, getR2Client } from "@/server/services/storage/r2.client";
import { buildProductImageStorageKey } from "@/server/services/storage/r2.keys";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES_PER_PRODUCT = 6;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

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

  if (product.images.length + input.files.length > MAX_IMAGES_PER_PRODUCT) {
    throw new Error(`Maximum ${MAX_IMAGES_PER_PRODUCT} images par produit.`);
  }

  const r2 = getR2Client();
  const { bucketName, publicBaseUrl } = getRequiredR2Config();

  if (!r2) {
    throw new Error("Cloudflare R2 is not configured.");
  }

  const createdImageIds: string[] = [];
  const createdStorageKeys: string[] = [];

  try {
    for (const [index, file] of input.files.entries()) {
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        throw new Error(`Format non autorise: ${file.type || file.name}`);
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(`Fichier trop lourd: ${file.name}`);
      }

      const storageKey = buildProductImageStorageKey({
        productId: product.id,
        fileName: file.name,
      });

      const buffer = Buffer.from(await file.arrayBuffer());

      await r2.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: storageKey,
          Body: buffer,
          ContentType: file.type,
        }),
      );

      createdStorageKeys.push(storageKey);

      const image = await db.productImage.create({
        data: {
          productId: product.id,
          url: `${publicBaseUrl}/${storageKey}`,
          alt: product.title,
          position: product.images.length + index,
          storageProvider: "r2",
          storageKey,
          mimeType: file.type,
          sizeBytes: file.size,
        },
      });

      createdImageIds.push(image.id);
    }

    return db.product.findUnique({
      where: { id: product.id },
      include: {
        images: {
          orderBy: { position: "asc" },
        },
      },
    });
  } catch (error) {
    if (createdImageIds.length > 0) {
      await db.productImage.deleteMany({
        where: { id: { in: createdImageIds } },
      });
    }

    await Promise.all(
      createdStorageKeys.map((storageKey) =>
        r2.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: storageKey,
          }),
        ),
      ),
    );

    throw error;
  }
}
