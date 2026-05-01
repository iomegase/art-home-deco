"use server";

import { aiBlogDraftSchema } from "@/schemas/forms/ai-blog-draft.schema";
import { db } from "@/server/db/client";
import { generateAiBlogDraftUseCase } from "@/server/use-cases/generate-ai-blog-draft.use-case";
import { requireAdmin } from "@/server/security/auth";
import { redirect } from "next/navigation";

export async function generateAiBlogDraftAction(formData: FormData) {
  await requireAdmin();

  const input = aiBlogDraftSchema.parse({
    topic: String(formData.get("topic") ?? ""),
    intent: String(formData.get("intent") ?? ""),
    targetKeyword: String(formData.get("targetKeyword") ?? ""),
  });

  const draft = await generateAiBlogDraftUseCase(input);

  await db.blogPost.create({
    data: {
      title: draft.title,
      slug: draft.slug,
      excerpt: draft.metaDescription,
      content: draft.outline.map((item) => `## ${item}`).join("\n\n"),
      seoTitle: draft.metaTitle,
      seoDescription: draft.metaDescription,
      generatedWithAI: draft.generatedWithAI,
      reviewedByHuman: draft.reviewedByHuman,
      status: "draft",
    },
  });

  redirect("/admin/blog");
}
