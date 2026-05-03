import { db } from "@/server/db/client";

export async function reorderProductImages(input: {
  productId: string;
  orderedImageIds: string[];
}) {
  const images = await db.productImage.findMany({
    where: { productId: input.productId },
    orderBy: { position: "asc" },
  });

  const imageIds = new Set(images.map((image) => image.id));

  if (
    input.orderedImageIds.length !== images.length ||
    input.orderedImageIds.some((imageId) => !imageIds.has(imageId))
  ) {
    throw new Error("Nouvel ordre d'images invalide.");
  }

  await Promise.all(
    input.orderedImageIds.map((imageId, index) =>
      db.productImage.update({
        where: { id: imageId },
        data: { position: index },
      }),
    ),
  );

  return db.productImage.findMany({
    where: { productId: input.productId },
    orderBy: { position: "asc" },
  });
}
