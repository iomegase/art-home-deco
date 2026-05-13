import type { ReactNode } from "react";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { CookieConsentBanner } from "@/components/analytics/CookieConsentBanner";
import { GoogleTagManager } from "@/components/analytics/GoogleTagManager";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";
import { StoreStatusPopup } from "@/components/layout/store-status-popup";
import { WhatsAppSticky } from "@/components/layout/whatsapp-sticky";
import { getSiteSettings } from "@/server/repositories/site-settings.repository";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const { storeStatus } = await getSiteSettings();

  return (
    <AnalyticsProvider>
      <GoogleTagManager />
      <div className="flex min-h-screen flex-col">
        <SiteNav />
        <main className="flex-1">{children}</main>
        {storeStatus.whatsappEnabled ? <WhatsAppSticky /> : null}
        <SiteFooter storeStatus={storeStatus} />
        <StoreStatusPopup storeStatus={storeStatus} />
        <CookieConsentBanner />
      </div>
    </AnalyticsProvider>
  );
}
