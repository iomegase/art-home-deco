import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Geist } from "next/font/google";
import { Manrope } from "next/font/google";
import { defaultThemeSettings } from "@/features/admin-home/types";
import { getSiteUrl } from "@/lib/site-url";
import { getSiteSettings } from "@/server/repositories/site-settings.repository";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-elms-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Art Home Déco | Boutique de decoration a Saint-Gervais-les-Bains",
    template: "%s | Art Home Déco",
  },
  description:
    "Boutique de decoration a Saint-Gervais-les-Bains : mobilier, luminaires, senteurs, textiles et objets deco au pied du Mont-Blanc.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Art Home Déco",
    url: getSiteUrl(),
    title: "Art Home Déco | Boutique de decoration a Saint-Gervais-les-Bains",
    description:
      "Objets deco, mobilier, luminaires, senteurs et creations pour un interieur chaleureux inspire des Alpes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Art Home Déco | Boutique de decoration a Saint-Gervais-les-Bains",
    description:
      "Objets deco, mobilier, luminaires, senteurs et creations pour un interieur chaleureux inspire des Alpes.",
  },
  icons: {
    icon: [
      { url: "/favicons-package/favicon.ico", sizes: "any" },
      { url: "/favicons-package/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicons-package/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicons-package/favicon-48x48.png", type: "image/png", sizes: "48x48" },
    ],
    apple: [{ url: "/favicons-package/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicons-package/favicon.ico"],
  },
  manifest: "/favicons-package/site.webmanifest",
  other: {
    "msapplication-TileColor": "#ffffff",
    "msapplication-TileImage": "/favicons-package/mstile-150x150.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let theme = defaultThemeSettings;

  try {
    const settings = await getSiteSettings();
    theme = settings.theme;
  } catch (error) {
    console.error("Failed to load site settings in root layout, using defaults:", error);
  }

  return (
    <html lang="fr" className={`${geist.variable} ${manrope.variable} h-full antialiased`}>
      <body
        suppressHydrationWarning
        className="min-h-full bg-background text-foreground"
        style={
          {
            "--background": theme.background,
            "--foreground": theme.foreground,
            "--surface": theme.surface,
            "--surface-strong": theme.surfaceStrong,
            "--brand": theme.brand,
            "--brand-contrast": theme.brandContrast,
            "--muted": theme.muted,
            "--accent": theme.accent,
            "--terracotta": theme.terracotta,
            "--clay": theme.clay,
            "--line": theme.line,
            "--font-display": theme.fontDisplay,
            "--font-body": theme.fontBody,
            "--font-nav": theme.fontNav,
          } as CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
