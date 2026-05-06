import type { Metadata } from "next";
import { BLOG_IMAGE_FALLBACK_URL, defaultBlogContext } from "@/features/blog/blog-context";
import { normalizeBlogImageUrl } from "@/features/blog/image-url";
import { getSiteUrl } from "@/lib/site-url";

type BlogSeoInput = {
  slug: string;
  title: string;
  seoTitle: string | null;
  excerpt: string | null;
  seoDescription: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  category: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
};

const BRAND_NAME = defaultBlogContext.brandName;

function normalizeBrandSpelling(value: string) {
  return value.replace(/Art Home Deco/g, BRAND_NAME);
}

function isBrandSegment(value: string) {
  return normalizeBrandSpelling(value).trim() === BRAND_NAME;
}

export function formatSeoTitle(title: string) {
  const normalized = normalizeBrandSpelling(title).trim();
  const parts = normalized
    .split("|")
    .map((part) => normalizeBrandSpelling(part).trim())
    .filter(Boolean);
  const contentParts = parts.filter((part) => !isBrandSegment(part));

  if (parts.some(isBrandSegment)) {
    const baseTitle = contentParts.join(" | ");
    return baseTitle ? `${baseTitle} | ${BRAND_NAME}` : BRAND_NAME;
  }

  if (normalized.includes(BRAND_NAME)) {
    return normalized;
  }

  if (!normalized) {
    return BRAND_NAME;
  }

  return `${normalized} | ${BRAND_NAME}`;
}

export function buildBlogImageAlt(post: Pick<BlogSeoInput, "title" | "imageAlt">) {
  return post.imageAlt?.trim() || `Illustration de l'article : ${post.title}`;
}

export function removeUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => removeUndefinedDeep(item))
      .filter((item) => item !== undefined) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined && entry !== null)
        .map(([key, entry]) => [key, removeUndefinedDeep(entry)]),
    ) as T;
  }

  return value;
}

export function stringifyJsonLd(value: unknown) {
  return JSON.stringify(removeUndefinedDeep(value)).replace(/</g, "\\u003c");
}

export function buildBlogMetadata(post: BlogSeoInput): Metadata {
  const siteUrl = getSiteUrl();
  const title = formatSeoTitle(post.seoTitle ?? post.title);
  const description = post.seoDescription ?? post.excerpt ?? undefined;
  const imageUrl = normalizeBlogImageUrl(post.imageUrl, BLOG_IMAGE_FALLBACK_URL);

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: `${siteUrl}/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl, alt: buildBlogImageAlt(post) }] : undefined,
      type: "article",
      url: `${siteUrl}/blog/${post.slug}`,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [{ url: imageUrl, alt: buildBlogImageAlt(post) }] : undefined,
    },
  };
}

export function buildBlogArticleJsonLd(post: BlogSeoInput) {
  const siteUrl = getSiteUrl();
  const articleUrl = `${siteUrl}/blog/${post.slug}`;
  const imageUrl = normalizeBlogImageUrl(post.imageUrl, BLOG_IMAGE_FALLBACK_URL);

  return removeUndefinedDeep({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    headline: post.title,
    inLanguage: "fr-FR",
    articleSection: post.category ?? undefined,
    description: post.seoDescription ?? post.excerpt,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: BRAND_NAME,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: BRAND_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "96 rue du Mont Blanc",
        postalCode: "74170",
        addressLocality: defaultBlogContext.city,
        addressRegion: defaultBlogContext.region,
        addressCountry: "FR",
      },
    },
  });
}

export function buildBlogBreadcrumbJsonLd(post: Pick<BlogSeoInput, "slug" | "title">) {
  const siteUrl = getSiteUrl();
  const articleUrl = `${siteUrl}/blog/${post.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Journal",
        item: `${siteUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: articleUrl,
      },
    ],
  };
}
