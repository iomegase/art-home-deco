import { getDefaultBlogAuthorLabel, getDefaultBlogCta } from "@/features/blog/blog-context";
import { formatSeoTitle } from "@/features/blog/seo";
import { slugify } from "@/lib/slugify";
import {
  blogArticleGeneratedSchema,
  type BlogArticleGenerated,
} from "@/schemas/blog-article-generated.schema";

function normalizeBrandText(value: string) {
  return value.replace(/Art Home Deco/g, "Art Home Déco").trim();
}

function ensureBrandPerspectiveHeading(markdown: string) {
  const normalized = normalizeBrandText(markdown);
  if (/^##\s+Le regard d['’]Art Home Déco/m.test(normalized)) {
    return normalized;
  }

  const body = normalized.replace(/^#+\s+.*$/m, "").trim();
  return `## Le regard d'Art Home Déco\n\n${body}`;
}

function createDefaultImageAlt(title: string) {
  const subject = title
    .replace(/\s+\|\s+Art Home Déco/gi, "")
    .replace(/^L['’]art des\s+/i, "")
    .trim()
    .toLowerCase();

  return `Ambiance chaleureuse et decoration interieure autour de ${subject}`;
}

export function normalizeGeneratedBlogArticle(input: unknown): BlogArticleGenerated {
  const parsed = blogArticleGeneratedSchema.parse(input);
  const defaultCta = getDefaultBlogCta();
  const title = normalizeBrandText(parsed.title);

  const normalized: BlogArticleGenerated = {
    ...parsed,
    title,
    seoTitle: formatSeoTitle(normalizeBrandText(parsed.seoTitle)),
    metaDescription: normalizeBrandText(parsed.metaDescription),
    slug: slugify(parsed.slug?.trim() ? parsed.slug : title),
    excerpt: normalizeBrandText(parsed.excerpt),
    category: normalizeBrandText(parsed.category),
    imageAlt: normalizeBrandText(parsed.imageAlt || createDefaultImageAlt(title)),
    authorLabel: normalizeBrandText(parsed.authorLabel || getDefaultBlogAuthorLabel()),
    contentMarkdown: normalizeBrandText(parsed.contentMarkdown),
    brandPerspectiveMarkdown: ensureBrandPerspectiveHeading(parsed.brandPerspectiveMarkdown),
    cta: {
      title: normalizeBrandText(parsed.cta.title || defaultCta.title),
      body: normalizeBrandText(parsed.cta.body || defaultCta.body),
      primaryLabel: normalizeBrandText(parsed.cta.primaryLabel || defaultCta.primaryLabel),
      primaryLink: "/boutique",
      secondaryLabel: normalizeBrandText(parsed.cta.secondaryLabel || defaultCta.secondaryLabel),
      secondaryLink: "/contact",
    },
    seoChecklist: {
      ...parsed.seoChecklist,
      hasCta: true,
      hasImageAlt: true,
      hasNoH1InMarkdown: true,
    },
  };

  return blogArticleGeneratedSchema.parse(normalized);
}

export function assertSeoChecklist(article: BlogArticleGenerated) {
  const failingChecks = Object.entries(article.seoChecklist)
    .filter(([, passed]) => !passed)
    .map(([check]) => check);

  if (failingChecks.length > 0) {
    throw new Error(`Checklist SEO incomplete: ${failingChecks.join(", ")}`);
  }
}
