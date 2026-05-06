import { hasAnalyticsConsent } from "@/lib/analytics/consent";
import { pushToDataLayer } from "@/lib/analytics/gtm";
import type { AnalyticsCart, DataLayerEvent } from "@/types/analytics";

function isAnalyticsEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true";
}

export function trackPageView(path: string) {
  if (!hasAnalyticsConsent()) {
    return;
  }
  if (!isAnalyticsEnabled()) {
    return;
  }

  pushToDataLayer({
    event: "page_view",
    page_path: path,
  });
}

export function trackEvent(event: string, payload: Record<string, unknown> = {}) {
  if (!hasAnalyticsConsent()) {
    return;
  }
  if (!isAnalyticsEnabled()) {
    return;
  }

  const dataLayerEvent: DataLayerEvent = {
    event,
    ...payload,
  };

  pushToDataLayer(dataLayerEvent);
}

export function trackEcommerceEvent(event: string, ecommerce: AnalyticsCart | Record<string, unknown>) {
  if (!hasAnalyticsConsent()) {
    return;
  }
  if (!isAnalyticsEnabled()) {
    return;
  }

  pushToDataLayer({
    event,
    ecommerce,
  });
}
