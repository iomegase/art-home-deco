export type HomeGalleryItem = {
  src: string;
  alt: string;
};

export type HomePostItem = {
  title: string;
  src: string;
};

export type HomeContent = {
  heroImageUrl: string;
  heroImageAlt: string;
  heroTitle: string;
  heroParagraph: string;
  heroCtaLabel: string;
  collectionCardImageUrl: string;
  collectionCardImageAlt: string;
  collectionTitle: string;
  adviceCardImageUrl: string;
  adviceCardImageAlt: string;
  adviceTitle: string;
  adviceParagraph: string;
  blogCardImageUrl: string;
  blogCardImageAlt: string;
  blogCardTitle: string;
  blogCardParagraph: string;
  approachLabel: string;
  approachTitle: string;
  approachParagraph: string;
  approachImageUrl: string;
  approachImageAlt: string;
  approachCtaLabel: string;
  galleryTitle: string;
  gallery: HomeGalleryItem[];
  journalTitle: string;
  posts: HomePostItem[];
  newsletterTitle: string;
  newsletterParagraph: string;
  newsletterPlaceholder: string;
  newsletterButtonLabel: string;
};

export type ThemeSettings = {
  background: string;
  foreground: string;
  surface: string;
  surfaceStrong: string;
  brand: string;
  brandContrast: string;
  muted: string;
  accent: string;
  terracotta: string;
  clay: string;
  line: string;
  fontDisplay: string;
  fontBody: string;
};

export const defaultThemeSettings: ThemeSettings = {
  background: "#f4f1e8",
  foreground: "#171714",
  surface: "#e8e2d2",
  surfaceStrong: "#d2c2a9",
  brand: "#181713",
  brandContrast: "#fbf7ec",
  muted: "#6f6a5d",
  accent: "#747b4f",
  terracotta: "#bd6745",
  clay: "#cfa77f",
  line: "#d8d0bd",
  fontDisplay: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
  fontBody: '"Avenir Next", Avenir, "Trebuchet MS", sans-serif',
};

export const defaultHomeContent: HomeContent = {
  heroImageUrl:
    "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1100&q=90",
  heroImageAlt: "Atelier lumineux avec objets de decoration",
  heroTitle: "Inspiré des Alpes, pensé pour votre intérieur.",
  heroParagraph:
    "Bienvenue chez Art Home Déco. Des objets choisis avec soin, du style Alpin aux inspirations tendances.",
  heroCtaLabel: "Explorez notre boutique",
  collectionCardImageUrl:
    "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=85",
  collectionCardImageAlt: "Vases et décoration sur une étagère",
  collectionTitle: "Collection actuelle",
  adviceCardImageUrl:
    "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=85",
  adviceCardImageAlt: "Ambiance intérieure minimaliste",
  adviceTitle: "Conseil décoration",
  adviceParagraph: "Optimisation d'espace, choix des matières et harmonie des couleurs.",
  blogCardImageUrl:
    "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=700&q=85",
  blogCardImageAlt: "Journal",
  blogCardTitle: "Journal maison",
  blogCardParagraph: "Histoires d'objets et d'intérieurs.",
  approachLabel: "Notre approche",
  approachTitle: "Une decoration pensee comme une composition.",
  approachParagraph:
    "Chaque piece est selectionnee pour dialoguer avec la lumiere, les textures et les usages du quotidien. L'objectif: une maison plus calme, plus personnelle, plus durable.",
  approachImageUrl:
    "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1000&q=85",
  approachImageAlt: "Atelier lumineux avec objets de decoration",
  approachCtaLabel: "Découvrez nos conseils",
  galleryTitle: "Gallerie",
  gallery: [
    {
      src: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85",
      alt: "Vases ceramiques sur une table claire",
    },
    {
      src: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=700&q=85",
      alt: "Tasse artisanale en gres",
    },
    {
      src: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=700&q=85",
      alt: "Objet decoratif vert olive",
    },
    {
      src: "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=700&q=85",
      alt: "Ceramique sur fond sombre",
    },
  ],
  journalTitle: "Le Journal",
  posts: [
    {
      title: "Composer une table",
      src: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=700&q=85",
    },
    {
      title: "Matieres naturelles",
      src: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=85",
    },
    {
      title: "Choisir une piece",
      src: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=600&q=85",
    },
  ],
  newsletterTitle: "Newsletter",
  newsletterParagraph:
    "Rejoignez le cercle Art Home Déco pour recevoir nos inspirations saisonnières.",
  newsletterPlaceholder: "Votre email",
  newsletterButtonLabel: "S'inscrire",
};
