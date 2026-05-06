import { z } from "zod";

function emptyToUndefined(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim();
  return normalized === "" ? undefined : normalized;
}

const optionalString = z.preprocess(emptyToUndefined, z.string().min(1).optional()).optional();

export const blogPostEditorSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(3),
  slug: z.string().min(3),
  excerpt: optionalString.pipe(z.string().max(320).optional()),
  content: z.string().min(20),
  category: optionalString.pipe(z.string().max(80).optional()),
  imageUrl: z.preprocess(emptyToUndefined, z.string().url().optional()).optional(),
  imageAlt: optionalString.pipe(z.string().max(180).optional()),
  seoTitle: optionalString.pipe(z.string().max(90).optional()),
  seoDescription: optionalString.pipe(z.string().max(180).optional()),
  authorLabel: optionalString.pipe(z.string().max(160).optional()),
  brandPerspectiveMarkdown: optionalString.pipe(z.string().min(20).optional()),
  ctaTitle: optionalString.pipe(z.string().max(120).optional()),
  ctaBody: optionalString.pipe(z.string().max(300).optional()),
  ctaPrimaryLabel: optionalString.pipe(z.string().max(60).optional()),
  ctaPrimaryLink: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .refine((value) => value.startsWith("/boutique") || value.startsWith("http://") || value.startsWith("https://"), {
        message: "Le lien principal doit commencer par /boutique, http:// ou https://.",
      })
      .optional(),
  ),
  ctaSecondaryLabel: optionalString.pipe(z.string().max(60).optional()),
  ctaSecondaryLink: z.preprocess(emptyToUndefined, z.literal("/contact").optional()).optional(),
  reviewedByHuman: z.boolean(),
});

export const blogPostStatusSchema = z.object({
  id: z.string().cuid(),
  action: z.enum(["publish", "unpublish"]),
});

export const blogPostDeleteSchema = z.object({
  id: z.string().cuid(),
});

export type BlogPostEditorInput = z.infer<typeof blogPostEditorSchema>;
export type BlogPostStatusInput = z.infer<typeof blogPostStatusSchema>;
export type BlogPostDeleteInput = z.infer<typeof blogPostDeleteSchema>;
