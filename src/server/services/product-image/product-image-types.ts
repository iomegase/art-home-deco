export const PRODUCT_IMAGE_ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export const PRODUCT_IMAGE_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const PRODUCT_IMAGE_MAX_PER_PRODUCT = 6;

export type ProductImageStatus = "missing" | "manual" | "approved" | "pending_review" | "ignored";
export type ProductImageSource = "manual_upload" | "manual_url" | "supplier_csv" | "shopcaisse_import" | "none";
