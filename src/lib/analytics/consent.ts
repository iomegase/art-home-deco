import type { ConsentState } from "@/types/analytics";

const CONSENT_STORAGE_KEY = "art-home-deco-consent";

const defaultConsent: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  updatedAt: new Date(0).toISOString(),
  version: 1,
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function getDefaultConsent(): ConsentState {
  return {
    ...defaultConsent,
    updatedAt: new Date().toISOString(),
  };
}

export function getConsent(): ConsentState {
  if (!isBrowser()) {
    return getDefaultConsent();
  }

  const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  if (!raw) {
    return getDefaultConsent();
  }

  try {
    const parsed = JSON.parse(raw) as ConsentState;
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      version: 1,
    };
  } catch {
    return getDefaultConsent();
  }
}

export function setConsent(next: Omit<ConsentState, "necessary" | "updatedAt" | "version">): ConsentState {
  const consent: ConsentState = {
    necessary: true,
    analytics: Boolean(next.analytics),
    marketing: Boolean(next.marketing),
    updatedAt: new Date().toISOString(),
    version: 1,
  };

  if (isBrowser()) {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
    window.dispatchEvent(new CustomEvent("consent-updated", { detail: consent }));
  }

  return consent;
}

export function hasAnalyticsConsent() {
  return getConsent().analytics;
}

export function hasMarketingConsent() {
  return getConsent().marketing;
}
