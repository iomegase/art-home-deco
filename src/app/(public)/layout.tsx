import type { ReactNode } from "react";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { CookieConsentBanner } from "@/components/analytics/CookieConsentBanner";
import { GoogleTagManager } from "@/components/analytics/GoogleTagManager";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";
import { StoreStatusPopup } from "@/components/layout/store-status-popup";
import { WhatsAppSticky } from "@/components/layout/whatsapp-sticky";
import {
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  stringifyJsonLd,
} from "@/lib/seo/local-business";
import { getSiteSettings } from "@/server/repositories/site-settings.repository";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const { legal, storeStatus } = await getSiteSettings();
  const organizationJsonLd = buildOrganizationJsonLd(legal);
  const websiteJsonLd = buildWebsiteJsonLd(legal);

  return (
    <AnalyticsProvider>
      <GoogleTagManager />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(websiteJsonLd) }}
      />
      <div className="flex min-h-screen flex-col">
        <SiteNav />
        <main className="flex-1">{children}</main>
        {storeStatus.whatsappEnabled ? <WhatsAppSticky /> : null}
        <SiteFooter legal={legal} storeStatus={storeStatus} />
        <StoreStatusPopup storeStatus={storeStatus} />
        <CookieConsentBanner />
      </div>
    </AnalyticsProvider>
  );
}
