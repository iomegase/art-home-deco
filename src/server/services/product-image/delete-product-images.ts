import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getRequiredR2Config, getR2Client } from "@/server/services/storage/r2.client";

const DELETE_BATCH_SIZE = 1_000;

export async function deleteProductImageObjects(keys: string[]) {
  if (keys.length === 0) {
    return;
  }

  const r2 = getR2Client();
  const { bucketName } = getRequiredR2Config();

  if (!r2) {
    throw new Error("Cloudflare R2 is not configured.");
  }

  for (let start = 0; start < keys.length; start += DELETE_BATCH_SIZE) {
    const batch = keys.slice(start, start + DELETE_BATCH_SIZE);
    const result = await r2.send(
      new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
          Objects: batch.map((Key) => ({ Key })),
          Quiet: true,
        },
      }),
    );

    if (result.Errors && result.Errors.length > 0) {
      throw new Error(
        `La suppression de ${result.Errors.length} image(s) produit a échoué dans Cloudflare R2.`,
      );
    }
  }
}
