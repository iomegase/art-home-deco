import type { AiBlogDraftInput } from "@/schemas/forms/ai-blog-draft.schema";
import { slugify } from "@/lib/slugify";
import { generateGeminiJson, isGeminiConfigured } from "@/server/services/ai/gemini";

export type AiBlogDraft = {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  outline: string[];
  generatedWithAI: true;
  reviewedByHuman: false;
};

function buildFallbackBlogDraft(input: AiBlogDraftInput): AiBlogDraft {
  return {
    title: input.topic,
    slug: slugify(input.topic),
    metaTitle: `${input.topic} | Art Home Deco`,
    metaDescription: `Brouillon SEO sur ${input.targetKeyword}, a relire et enrichir avant publication.`,
    outline: [
      "Intention de recherche et contexte decoration",
      "Criteres de choix concrets",
      "Conseils de composition dans la maison",
      "Produits ou categories a associer",
      "Conclusion et appel vers la boutique",
    ],
    generatedWithAI: true,
    reviewedByHuman: false,
  };
}

export async function generateAiBlogDraftUseCase(input: AiBlogDraftInput): Promise<AiBlogDraft> {
  const fallback = buildFallbackBlogDraft(input);

  if (!isGeminiConfigured()) {
    return fallback;
  }

  try {
    const generated = await generateGeminiJson<{
      title: string;
      metaTitle: string;
      metaDescription: string;
      outline: string[];
    }>({
      systemInstruction:
        "Tu aides un e-commerce de decoration a preparer un brouillon d'article SEO. Tu retournes uniquement un objet JSON valide, sans markdown.",
      prompt: [
        "Genere un brouillon d'article blog en francais.",
        "Retourne strictement un JSON avec les cles: title, metaTitle, metaDescription, outline.",
        "outline doit etre un tableau de 4 a 6 intertitres actionnables.",
        `Sujet: ${input.topic}`,
        `Intention: ${input.intent}`,
        `Mot-cle cible: ${input.targetKeyword}`,
        "Contraintes: metaDescription <= 160 caracteres, ton editorial, concret, orienté conseil maison et conversion douce.",
      ].join("\n"),
    });

    const title = generated.title?.trim() || fallback.title;

    return {
      title,
      slug: slugify(title),
      metaTitle: generated.metaTitle?.trim() || fallback.metaTitle,
      metaDescription: generated.metaDescription?.trim() || fallback.metaDescription,
      outline:
        Array.isArray(generated.outline) && generated.outline.length > 0
          ? generated.outline.map((item) => String(item).trim()).filter(Boolean)
          : fallback.outline,
      generatedWithAI: true,
      reviewedByHuman: false,
    };
  } catch {
    return fallback;
  }
}
