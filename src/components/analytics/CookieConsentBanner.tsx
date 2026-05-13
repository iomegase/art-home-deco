"use client";

import { useState } from "react";
import Image from "next/image"; // Importation du composant Image
import { getConsent, setConsent } from "@/lib/analytics/consent";

type ConsentMode = "simple" | "custom";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return !window.localStorage.getItem("art-home-deco-consent");
  });
  const [mode, setMode] = useState<ConsentMode>("simple");
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const handleAcceptAll = () => {
    setConsent({ analytics: true, marketing: true });
    setIsVisible(false);
  };

  const handleDeclineAll = () => {
    setConsent({ analytics: false, marketing: false });
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    setConsent({ analytics, marketing });
    setIsVisible(false);
  };

  const toggleCustomMode = () => {
    const current = getConsent();
    setAnalytics(current.analytics);
    setMarketing(current.marketing);
    setMode("custom");
  };

  if (!isVisible) return null;

  return (
    <aside 
      role="dialog"
      aria-labelledby="cookie-title"
      className="fixed bottom-4 left-1/2 z-[200] w-[calc(100%-2rem)] max-w-full -translate-x-1/2 rounded-xl bg-background p-6 shadow-2xl md:max-w-md lg:max-w-lg"
    >
      <div className="space-y-5">
        <header className="space-y-3">
          {/* Section Logo */}
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="Logo Art Home Deco" 
              width={40} 
              height={40} 
              className="h-10 w-auto object-contain"
            />
            <h2 id="cookie-title" className="text-lg font-semibold tracking-wide text-[#171717]">
              Gestion des cookies
            </h2>
          </div>
          
          <p className="text-[13px] italic font-semibold pl-10 text-muted-foreground leading-relaxed">
            Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser nos contenus.
          </p>
        </header>

        {mode === "custom" && (
          <div className="space-y-3 rounded-xl bg-muted/50 p-4 border border-border/50">
            <CookieOption
              title="Essentiels"
              description="Nécessaires au bon fonctionnement du site."
              checked={true}
              disabled={true}
            />
            <CookieOption
              title="Statistiques"
              description="Analyse anonyme de votre navigation."
              checked={analytics}
              onChange={setAnalytics}
            />
            <CookieOption
              title="Marketing"
              description="Publicités adaptées à vos centres d'intérêt."
              checked={marketing}
              onChange={setMarketing}
            />
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:items-center">
          {mode === "simple" ? (
            <>
              <button
                onClick={toggleCustomMode}
                className="order-3 py-2 text-xs uppercase font-light tracking-widest underline-offset-4 hover:underline sm:order-1 sm:mr-auto"
              >
                Personnaliser
              </button>
              <button
                onClick={handleDeclineAll}
                className="inline-flex h-10 items-center uppercase tracking-widest justify-center rounded-sm hover:border-pink-500/50 hover:text-white  bg-background px-5 text-xs font-light transition-colors hover:bg-accent"
              >
                Refuser
              </button>
              <button
                onClick={handleAcceptAll}
                className="inline-flex h-10 items-center uppercase tracking-widest text-white font-light justify-center rounded-sm hover:text-black hover:bg-white bg-black hover:border border-black/30  px-5 text-xs transition-colors "
              >
                Accepter 
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setMode("simple")}
                className="h-10 px-4 text-xs font-medium text-muted-foreground"
              >
                Retour
              </button>
              <button
                onClick={handleSaveCustom}
                className="inline-flex h-10 items-center justify-center rounded-none bg-foreground px-6 text-xs font-bold text-background transition-colors hover:opacity-90"
              >
                Enregistrer mes préférences
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

// Sous-composant pour les options de cookies
function CookieOption({ 
  title, 
  description, 
  checked, 
  disabled, 
  onChange 
}: { 
  title: string; 
  description: string; 
  checked: boolean; 
  disabled?: boolean; 
  onChange?: (checked: boolean) => void; 
}) {
  return (
    <label
      className={`flex items-center justify-between gap-4 ${
        disabled ? "cursor-default" : "cursor-pointer"
      }`}
    >
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-[11px] text-muted-foreground leading-tight">{description}</span>
      </div>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
      />
    </label>
  );
}
