import { slugify } from "@/lib/slugify";

export type AiProductDraft = {
  shortDescription: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  imageAlt?: string;
};

export function generateAiProductDraftUseCase(input: {
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
    seoTitle: `${input.title} | Art Home Deco`,
    seoDescription: `Brouillon SEO pour ${keyword}. Validation humaine obligatoire avant publication en boutique.`,
    imageAlt: `Photo produit ${slugify(input.title).replace(/-/g, " ")}`,
  } satisfies AiProductDraft;
}
