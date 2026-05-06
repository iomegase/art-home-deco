import { hasAnalyticsConsent } from "@/lib/analytics/consent";

export function canEnableClarity() {
  return Boolean(process.env.NEXT_PUBLIC_CLARITY_ID) && hasAnalyticsConsent();
}
