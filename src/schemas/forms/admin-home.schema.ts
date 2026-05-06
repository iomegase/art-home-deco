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

export const adminHomeContentSchema = z.object({
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
});
