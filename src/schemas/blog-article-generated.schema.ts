import { z } from "zod";

const markdownWithoutH1 = z
  .string()
  .min(300)
  .refine((value) => !/^#\s+/m.test(value), {
    message: "Markdown content must not contain an H1. Use ## and ### only.",
  });

const shortMarkdownWithoutH1 = z
  .string()
  .min(80)
  .refine((value) => !/^#\s+/m.test(value), {
    message: "Markdown content must not contain an H1. Use ## and ### only.",
  });

export const blogArticleGeneratedSchema = z.object({
  title: z.string().min(10).max(140),
  seoTitle: z.string().min(10).max(90),
  metaDescription: z.string().min(70).max(180),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z.string().min(80).max(350),
  category: z.string().min(2).max(80),
  imageAlt: z.string().min(20).max(180),
  authorLabel: z.string().min(10).max(160),
  contentMarkdown: markdownWithoutH1,
  brandPerspectiveMarkdown: shortMarkdownWithoutH1,
  cta: z.object({
    title: z.string().min(5).max(120),
    body: z.string().min(40).max(300),
    primaryLabel: z.string().min(2).max(60),
    primaryLink: z.literal("/boutique"),
    secondaryLabel: z.string().min(2).max(60),
    secondaryLink: z.literal("/contact"),
  }),
  seoChecklist: z.object({
    hasLocalContext: z.boolean(),
    hasBrandMention: z.boolean(),
    hasNoKeywordStuffing: z.boolean(),
    hasUsefulAdvice: z.boolean(),
    hasImageAlt: z.boolean(),
    hasCta: z.boolean(),
    hasNoH1InMarkdown: z.boolean(),
  }),
});

export type BlogArticleGenerated = z.infer<typeof blogArticleGeneratedSchema>;
