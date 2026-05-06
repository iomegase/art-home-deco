import { hasMarketingConsent } from "@/lib/analytics/consent";
import type { AnalyticsOrder, AnalyticsProduct } from "@/types/analytics";

function canTrackMeta() {
  return Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID) && hasMarketingConsent();
}

export function trackMetaViewContent(_unusedProduct: AnalyticsProduct) {
  void _unusedProduct;
  if (!canTrackMeta()) {
    return;
  }
}

export function trackMetaAddToCart(_unusedProduct: AnalyticsProduct) {
  void _unusedProduct;
  if (!canTrackMeta()) {
    return;
  }
}

export function trackMetaInitiateCheckout() {
  if (!canTrackMeta()) {
    return;
  }
}

export function trackMetaPurchase(_unusedOrder: AnalyticsOrder) {
  void _unusedOrder;
  if (!canTrackMeta()) {
    return;
  }
}
