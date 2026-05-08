import type { CSSProperties, ReactNode } from "react";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { CookieConsentBanner } from "@/components/analytics/CookieConsentBanner";
import { GoogleTagManager } from "@/components/analytics/GoogleTagManager";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";
import { WhatsAppSticky } from "@/components/layout/whatsapp-sticky";
import { getSiteSettings } from "@/server/repositories/site-settings.repository";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const { theme } = await getSiteSettings();

  return (
    <AnalyticsProvider>
      <GoogleTagManager />
      <div
        className="flex min-h-screen flex-col"
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
        <SiteNav />
        <main className="flex-1">{children}</main>
        <WhatsAppSticky />
        <SiteFooter />
      </div>
      <CookieConsentBanner />
    </AnalyticsProvider>
  );
}
