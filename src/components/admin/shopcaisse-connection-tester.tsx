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
    <section className="bg-white p-6 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Connexion</p>
          <h3 className="mt-2 text-[36px] font-[200] leading-none tracking-[-0.04em] text-[#111]">Tester la connexion</h3>
          <p className="mt-2 text-[12px] text-slate-500">
            Verifie le token Shopcaisse via <code>/v1/authentication</code>.
          </p>
        </div>
        <button
          type="button"
          onClick={handleValidateConnection}
          disabled={loading}
          className="bg-[#111] px-4 py-2 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Verification..." : "Tester la connexion"}
        </button>
      </div>

      {result ? (
        <div className="mt-6 grid gap-4 text-sm">
          <article className="bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <strong className={result.success ? "text-accent" : "text-terracotta"}>
                {result.success ? "Connexion valide" : "Echec de validation"}
              </strong>
              <span>HTTP {result.status}</span>
            </div>
            <p className="mt-2 text-[12px] text-slate-500">{result.message}</p>
            <p className="mt-2 text-[10px] text-slate-400">Verifie le {new Date(result.checkedAt).toLocaleString("fr-FR")}</p>
          </article>

          <article className="grid gap-2 bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
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

          <article className="bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <strong>Resources detectees</strong>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.detectedResources.length > 0 ? (
                result.detectedResources.map((resource) => (
                  <code key={resource} className="bg-[#f7f7f8] px-2 py-1 text-[11px]">
                    {resource}
                  </code>
                ))
              ) : (
                <span className="text-[12px] text-slate-500">Aucune ressource detectee.</span>
              )}
            </div>
          </article>

          <article className="bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <strong>Permissions utiles</strong>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.usefulPermissions.length > 0 ? (
                result.usefulPermissions.map((permission) => (
                  <code key={permission} className="bg-[#f7f7f8] px-2 py-1 text-[11px]">
                    {permission}
                  </code>
                ))
              ) : (
                <span className="text-[12px] text-slate-500">Aucune permission utile detectee.</span>
              )}
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
