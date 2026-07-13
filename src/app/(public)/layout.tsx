import type { ReactNode } from "react";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { CookieConsentBanner } from "@/components/analytics/CookieConsentBanner";
import { GoogleTagManager } from "@/components/analytics/GoogleTagManager";
import { MaintenanceScreen } from "@/components/layout/maintenance-screen";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";
import { StoreStatusPopup } from "@/components/layout/store-status-popup";
import { WhatsAppSticky } from "@/components/layout/whatsapp-sticky";
import { shouldShowMaintenance } from "@/features/admin-home/maintenance";
import {
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  stringifyJsonLd,
} from "@/lib/seo/local-business";
import { getSiteSettings } from "@/server/repositories/site-settings.repository";
import { getAdminSession } from "@/server/security/auth";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const { legal, storeStatus, maintenance } = await getSiteSettings();
  const adminSession = await getAdminSession();

  if (shouldShowMaintenance(maintenance.enabled, Boolean(adminSession))) {
    return <MaintenanceScreen legal={legal} />;
  }

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
