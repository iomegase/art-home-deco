"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminHomeContentSchema, adminThemeSchema } from "@/schemas/forms/admin-home.schema";
import { requireAdmin } from "@/server/security/auth";
import { getSiteSettings, upsertSiteSettings } from "@/server/repositories/site-settings.repository";
import { uploadHomeImage } from "@/server/services/site-settings/upload-home-image";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

const homeImageTargetSchema = z.enum([
  "heroImageUrl",
  "collectionCardImageUrl",
  "adviceCardImageUrl",
  "blogCardImageUrl",
  "approachImageUrl",
]);

export async function updateHomeContentAction(formData: FormData) {
  await requireAdmin();
  const current = await getSiteSettings();
  const homeBackgroundColorValue = value(formData, "homeBackgroundColor") || current.homeContent.homeBackgroundColor;

  const parsed = adminHomeContentSchema.parse({
    homeBackgroundColor: homeBackgroundColorValue,
    heroImageUrl: value(formData, "heroImageUrl"),
    heroImageAlt: value(formData, "heroImageAlt"),
    heroTitle: value(formData, "heroTitle"),
    heroParagraph: value(formData, "heroParagraph"),
    heroCtaLabel: value(formData, "heroCtaLabel"),
    collectionCardImageUrl: value(formData, "collectionCardImageUrl"),
    collectionCardImageAlt: value(formData, "collectionCardImageAlt"),
    collectionTitle: value(formData, "collectionTitle"),
    adviceCardImageUrl: value(formData, "adviceCardImageUrl"),
    adviceCardImageAlt: value(formData, "adviceCardImageAlt"),
    adviceTitle: value(formData, "adviceTitle"),
    adviceParagraph: value(formData, "adviceParagraph"),
    blogCardImageUrl: value(formData, "blogCardImageUrl"),
    blogCardImageAlt: value(formData, "blogCardImageAlt"),
    blogCardTitle: value(formData, "blogCardTitle"),
    blogCardParagraph: value(formData, "blogCardParagraph"),
    approachLabel: value(formData, "approachLabel"),
    approachTitle: value(formData, "approachTitle"),
    approachParagraph: value(formData, "approachParagraph"),
    approachImageUrl: value(formData, "approachImageUrl"),
    approachImageAlt: value(formData, "approachImageAlt"),
    approachCtaLabel: value(formData, "approachCtaLabel"),
    newsletterTitle: value(formData, "newsletterTitle"),
    newsletterParagraph: value(formData, "newsletterParagraph"),
    newsletterPlaceholder: value(formData, "newsletterPlaceholder"),
    newsletterButtonLabel: value(formData, "newsletterButtonLabel"),
  });

  await upsertSiteSettings({
    homeContent: {
      homeBackgroundColor: parsed.homeBackgroundColor,
      heroImageUrl: parsed.heroImageUrl,
      heroImageAlt: parsed.heroImageAlt,
      heroTitle: parsed.heroTitle,
      heroParagraph: parsed.heroParagraph,
      heroCtaLabel: parsed.heroCtaLabel,
      collectionCardImageUrl: parsed.collectionCardImageUrl,
      collectionCardImageAlt: parsed.collectionCardImageAlt,
      collectionTitle: parsed.collectionTitle,
      adviceCardImageUrl: parsed.adviceCardImageUrl,
      adviceCardImageAlt: parsed.adviceCardImageAlt,
      adviceTitle: parsed.adviceTitle,
      adviceParagraph: parsed.adviceParagraph,
      blogCardImageUrl: parsed.blogCardImageUrl,
      blogCardImageAlt: parsed.blogCardImageAlt,
      blogCardTitle: parsed.blogCardTitle,
      blogCardParagraph: parsed.blogCardParagraph,
      approachLabel: parsed.approachLabel,
      approachTitle: parsed.approachTitle,
      approachParagraph: parsed.approachParagraph,
      approachImageUrl: parsed.approachImageUrl,
      approachImageAlt: parsed.approachImageAlt,
      approachCtaLabel: parsed.approachCtaLabel,
      galleryTitle: current.homeContent.galleryTitle,
      gallery: current.homeContent.gallery,
      journalTitle: current.homeContent.journalTitle,
      posts: current.homeContent.posts,
      newsletterTitle: parsed.newsletterTitle,
      newsletterParagraph: parsed.newsletterParagraph,
      newsletterPlaceholder: parsed.newsletterPlaceholder,
      newsletterButtonLabel: parsed.newsletterButtonLabel,
    },
    theme: current.theme,
  });

  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/admin/home");
}

export async function updateThemeSettingsAction(formData: FormData) {
  await requireAdmin();

  const parsed = adminThemeSchema.parse({
    background: value(formData, "background"),
    foreground: value(formData, "foreground"),
    surface: value(formData, "surface"),
    surfaceStrong: value(formData, "surfaceStrong"),
    brand: value(formData, "brand"),
    brandContrast: value(formData, "brandContrast"),
    muted: value(formData, "muted"),
    accent: value(formData, "accent"),
    terracotta: value(formData, "terracotta"),
    clay: value(formData, "clay"),
    line: value(formData, "line"),
    fontDisplay: value(formData, "fontDisplay"),
    fontBody: value(formData, "fontBody"),
    fontNav: value(formData, "fontNav"),
  });

  const current = await getSiteSettings();

  await upsertSiteSettings({
    homeContent: current.homeContent,
    theme: parsed,
  });

  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/admin/home");
  revalidatePath("/admin/settings");
}

export async function uploadHomeImageAction(formData: FormData) {
  await requireAdmin();

  const target = homeImageTargetSchema.parse(value(formData, "target"));
  const file = formData.get("image");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Aucun fichier image fourni.");
  }

  const uploadedUrl = await uploadHomeImage(file);
  const current = await getSiteSettings();

  const nextHomeContent = { ...current.homeContent };

  switch (target) {
    case "heroImageUrl":
    case "collectionCardImageUrl":
    case "adviceCardImageUrl":
    case "blogCardImageUrl":
    case "approachImageUrl":
      nextHomeContent[target] = uploadedUrl;
      break;
  }

  await upsertSiteSettings({
    homeContent: nextHomeContent,
    theme: current.theme,
  });

  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/admin/home");
}
