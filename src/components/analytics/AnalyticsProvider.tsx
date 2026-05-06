"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getConsent } from "@/lib/analytics/consent";
import { trackPageView } from "@/lib/analytics/ga4";
import { pushToDataLayer } from "@/lib/analytics/gtm";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const consent = getConsent();

    pushToDataLayer({
      event: "consent_updated",
      consent_analytics: consent.analytics,
      consent_marketing: consent.marketing,
    });
  }, []);

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return <>{children}</>;
}
