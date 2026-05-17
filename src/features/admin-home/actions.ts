"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminHomeContentSchema, adminLegalSchema, adminStoreStatusSchema, adminThemeSchema } from "@/schemas/forms/admin-home.schema";
import { requireAdmin } from "@/server/security/auth";
import { getSiteSettings, upsertSiteSettings } from "@/server/repositories/site-settings.repository";
import { uploadHomeImage } from "@/server/services/site-settings/upload-home-image";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on";
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
    commitmentsLabel: value(formData, "commitmentsLabel"),
    commitmentsTitle: value(formData, "commitmentsTitle"),
    commitmentsParagraph: value(formData, "commitmentsParagraph"),
    commitmentOneTitle: value(formData, "commitmentOneTitle"),
    commitmentOneText: value(formData, "commitmentOneText"),
    commitmentTwoTitle: value(formData, "commitmentTwoTitle"),
    commitmentTwoText: value(formData, "commitmentTwoText"),
    commitmentThreeTitle: value(formData, "commitmentThreeTitle"),
    commitmentThreeText: value(formData, "commitmentThreeText"),
    commitmentFourTitle: value(formData, "commitmentFourTitle"),
    commitmentFourText: value(formData, "commitmentFourText"),
    commitmentFiveTitle: value(formData, "commitmentFiveTitle"),
    commitmentFiveText: value(formData, "commitmentFiveText"),
    commitmentSixTitle: value(formData, "commitmentSixTitle"),
    commitmentSixText: value(formData, "commitmentSixText"),
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
      commitmentsLabel: parsed.commitmentsLabel,
      commitmentsTitle: parsed.commitmentsTitle,
      commitmentsParagraph: parsed.commitmentsParagraph,
      commitmentOneTitle: parsed.commitmentOneTitle,
      commitmentOneText: parsed.commitmentOneText,
      commitmentTwoTitle: parsed.commitmentTwoTitle,
      commitmentTwoText: parsed.commitmentTwoText,
      commitmentThreeTitle: parsed.commitmentThreeTitle,
      commitmentThreeText: parsed.commitmentThreeText,
      commitmentFourTitle: parsed.commitmentFourTitle,
      commitmentFourText: parsed.commitmentFourText,
      commitmentFiveTitle: parsed.commitmentFiveTitle,
      commitmentFiveText: parsed.commitmentFiveText,
      commitmentSixTitle: parsed.commitmentSixTitle,
      commitmentSixText: parsed.commitmentSixText,
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
    legal: current.legal,
    storeStatus: current.storeStatus,
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
    legal: current.legal,
    storeStatus: current.storeStatus,
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
    legal: current.legal,
    storeStatus: current.storeStatus,
  });

  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/admin/home");
}

export async function updateLegalSettingsAction(formData: FormData) {
  await requireAdmin();

  const parsed = adminLegalSchema.parse({
    commercialName: value(formData, "commercialName"),
    legalName: value(formData, "legalName"),
    legalForm: value(formData, "legalForm"),
    capital: value(formData, "capital"),
    address: value(formData, "address"),
    siren: value(formData, "siren"),
    rcs: value(formData, "rcs"),
    vat: value(formData, "vat"),
    email: value(formData, "email"),
    phone: value(formData, "phone"),
    publisher: value(formData, "publisher"),
    domain: value(formData, "domain"),
    hostName: value(formData, "hostName"),
    hostAddress: value(formData, "hostAddress"),
    hostPhone: value(formData, "hostPhone"),
    mediatorName: value(formData, "mediatorName"),
    mediatorAddress: value(formData, "mediatorAddress"),
    mediatorWebsite: value(formData, "mediatorWebsite"),
    returnAddress: value(formData, "returnAddress"),
    lastUpdated: value(formData, "lastUpdated"),
  });

  const current = await getSiteSettings();

  await upsertSiteSettings({
    homeContent: current.homeContent,
    theme: current.theme,
    legal: parsed,
    storeStatus: current.storeStatus,
  });

  revalidatePath("/mentions-legales");
  revalidatePath("/politique-confidentialite");
  revalidatePath("/cookies");
  revalidatePath("/cgv");
  revalidatePath("/cgu");
  revalidatePath("/donnees-personnelles");
  revalidatePath("/admin/settings");
}

export async function updateStoreStatusSettingsAction(formData: FormData) {
  await requireAdmin();

  const parsed = adminStoreStatusSchema.parse({
    whatsappEnabled: checked(formData, "whatsappEnabled"),
    physicalStoreEnabled: checked(formData, "physicalStoreEnabled"),
    showPopupWhenClosed: checked(formData, "showPopupWhenClosed"),
    vacationModeEnabled: checked(formData, "vacationModeEnabled"),
    timezone: value(formData, "timezone"),
    openDays: formData
      .getAll("openDays")
      .map((day) => String(day).trim())
      .filter(Boolean),
    morningOpenTime: value(formData, "morningOpenTime"),
    morningCloseTime: value(formData, "morningCloseTime"),
    afternoonOpenTime: value(formData, "afternoonOpenTime"),
    afternoonCloseTime: value(formData, "afternoonCloseTime"),
    closedMessage: value(formData, "closedMessage"),
    vacationMessage: value(formData, "vacationMessage"),
    vacationReturnDate: value(formData, "vacationReturnDate"),
  });

  const current = await getSiteSettings();

  await upsertSiteSettings({
    homeContent: current.homeContent,
    theme: current.theme,
    legal: current.legal,
    storeStatus: parsed,
  });

  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}
