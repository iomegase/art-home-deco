import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getRequiredR2Config, getR2Client } from "@/server/services/storage/r2.client";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function buildHomeImageStorageKey(fileName: string) {
  const safeName = fileName.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
  return `site/home/${Date.now()}-${safeName}`;
}

export async function uploadHomeImage(file: File) {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`Format non autorise: ${file.type || file.name}`);
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`Fichier trop lourd: ${file.name}`);
  }

  const r2 = getR2Client();
  const { bucketName, publicBaseUrl } = getRequiredR2Config();

  if (!r2) {
    throw new Error("Cloudflare R2 is not configured.");
  }

  const storageKey = buildHomeImageStorageKey(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  await r2.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: storageKey,
      Body: buffer,
      ContentType: file.type,
    }),
  );

  return `${publicBaseUrl}/${storageKey}`;
}
