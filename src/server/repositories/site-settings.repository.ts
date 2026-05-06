import { Prisma } from "@prisma/client";
import { db } from "@/server/db/client";
import {
  defaultHomeContent,
  defaultThemeSettings,
  type HomeContent,
  type ThemeSettings,
} from "@/features/admin-home/types";

const SITE_SETTINGS_KEY = "default";
const BROKEN_ADVICE_CARD_IMAGE_URL =
  "https://images.unsplash.com/photo-1616628182509-6e05d4a2f079?auto=format&fit=crop&w=1200&q=85";

function asHomeContent(value: Prisma.JsonValue): HomeContent {
  const source = typeof value === "object" && value ? value : {};
  const merged = {
    ...defaultHomeContent,
    ...(source as Partial<HomeContent>),
  };

  if (merged.adviceCardImageUrl === BROKEN_ADVICE_CARD_IMAGE_URL) {
    merged.adviceCardImageUrl = defaultHomeContent.adviceCardImageUrl;
  }

  return merged;
}

function asThemeSettings(value: Prisma.JsonValue): ThemeSettings {
  const source = typeof value === "object" && value ? value : {};
  return {
    ...defaultThemeSettings,
    ...(source as Partial<ThemeSettings>),
  };
}

export async function getSiteSettings() {
  let settings: Awaited<ReturnType<typeof db.siteSetting.findUnique>> = null;

  try {
    settings = await db.siteSetting.findUnique({ where: { key: SITE_SETTINGS_KEY } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021"
    ) {
      return {
        homeContent: defaultHomeContent,
        theme: defaultThemeSettings,
      };
    }
    throw error;
  }

  if (!settings) {
    return {
      homeContent: defaultHomeContent,
      theme: defaultThemeSettings,
    };
  }

  return {
    homeContent: asHomeContent(settings.homeContentJson),
    theme: asThemeSettings(settings.themeJson),
  };
}

export async function upsertSiteSettings(input: { homeContent: HomeContent; theme: ThemeSettings }) {
  try {
    await db.siteSetting.upsert({
      where: { key: SITE_SETTINGS_KEY },
      update: {
        homeContentJson: input.homeContent,
        themeJson: input.theme,
      },
      create: {
        key: SITE_SETTINGS_KEY,
        homeContentJson: input.homeContent,
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
