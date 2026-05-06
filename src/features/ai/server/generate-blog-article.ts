import type { AiBlogDraftInput } from "@/schemas/forms/ai-blog-draft.schema";
import { generateGeminiJson } from "@/server/services/ai/gemini";
import { buildBlogPrompt } from "./build-blog-prompt";
import { assertSeoChecklist, normalizeGeneratedBlogArticle } from "./normalize-blog-article";

export async function generateBlogArticle(input: AiBlogDraftInput) {
  const prompt = await buildBlogPrompt(input);
  const raw = await generateGeminiJson<Record<string, unknown>>({
    systemInstruction:
      "Tu es un redacteur web expert SEO pour une boutique de decoration locale. Tu retournes uniquement du JSON conforme au schema demande.",
    prompt,
    temperature: 0.7,
    topP: 0.9,
    maxOutputTokens: 4096,
  });

  const article = normalizeGeneratedBlogArticle(raw);
  assertSeoChecklist(article);
  return article;
}
