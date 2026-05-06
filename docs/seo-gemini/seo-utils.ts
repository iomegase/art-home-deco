export const BRAND_NAME = "Art Home Déco";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export function formatSeoTitle(title: string) {
  const cleanTitle = normalizeBrandText(title)
    .replace(/\s+\|\s+Art Home Déco/gi, "")
    .replace(/\s+\|\s+Art Home Deco/gi, "")
    .trim();

  return `${cleanTitle} | ${BRAND_NAME}`;
}

export function normalizeBrandText(value: string) {
  return value.replace(/Art Home Deco/g, BRAND_NAME);
}

export function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function createCanonical(slug: string) {
  return `${SITE_URL}/blog/${slug}`;
}

export function createDefaultImageAlt(title: string) {
  return `Illustration d’un article Art Home Déco sur ${title}`;
}

export function removeUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(removeUndefinedDeep).filter((item) => item !== undefined) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .map(([key, entryValue]) => [key, removeUndefinedDeep(entryValue)])
    ) as T;
  }

  return value;
}
