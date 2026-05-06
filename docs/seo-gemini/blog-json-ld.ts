import { SITE_URL, createCanonical, removeUndefinedDeep } from "./seo-utils";

type BlogJsonLdArticle = {
  slug: string;
  title: string;
  metaDescription?: string | null;
  excerpt?: string | null;
  imageUrl?: string | null;
  publishedAt?: string | Date | null;
  updatedAt?: string | Date | null;
};

function toIsoDate(value?: string | Date | null) {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  return value;
}

export function createBlogPostingJsonLd(article: BlogJsonLdArticle) {
  const canonical = createCanonical(article.slug);

  return removeUndefinedDeep({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    headline: article.title,
    description: article.metaDescription || article.excerpt,
    image: article.imageUrl ? [article.imageUrl] : undefined,
    datePublished: toIsoDate(article.publishedAt),
    dateModified: toIsoDate(article.updatedAt || article.publishedAt),
    author: {
      "@type": "Organization",
      name: "Art Home Déco",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Art Home Déco",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "96 rue du Mont Blanc",
        postalCode: "74170",
        addressLocality: "Saint-Gervais-les-Bains",
        addressRegion: "Haute-Savoie",
        addressCountry: "FR",
      },
    },
  });
}
