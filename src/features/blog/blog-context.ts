export type BlogContext = {
  brandName: string;
  city: string;
  region: string;
  environment: string;
  positioning: string;
  audience: string;
  tone: string;
  specialties: string[];
  localSeoTerms: string[];
};

export type BlogCta = {
  title: string;
  body: string;
  primaryLabel: string;
  primaryLink: "/boutique";
  secondaryLabel: string;
  secondaryLink: "/contact";
};

export const BLOG_IMAGE_FALLBACK_URL =
  "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=85";

export const defaultBlogContext: BlogContext = {
  brandName: "Art Home Déco",
  city: "Saint-Gervais-les-Bains",
  region: "Haute-Savoie",
  environment:
    "boutique de décoration située au coeur des Alpes, à Saint-Gervais-les-Bains",
  positioning:
    "décoration chaleureuse, élégante, inspirée par la montagne et l'art de vivre alpin",
  audience:
    "habitants, propriétaires de chalets, résidences secondaires, visiteurs et amateurs de décoration",
  tone: "conseil professionnel, chaleureux, accessible, élégant",
  specialties: [
    "décoration intérieure",
    "objets déco",
    "ambiance chalet",
    "art de la table",
    "cadeaux",
    "textiles",
    "mobilier d'appoint",
  ],
  localSeoTerms: [
    "Saint-Gervais-les-Bains",
    "Haute-Savoie",
    "Mont-Blanc",
    "décoration chalet",
    "boutique déco Saint-Gervais",
    "intérieur montagne",
  ],
};

export function getDefaultBlogAuthorLabel() {
  return `Par l'équipe ${defaultBlogContext.brandName} — Boutique de décoration à ${defaultBlogContext.city}`;
}

export function getDefaultBlogCta(): BlogCta {
  return {
    title: "Besoin d'inspiration pour votre intérieur ?",
    body: `Retrouvez ${defaultBlogContext.brandName} à ${defaultBlogContext.city} et découvrez une sélection d'objets décoratifs, textiles, luminaires et pièces artisanales pour créer une ambiance chaleureuse.`,
    primaryLabel: "Découvrir la boutique",
    primaryLink: "/boutique",
    secondaryLabel: "Demander un conseil",
    secondaryLink: "/contact",
  };
}

export function buildBlogContextPrompt(context: BlogContext) {
  return [
    `Contexte de marque: ${context.brandName}, ${context.environment}.`,
    `Positionnement: ${context.positioning}.`,
    `Audience: ${context.audience}.`,
    `Ton de marque: ${context.tone}.`,
    `Specialites: ${context.specialties.join(", ")}.`,
    `Termes SEO locaux utiles: ${context.localSeoTerms.join(", ")}.`,
    "Integre ce contexte seulement quand il enrichit vraiment l'article.",
    "Mentionne la boutique et le lieu naturellement, sans bourrage de mots-cles.",
    "Si le sujet s'y prete, ajoute une section courte: ## Le regard d'Art Home Déco.",
  ].join("\n");
}
