import { isIP } from "node:net";
import { db } from "@/server/db/client";
import { storeProductImage } from "./store-product-image";

const FORBIDDEN_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

function isPrivateIpv4(hostname: string) {
  const parts = hostname.split(".").map((part) => Number.parseInt(part, 10));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }

  return (
    parts[0] === 10 ||
    parts[0] === 127 ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    (parts[0] === 169 && parts[1] === 254)
  );
}

function isPrivateIpv6(hostname: string) {
  const normalized = hostname.toLowerCase();
  return normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:");
}

export function validateExternalImageUrl(rawUrl: string) {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("URL image invalide.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Seules les URLs http et https sont autorisees.");
  }

  const hostname = url.hostname.toLowerCase();
  if (FORBIDDEN_HOSTS.has(hostname)) {
    throw new Error("URL image interdite.");
  }

  const ipVersion = isIP(hostname);
  if ((ipVersion === 4 && isPrivateIpv4(hostname)) || (ipVersion === 6 && isPrivateIpv6(hostname))) {
    throw new Error("URL image sur reseau prive interdite.");
  }

  for (const sensitiveKey of ["token", "signature", "sig", "auth", "authorization", "x-amz-signature"]) {
    if (url.searchParams.has(sensitiveKey)) {
      throw new Error("URL image signee ou sensible interdite.");
    }
  }

  return url;
}

function pickFileName(url: URL, contentType: string) {
  const pathPart = url.pathname.split("/").filter(Boolean).pop();
  if (pathPart) {
    return pathPart;
  }

  if (contentType === "image/png") {
    return "image.png";
  }

  if (contentType === "image/webp") {
    return "image.webp";
  }

  if (contentType === "image/avif") {
    return "image.avif";
  }

  return "image.jpg";
}

export async function importProductImageFromUrl(input: {
  productId: string;
  imageUrl: string;
  alt?: string;
  source: "manual_url" | "supplier_csv";
  markValidated?: boolean;
}) {
  const url = validateExternalImageUrl(input.imageUrl);

  const product = await db.product.findUnique({
    where: { id: input.productId },
    include: { images: true },
  });

  if (!product) {
    throw new Error("Produit introuvable.");
  }

  const response = await fetch(url, {
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Telechargement image impossible (${response.status}).`);
  }

  const contentTypeHeader = response.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
  if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(contentTypeHeader)) {
    throw new Error(`Type MIME image refuse: ${contentTypeHeader || "inconnu"}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await storeProductImage({
    productId: product.id,
    buffer,
    contentType: contentTypeHeader,
    fileName: pickFileName(url, contentTypeHeader),
    alt: input.alt ?? product.imageAlt ?? product.title,
    source: input.source,
    status: input.source === "manual_url" ? "approved" : "pending_review",
    markValidated: input.markValidated ?? input.source === "manual_url",
  });
}
