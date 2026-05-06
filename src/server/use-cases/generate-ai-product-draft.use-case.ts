import { slugify } from "@/lib/slugify";
import { generateGeminiJson, isGeminiConfigured } from "@/server/services/ai/gemini";

export type AiProductDraft = {
  shortDescription: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  imageAlt?: string;
};

function buildFallbackProductDraft(input: {
  title: string;
  category?: string;
  shippingClass: string;
  currentShortDescription?: string | null;
  currentDescription?: string | null;
}) {
  const categoryLabel = input.category || "decoration";
  const keyword = `${input.title} ${categoryLabel}`.trim();

  return {
    shortDescription:
      input.currentShortDescription?.trim() ||
      `${input.title} apporte une presence decorative sobre, tactile et facile a integrer dans un interieur chaleureux.`,
    description:
      input.currentDescription?.trim() ||
      [
        `${input.title} est pense pour enrichir une composition ${categoryLabel} sans surcharge visuelle.`,
        "Le brouillon IA doit etre relu, complete et ajuste selon la piece, les matieres et l'usage reel du produit.",
        `Classe logistique actuelle: ${input.shippingClass}. Verifier les contraintes de fragilite, de poids et de retrait avant publication.`,
      ].join("\n\n"),
    seoTitle: `${input.title} | Art Home Déco`,
    seoDescription: `Brouillon SEO pour ${keyword}. Validation humaine obligatoire avant publication en boutique.`,
    imageAlt: `Photo produit ${slugify(input.title).replace(/-/g, " ")}`,
  } satisfies AiProductDraft;
}

export async function generateAiProductDraftUseCase(input: {
  title: string;
  category?: string;
  shippingClass: string;
  currentShortDescription?: string | null;
  currentDescription?: string | null;
}) {
  const fallback = buildFallbackProductDraft(input);

  if (!isGeminiConfigured()) {
    return fallback;
  }

  try {
    const categoryLabel = input.category || "decoration";
    const generated = await generateGeminiJson<AiProductDraft>({
      systemInstruction:
        "Tu rediges pour une boutique e-commerce premium de decoration. Tu retournes uniquement un objet JSON valide, sans markdown.",
      prompt: [
        "Genere un brouillon produit en francais pour un back-office e-commerce.",
        "Le ton doit etre editorial, concret, sobre et commercial sans exageration.",
        "Retourne strictement un JSON avec les cles: shortDescription, description, seoTitle, seoDescription, imageAlt.",
        `Titre: ${input.title}`,
        `Categorie: ${categoryLabel}`,
        `Classe logistique: ${input.shippingClass}`,
        `Description courte actuelle: ${input.currentShortDescription ?? ""}`,
        `Description longue actuelle: ${input.currentDescription ?? ""}`,
        "Contraintes: maximum 160 caracteres pour seoDescription, pas de promesse non verifiable, mention implicite qu'une relecture humaine reste necessaire dans le contenu si utile.",
      ].join("\n"),
    });

    return {
      shortDescription: generated.shortDescription?.trim() || fallback.shortDescription,
      description: generated.description?.trim() || fallback.description,
      seoTitle: generated.seoTitle?.trim() || fallback.seoTitle,
      seoDescription: generated.seoDescription?.trim() || fallback.seoDescription,
      imageAlt: generated.imageAlt?.trim() || fallback.imageAlt,
    } satisfies AiProductDraft;
  } catch {
    return fallback;
  }
}
