export type HomeGalleryItem = {
  src: string;
  alt: string;
};

export type HomePostItem = {
  title: string;
  src: string;
};

export type HomeContent = {
  homeBackgroundColor: string;
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
  commitmentsLabel: string;
  commitmentsTitle: string;
  commitmentsParagraph: string;
  commitmentOneTitle: string;
  commitmentOneText: string;
  commitmentTwoTitle: string;
  commitmentTwoText: string;
  commitmentThreeTitle: string;
  commitmentThreeText: string;
  commitmentFourTitle: string;
  commitmentFourText: string;
  commitmentFiveTitle: string;
  commitmentFiveText: string;
  commitmentSixTitle: string;
  commitmentSixText: string;
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
  fontNav: string;
};

export type LegalSettings = {
  commercialName: string;
  legalName: string;
  legalForm: string;
  capital: string;
  address: string;
  siren: string;
  rcs: string;
  vat: string;
  email: string;
  phone: string;
  publisher: string;
  domain: string;
  hostName: string;
  hostAddress: string;
  hostPhone: string;
  mediatorName: string;
  mediatorAddress: string;
  mediatorWebsite: string;
  returnAddress: string;
  lastUpdated: string;
};

export type StoreDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type StoreStatusSettings = {
  whatsappEnabled: boolean;
  physicalStoreEnabled: boolean;
  showPopupWhenClosed: boolean;
  vacationModeEnabled: boolean;
  timezone: string;
  openDays: StoreDay[];
  morningOpenTime: string;
  morningCloseTime: string;
  afternoonOpenTime: string;
  afternoonCloseTime: string;
  closedMessage: string;
  vacationMessage: string;
  vacationReturnDate: string;
};

export type MaintenanceSettings = {
  enabled: boolean;
};

export const defaultThemeSettings: ThemeSettings = {
  background: "#ffffff",
  foreground: "#171714",
  surface: "#ffffff",
  surfaceStrong: "#ffffff",
  brand: "#181713",
  brandContrast: "#ffffff",
  muted: "#6f6a5d",
  accent: "#747b4f",
  terracotta: "#bd6745",
  clay: "#cfa77f",
  line: "#e5e7eb",
  fontDisplay: 'var(--font-elms-sans), "Helvetica Neue", Helvetica, Arial, sans-serif',
  fontBody: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  fontNav: '"Helvetica Neue", Helvetica, Arial, sans-serif',
};

export const defaultLegalSettings: LegalSettings = {
  commercialName: "Art Home Déco",
  legalName: "[DENOMINATION_SOCIALE]",
  legalForm: "[FORME_JURIDIQUE]",
  capital: "[CAPITAL_SOCIAL]",
  address: "[ADRESSE_SIEGE]",
  siren: "[SIREN]",
  rcs: "[RCS_VILLE]",
  vat: "[NUMERO_TVA]",
  email: "[EMAIL_CONTACT]",
  phone: "[TELEPHONE]",
  publisher: "[DIRECTEUR_PUBLICATION]",
  domain: "[DOMAINE]",
  hostName: "[HEBERGEUR_NOM]",
  hostAddress: "[HEBERGEUR_ADRESSE]",
  hostPhone: "[HEBERGEUR_TELEPHONE]",
  mediatorName: "[MEDIATEUR_NOM]",
  mediatorAddress: "[MEDIATEUR_ADRESSE]",
  mediatorWebsite: "[MEDIATEUR_SITE]",
  returnAddress: "[ADRESSE_RETOUR]",
  lastUpdated: "[DATE_DERNIERE_MAJ]",
};

export const defaultStoreStatusSettings: StoreStatusSettings = {
  whatsappEnabled: true,
  physicalStoreEnabled: true,
  showPopupWhenClosed: true,
  vacationModeEnabled: false,
  timezone: "Europe/Paris",
  openDays: ["tue", "wed", "thu", "fri", "sat"],
  morningOpenTime: "09:00",
  morningCloseTime: "12:00",
  afternoonOpenTime: "15:00",
  afternoonCloseTime: "19:00",
  closedMessage: "La boutique physique est actuellement fermée.",
  vacationMessage: "La boutique est en vacances, retour le",
  vacationReturnDate: "",
};

export const defaultMaintenanceSettings: MaintenanceSettings = {
  enabled: false,
};

export const defaultHomeContent: HomeContent = {
  homeBackgroundColor: "#ffffff",
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
  commitmentsLabel: "Nos engagements",
  commitmentsTitle: "Un service pense pour votre decoration.",
  commitmentsParagraph:
    "Chaque commande est traitee avec attention, de la selection des pieces a la livraison.",
  commitmentOneTitle: "Des pieces choisies avec soin",
  commitmentOneText:
    "Mobilier, luminaires, senteurs, textiles et objets decoratifs sont selectionnes pour leur style, leur qualite et leur capacite a creer une atmosphere chaleureuse.",
  commitmentTwoTitle: "Un paiement simple et securise",
  commitmentTwoText:
    "Les paiements en ligne sont proteges via Stripe. Art Home Deco ne conserve aucune donnee bancaire.",
  commitmentThreeTitle: "Retrait possible a Saint-Gervais-les-Bains",
  commitmentThreeText:
    "Selon les articles disponibles, vous pouvez commander en ligne et organiser un retrait directement en boutique.",
  commitmentFourTitle: "Une livraison selon les articles",
  commitmentFourText:
    "Les articles eligibles peuvent etre expedies selon leur format, leur poids, leur fragilite et leur disponibilite.",
  commitmentFiveTitle: "Des disponibilites controlees",
  commitmentFiveText:
    "Les stocks sont suivis regulierement afin de limiter les mauvaises surprises au moment de la commande.",
  commitmentSixTitle: "Un contact direct avec la boutique",
  commitmentSixText:
    "Pour une question sur un produit, une idee cadeau ou une disponibilite, vous pouvez contacter directement Art Home Deco.",
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
