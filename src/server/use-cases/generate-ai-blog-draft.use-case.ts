import type { AiBlogDraftInput } from "@/schemas/forms/ai-blog-draft.schema";
import { getEnv } from "@/server/env";

export type AiBlogDraft = {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  outline: string[];
  generatedWithAI: true;
  reviewedByHuman: false;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function generateAiBlogDraftUseCase(input: AiBlogDraftInput): Promise<AiBlogDraft> {
  const env = getEnv();

  if (!env.OPENAI_API_KEY) {
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

  return {
    title: input.topic,
    slug: slugify(input.topic),
    metaTitle: `${input.topic} | Art Home Deco`,
    metaDescription: `Brouillon genere pour ${input.targetKeyword}. Relecture humaine obligatoire avant publication.`,
    outline: [
      "Introduction orientee besoin client",
      "Conseils pratiques et exemples deco",
      "Selection de matieres et volumes",
      "Liens internes vers categories pertinentes",
      "Conclusion commerciale sobre",
    ],
    generatedWithAI: true,
    reviewedByHuman: false,
  };
}
