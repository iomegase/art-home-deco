"use client";

import { useState } from "react";

type ValidationResponse = {
  success: boolean;
  status: number;
  message: string;
  companyId: string | null;
  storeId: string | null;
  posId: string | null;
  detectedResources: string[];
  usefulPermissions: string[];
  checkedAt: string;
};

export function ShopcaisseConnectionTester() {
  const [result, setResult] = useState<ValidationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleValidateConnection() {
    setLoading(true);

    try {
      const response = await fetch("/api/shopcaisse/validate", {
        method: "GET",
        cache: "no-store",
      });
      const payload = (await response.json()) as ValidationResponse;
      setResult(payload);
    } catch {
      setResult({
        success: false,
        status: 500,
        message: "Impossible de contacter le serveur de validation Shopcaisse.",
        companyId: null,
        storeId: null,
        posId: null,
        detectedResources: [],
        usefulPermissions: [],
        checkedAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="border border-line bg-surface p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-serif text-3xl">Tester la connexion</h3>
          <p className="mt-2 text-sm text-muted">
            Verifie le token Shopcaisse via <code>/v1/authentication</code>.
          </p>
        </div>
        <button
          type="button"
          onClick={handleValidateConnection}
          disabled={loading}
          className="bg-brand px-4 py-2 text-sm font-bold text-brand-contrast disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Verification..." : "Tester la connexion"}
        </button>
      </div>

      {result ? (
        <div className="mt-6 grid gap-4 text-sm">
          <article className="border border-line p-4">
            <div className="flex items-center justify-between gap-4">
              <strong className={result.success ? "text-accent" : "text-terracotta"}>
                {result.success ? "Connexion valide" : "Echec de validation"}
              </strong>
              <span>HTTP {result.status}</span>
            </div>
            <p className="mt-2 text-muted">{result.message}</p>
            <p className="mt-2 text-xs text-muted">Verifie le {new Date(result.checkedAt).toLocaleString("fr-FR")}</p>
          </article>

          <article className="grid gap-2 border border-line p-4">
            <div className="flex items-center justify-between gap-4">
              <span>Company ID</span>
              <code>{result.companyId ?? "-"}</code>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Store ID</span>
              <code>{result.storeId ?? "-"}</code>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>POS ID</span>
              <code>{result.posId ?? "-"}</code>
            </div>
          </article>

          <article className="border border-line p-4">
            <strong>Resources detectees</strong>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.detectedResources.length > 0 ? (
                result.detectedResources.map((resource) => (
                  <code key={resource} className="border border-line px-2 py-1">
                    {resource}
                  </code>
                ))
              ) : (
                <span className="text-muted">Aucune ressource detectee.</span>
              )}
            </div>
          </article>

          <article className="border border-line p-4">
            <strong>Permissions utiles</strong>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.usefulPermissions.length > 0 ? (
                result.usefulPermissions.map((permission) => (
                  <code key={permission} className="border border-line px-2 py-1">
                    {permission}
                  </code>
                ))
              ) : (
                <span className="text-muted">Aucune permission utile detectee.</span>
              )}
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
