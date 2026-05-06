import { BLOG_IMAGE_FALLBACK_URL } from "@/features/blog/blog-context";

export function normalizeBlogImageUrl(src: string | null | undefined, fallbackSrc = BLOG_IMAGE_FALLBACK_URL): string {
  const value = src?.trim();
  if (!value) {
    return fallbackSrc;
  }

  const protocolStarts: number[] = [];
  for (let index = value.indexOf("http"); index !== -1; index = value.indexOf("http", index + 4)) {
    protocolStarts.push(index);
  }

  const candidates = protocolStarts.length > 0 ? protocolStarts.map((index) => value.slice(index)) : [value];
  for (const rawCandidate of candidates) {
    const candidate = rawCandidate.replace(/[)\],.;]+$/g, "");
    try {
      const parsed = new URL(candidate);
      if ((parsed.protocol === "http:" || parsed.protocol === "https:") && parsed.hostname.includes(".") && !parsed.hostname.includes("http")) {
        return parsed.toString();
      }
    } catch {
      continue;
    }
  }

  return fallbackSrc;
}
