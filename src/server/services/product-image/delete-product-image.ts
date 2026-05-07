import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/server/db/client";
import { getRequiredR2Config, getR2Client } from "@/server/services/storage/r2.client";

export async function deleteProductImage(productImageId: string) {
  const image = await db.productImage.findUnique({
    where: { id: productImageId },
  });

  if (!image) {
    throw new Error("Image produit introuvable.");
  }

  const r2 = getR2Client();
  const { bucketName } = getRequiredR2Config();

  if (!r2) {
    throw new Error("Cloudflare R2 is not configured.");
  }

  if (image.storageKey) {
    await r2.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: image.storageKey,
      }),
    );
  }

  await db.productImage.delete({
    where: { id: image.id },
  });

  const remainingImages = await db.productImage.findMany({
    where: { productId: image.productId },
    orderBy: { position: "asc" },
  });

  await Promise.all(
    remainingImages.map((remainingImage, index) =>
      db.productImage.update({
        where: { id: remainingImage.id },
        data: { position: index },
      }),
    ),
  );

  await db.product.update({
    where: { id: image.productId },
    data: remainingImages.length === 0
      ? {
          imageStatus: "missing",
          imageSource: "none",
          imageAlt: null,
          imageUpdatedAt: new Date(),
          imageValidatedAt: null,
        }
      : {},
  });

  return image.productId;
}
