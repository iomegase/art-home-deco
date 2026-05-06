import { PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/server/db/client";
import { getR2Client, getRequiredR2Config } from "@/server/services/storage/r2.client";
import { buildBlogImageStorageKey } from "@/server/services/storage/r2.keys";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function uploadBlogImage(input: {
  postId: string;
  file: File;
}) {
  const post = await db.blogPost.findUnique({
    where: { id: input.postId },
    select: { id: true },
  });

  if (!post) {
    throw new Error("Article introuvable.");
  }

  if (!ALLOWED_MIME_TYPES.has(input.file.type)) {
    throw new Error(`Format non autorise: ${input.file.type || input.file.name}`);
  }

  if (input.file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`Fichier trop lourd: ${input.file.name}`);
  }

  const r2 = getR2Client();
  const { bucketName, publicBaseUrl } = getRequiredR2Config();

  if (!r2) {
    throw new Error("Cloudflare R2 is not configured.");
  }

  const storageKey = buildBlogImageStorageKey({
    postId: post.id,
    fileName: input.file.name,
  });
  const buffer = Buffer.from(await input.file.arrayBuffer());

  await r2.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: storageKey,
      Body: buffer,
      ContentType: input.file.type,
    }),
  );

  return `${publicBaseUrl}/${storageKey}`;
}
