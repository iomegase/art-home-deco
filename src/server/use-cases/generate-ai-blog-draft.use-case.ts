import type { AiBlogDraftInput } from "@/schemas/forms/ai-blog-draft.schema";
import { BLOG_IMAGE_FALLBACK_URL } from "@/features/blog/blog-context";
import { generateBlogArticle } from "@/features/ai/server/generate-blog-article";
import { isGeminiConfigured } from "@/server/services/ai/gemini";

export type AiBlogDraft = {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  imageUrl?: string;
  imageAlt: string;
  authorLabel: string;
  brandPerspectiveMarkdown: string;
  ctaTitle: string;
  ctaBody: string;
  ctaPrimaryLabel: string;
  ctaPrimaryLink: "/boutique";
  ctaSecondaryLabel: string;
  ctaSecondaryLink: "/contact";
  generatedWithAI: true;
  reviewedByHuman: false;
};

export class AiBlogDraftGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiBlogDraftGenerationError";
  }
}

export async function generateAiBlogDraftUseCase(input: AiBlogDraftInput): Promise<AiBlogDraft> {
  if (!isGeminiConfigured()) {
    throw new AiBlogDraftGenerationError("Gemini n'est pas configure.");
  }

  try {
    const article = await generateBlogArticle(input);

    return {
      title: article.title,
      slug: article.slug,
      category: article.category,
      excerpt: article.excerpt.trim(),
      content: article.contentMarkdown.trim(),
      metaTitle: article.seoTitle.trim(),
      metaDescription: article.metaDescription.trim(),
      imageUrl: BLOG_IMAGE_FALLBACK_URL,
      imageAlt: article.imageAlt.trim(),
      authorLabel: article.authorLabel.trim(),
      brandPerspectiveMarkdown: article.brandPerspectiveMarkdown.trim(),
      ctaTitle: article.cta.title.trim(),
      ctaBody: article.cta.body.trim(),
      ctaPrimaryLabel: article.cta.primaryLabel.trim(),
      ctaPrimaryLink: article.cta.primaryLink,
      ctaSecondaryLabel: article.cta.secondaryLabel.trim(),
      ctaSecondaryLink: article.cta.secondaryLink,
      generatedWithAI: true,
      reviewedByHuman: false,
    };
  } catch (error) {
    throw new AiBlogDraftGenerationError(
      error instanceof Error ? error.message : "Une erreur est survenue lors de la generation du brouillon.",
    );
  }
}
