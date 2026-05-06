"use client";

import { useMemo, useState } from "react";
import { getConsent, setConsent } from "@/lib/analytics/consent";

type ConsentMode = "hidden" | "simple" | "custom";

export function CookieConsentBanner() {
  const [mode, setMode] = useState<ConsentMode>(() => {
    if (typeof window === "undefined") {
      return "hidden";
    }
    return window.localStorage.getItem("art-home-deco-consent") ? "hidden" : "simple";
  });
  const [analytics, setAnalytics] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return getConsent().analytics;
  });
  const [marketing, setMarketing] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return getConsent().marketing;
  });

  const isOpen = useMemo(() => mode !== "hidden", [mode]);

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="fixed bottom-4 left-4 right-4 z-[200] rounded-2xl border border-line bg-background p-4 shadow-xl md:left-auto md:max-w-xl">
      <p className="text-sm font-bold">Gestion des cookies</p>
      <p className="mt-2 text-xs text-muted">
        Nous utilisons des cookies nécessaires et, avec votre accord, des cookies analytics et marketing.
      </p>

      {mode === "custom" ? (
        <div className="mt-4 space-y-2 text-sm">
          <label className="flex items-center justify-between gap-3">
            <span>Necessaires</span>
            <span className="text-xs font-bold text-muted">Toujours actifs</span>
          </label>
          <label className="flex items-center justify-between gap-3">
            <span>Analytics</span>
            <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span>Marketing</span>
            <input type="checkbox" checked={marketing} onChange={(event) => setMarketing(event.target.checked)} />
          </label>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setConsent({ analytics: true, marketing: true });
            setMode("hidden");
          }}
          className="rounded-full bg-foreground px-4 py-2 text-xs font-bold text-background"
        >
          Accepter
        </button>
        <button
          type="button"
          onClick={() => {
            setConsent({ analytics: false, marketing: false });
            setMode("hidden");
          }}
          className="rounded-full border border-line px-4 py-2 text-xs font-bold"
        >
          Refuser
        </button>
        {mode === "custom" ? (
          <button
            type="button"
            onClick={() => {
              setConsent({ analytics, marketing });
              setMode("hidden");
            }}
            className="rounded-full border border-line px-4 py-2 text-xs font-bold"
          >
            Enregistrer
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              const consent = getConsent();
              setAnalytics(consent.analytics);
              setMarketing(consent.marketing);
              setMode("custom");
            }}
            className="rounded-full border border-line px-4 py-2 text-xs font-bold"
          >
            Personnaliser
          </button>
        )}
      </div>
    </aside>
  );
}
