import { Prisma } from "@prisma/client";
import { legalSettingsFromEnv } from "@/data/legal-pages";
import { db } from "@/server/db/client";
import { isDatabaseUnavailableError } from "@/server/db/client";
import {
  defaultHomeContent,
  defaultStoreStatusSettings,
  defaultThemeSettings,
  type HomeContent,
  type LegalSettings,
  type StoreStatusSettings,
  type ThemeSettings,
} from "@/features/admin-home/types";

const SITE_SETTINGS_KEY = "default";
const LEGAL_STORAGE_KEY = "_legalSettings";
const STORE_STATUS_STORAGE_KEY = "_storeStatusSettings";
const BROKEN_ADVICE_CARD_IMAGE_URL =
  "https://images.unsplash.com/photo-1616628182509-6e05d4a2f079?auto=format&fit=crop&w=1200&q=85";

function asJsonObject(value: Prisma.JsonValue): Record<string, unknown> {
  return typeof value === "object" && value && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asHomeContent(value: Prisma.JsonValue): HomeContent {
  const source = asJsonObject(value);
  const homeSource = { ...source };
  delete homeSource[LEGAL_STORAGE_KEY];
  delete homeSource[STORE_STATUS_STORAGE_KEY];
  const merged = {
    ...defaultHomeContent,
    ...(homeSource as Partial<HomeContent>),
  };

  if (merged.adviceCardImageUrl === BROKEN_ADVICE_CARD_IMAGE_URL) {
    merged.adviceCardImageUrl = defaultHomeContent.adviceCardImageUrl;
  }

  return merged;
}

function asThemeSettings(value: Prisma.JsonValue): ThemeSettings {
  const source = asJsonObject(value);
  return {
    ...defaultThemeSettings,
    ...(source as Partial<ThemeSettings>),
  };
}

function asLegalSettings(value: unknown): LegalSettings {
  const source =
    typeof value === "object" && value && !Array.isArray(value)
      ? (value as Partial<LegalSettings>)
      : {};

  return {
    ...legalSettingsFromEnv,
    ...source,
  };
}

function extractLegalSettings(homeContentJson: Prisma.JsonValue): LegalSettings {
  const source = asJsonObject(homeContentJson);
  return asLegalSettings(source[LEGAL_STORAGE_KEY]);
}

function asStoreStatusSettings(value: unknown): StoreStatusSettings {
  const source =
    typeof value === "object" && value && !Array.isArray(value)
      ? (value as Partial<StoreStatusSettings>)
      : {};

  return {
    ...defaultStoreStatusSettings,
    ...source,
  };
}

function extractStoreStatusSettings(homeContentJson: Prisma.JsonValue): StoreStatusSettings {
  const source = asJsonObject(homeContentJson);
  return asStoreStatusSettings(source[STORE_STATUS_STORAGE_KEY]);
}

export async function getSiteSettings() {
  let settings: Awaited<ReturnType<typeof db.siteSetting.findUnique>> = null;

  try {
    settings = await db.siteSetting.findUnique({ where: { key: SITE_SETTINGS_KEY } });
  } catch (error) {
    if (
      (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021")
      || isDatabaseUnavailableError(error)
    ) {
      return {
        homeContent: defaultHomeContent,
        theme: defaultThemeSettings,
        legal: legalSettingsFromEnv,
        storeStatus: defaultStoreStatusSettings,
      };
    }
    throw error;
  }

  if (!settings) {
    return {
      homeContent: defaultHomeContent,
      theme: defaultThemeSettings,
      legal: legalSettingsFromEnv,
      storeStatus: defaultStoreStatusSettings,
    };
  }

  return {
    homeContent: asHomeContent(settings.homeContentJson),
    theme: asThemeSettings(settings.themeJson),
    legal: extractLegalSettings(settings.homeContentJson),
    storeStatus: extractStoreStatusSettings(settings.homeContentJson),
  };
}

export async function upsertSiteSettings(input: {
  homeContent: HomeContent;
  theme: ThemeSettings;
  legal?: LegalSettings;
  storeStatus?: StoreStatusSettings;
}) {
  const existing = await getSiteSettings();
  const legal = input.legal ?? existing.legal;
  const storeStatus = input.storeStatus ?? existing.storeStatus;
  const homeContentJson = {
    ...input.homeContent,
    [LEGAL_STORAGE_KEY]: legal,
    [STORE_STATUS_STORAGE_KEY]: storeStatus,
  };

  try {
    await db.siteSetting.upsert({
      where: { key: SITE_SETTINGS_KEY },
      update: {
        homeContentJson,
        themeJson: input.theme,
      },
      create: {
        key: SITE_SETTINGS_KEY,
        homeContentJson,
        themeJson: input.theme,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021"
    ) {
      throw new Error("La table SiteSetting est absente. Lancez une migration Prisma.");
    }
    throw error;
  }
}
