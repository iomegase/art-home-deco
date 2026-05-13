import { z } from "zod";

const normalizeHexColor = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed}`;
  return trimmed;
};

const colorSchema = z.preprocess(
  normalizeHexColor,
  z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Couleur hex invalide"),
);
const requiredText = (label: string) => z.string().trim().min(1, `${label} est requis`);
const urlSchema = z.string().trim().url("URL invalide");
const timeSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horaire invalide (format HH:mm)");

export const adminHomeContentSchema = z.object({
  homeBackgroundColor: colorSchema,
  heroImageUrl: urlSchema,
  heroImageAlt: requiredText("Alt hero"),
  heroTitle: requiredText("Titre hero"),
  heroParagraph: requiredText("Paragraphe hero"),
  heroCtaLabel: requiredText("CTA hero"),
  collectionCardImageUrl: urlSchema,
  collectionCardImageAlt: requiredText("Alt image collection"),
  collectionTitle: requiredText("Titre collection"),
  adviceCardImageUrl: urlSchema,
  adviceCardImageAlt: requiredText("Alt image conseil"),
  adviceTitle: requiredText("Titre conseil"),
  adviceParagraph: requiredText("Texte conseil"),
  blogCardImageUrl: urlSchema,
  blogCardImageAlt: requiredText("Alt blog"),
  blogCardTitle: requiredText("Titre blog"),
  blogCardParagraph: requiredText("Texte blog"),
  approachLabel: requiredText("Label approche"),
  approachTitle: requiredText("Titre approche"),
  approachParagraph: requiredText("Texte approche"),
  approachImageUrl: urlSchema,
  approachImageAlt: requiredText("Alt approche"),
  approachCtaLabel: requiredText("CTA approche"),
  newsletterTitle: requiredText("Titre newsletter"),
  newsletterParagraph: requiredText("Texte newsletter"),
  newsletterPlaceholder: requiredText("Placeholder newsletter"),
  newsletterButtonLabel: requiredText("Bouton newsletter"),
});

export const adminThemeSchema = z.object({
  background: colorSchema,
  foreground: colorSchema,
  surface: colorSchema,
  surfaceStrong: colorSchema,
  brand: colorSchema,
  brandContrast: colorSchema,
  muted: colorSchema,
  accent: colorSchema,
  terracotta: colorSchema,
  clay: colorSchema,
  line: colorSchema,
  fontDisplay: requiredText("Police display"),
  fontBody: requiredText("Police body"),
  fontNav: requiredText("Police navigation"),
});

export const adminLegalSchema = z.object({
  commercialName: requiredText("Nom commercial"),
  legalName: requiredText("Dénomination sociale"),
  legalForm: requiredText("Forme juridique"),
  capital: requiredText("Capital social"),
  address: requiredText("Adresse du siège"),
  siren: requiredText("SIREN"),
  rcs: requiredText("RCS"),
  vat: requiredText("TVA"),
  email: requiredText("Email"),
  phone: requiredText("Téléphone"),
  publisher: requiredText("Directeur de publication"),
  domain: requiredText("Domaine"),
  hostName: requiredText("Nom hébergeur"),
  hostAddress: requiredText("Adresse hébergeur"),
  hostPhone: requiredText("Téléphone hébergeur"),
  mediatorName: requiredText("Nom médiateur"),
  mediatorAddress: requiredText("Adresse médiateur"),
  mediatorWebsite: requiredText("Site médiateur"),
  returnAddress: requiredText("Adresse retour"),
  lastUpdated: requiredText("Dernière mise à jour"),
});

export const adminStoreStatusSchema = z.object({
  whatsappEnabled: z.boolean(),
  physicalStoreEnabled: z.boolean(),
  showPopupWhenClosed: z.boolean(),
  vacationModeEnabled: z.boolean(),
  timezone: requiredText("Fuseau horaire"),
  openDays: z.array(z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"])).min(1, "Sélectionnez au moins un jour"),
  morningOpenTime: timeSchema,
  morningCloseTime: timeSchema,
  afternoonOpenTime: timeSchema,
  afternoonCloseTime: timeSchema,
  closedMessage: requiredText("Message fermeture"),
  vacationMessage: requiredText("Message vacances"),
  vacationReturnDate: z.string().trim().optional().default(""),
});
