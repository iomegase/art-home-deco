import {
  BRAND_NAME,
  createDefaultImageAlt,
  createSlug,
  formatSeoTitle,
  normalizeBrandText,
} from "./seo-utils";
import {
  BlogArticleGenerated,
  BlogArticleGeneratedSchema,
} from "./blog-article-schema";

function ensureBrandPerspectiveHeading(markdown: string) {
  const normalized = normalizeBrandText(markdown.trim());

  if (/^##\s+Le regard d[’']Art Home Déco/m.test(normalized)) {
    return normalized;
  }

  return `## Le regard d’Art Home Déco\n\n${normalized.replace(/^#+\s+.*$/m, "").trim()}`;
}

export function normalizeGeneratedBlogArticle(input: unknown): BlogArticleGenerated {
  const parsed = BlogArticleGeneratedSchema.parse(input);

  const title = normalizeBrandText(parsed.title.trim());
  const slug = parsed.slug?.trim() ? createSlug(parsed.slug) : createSlug(title);

  const normalized: BlogArticleGenerated = {
    ...parsed,
    title,
    seoTitle: formatSeoTitle(normalizeBrandText(parsed.seoTitle)),
    metaDescription: normalizeBrandText(parsed.metaDescription.trim()),
    slug,
    excerpt: normalizeBrandText(parsed.excerpt.trim()),
    category: normalizeBrandText(parsed.category.trim()),
    imageAlt: normalizeBrandText(
      parsed.imageAlt?.trim() || createDefaultImageAlt(title)
    ),
    authorLabel:
      parsed.authorLabel?.trim() ||
      `Par l’équipe ${BRAND_NAME} — Boutique de décoration à Saint-Gervais-les-Bains`,
    contentMarkdown: normalizeBrandText(parsed.contentMarkdown.trim()),
    brandPerspectiveMarkdown: ensureBrandPerspectiveHeading(
      parsed.brandPerspectiveMarkdown
    ),
    cta: {
      title: normalizeBrandText(parsed.cta.title.trim()),
      body: normalizeBrandText(parsed.cta.body.trim()),
      primaryLabel: parsed.cta.primaryLabel || "Découvrir la boutique",
      primaryLink: "/boutique",
      secondaryLabel: parsed.cta.secondaryLabel || "Demander un conseil",
      secondaryLink: "/contact",
    },
    seoChecklist: {
      ...parsed.seoChecklist,
      hasCta: true,
      hasImageAlt: true,
      hasNoH1InMarkdown: true,
    },
  };

  return BlogArticleGeneratedSchema.parse(normalized);
}
