"use server";

import { aiBlogDraftSchema } from "@/schemas/forms/ai-blog-draft.schema";
import { db } from "@/server/db/client";
import { findBlogPostBySlugForAdmin } from "@/server/repositories/blog.repository";
import { generateAiBlogDraftUseCase } from "@/server/use-cases/generate-ai-blog-draft.use-case";
import { requireAdmin } from "@/server/security/auth";
import { redirect } from "next/navigation";

async function ensureUniqueBlogSlug(baseSlug: string) {
  let candidate = baseSlug;
  let suffix = 2;

  while (await findBlogPostBySlugForAdmin(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export async function generateAiBlogDraftAction(formData: FormData) {
  await requireAdmin();

  let redirectPath: string;

  try {
    const input = aiBlogDraftSchema.parse({
      topic: String(formData.get("topic") ?? ""),
      intent: String(formData.get("intent") ?? ""),
      targetKeyword: String(formData.get("targetKeyword") ?? ""),
      includeBlogContext: formData.get("includeBlogContext") === "on",
      boutiqueProductLink: String(formData.get("boutiqueProductLink") ?? ""),
    });

    const draft = await generateAiBlogDraftUseCase(input);
    const uniqueSlug = await ensureUniqueBlogSlug(draft.slug);

    const created = await db.blogPost.create({
      data: {
        title: draft.title,
        slug: uniqueSlug,
        category: draft.category,
        imageUrl: draft.imageUrl,
        imageAlt: draft.imageAlt,
        excerpt: draft.excerpt,
        content: draft.content,
        seoTitle: draft.metaTitle,
        seoDescription: draft.metaDescription,
        authorLabel: draft.authorLabel,
        brandPerspectiveMarkdown: draft.brandPerspectiveMarkdown,
        ctaTitle: draft.ctaTitle,
        ctaBody: draft.ctaBody,
        ctaPrimaryLabel: input.boutiqueProductLink ? "Voir ce produit" : "Explorez notre boutique",
        ctaPrimaryLink: input.boutiqueProductLink ?? "/boutique",
        ctaSecondaryLabel: draft.ctaSecondaryLabel,
        ctaSecondaryLink: draft.ctaSecondaryLink,
        generatedWithAI: draft.generatedWithAI,
        reviewedByHuman: draft.reviewedByHuman,
        status: "draft",
      },
    });

    redirectPath = `/admin/blog/${created.id}/edit`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "La generation du brouillon a echoue.";
    redirect(`/admin/blog/new?error=${encodeURIComponent(message)}`);
  }

  redirect(redirectPath);
}
