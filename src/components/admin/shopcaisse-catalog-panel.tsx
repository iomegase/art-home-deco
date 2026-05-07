"use client";

import { useState } from "react";

type PreviewItem = {
  externalProductId: string;
  externalVariantId?: string | null;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  priceCents?: number | null;
  currency?: string | null;
  stockQuantity?: number | null;
  familyName?: string | null;
};

type PreviewResponse = {
  success: boolean;
  productsCount: number;
  pricesCount: number;
  stocksCount: number;
  sampleItems: PreviewItem[];
  checkedAt: string;
  message?: string;
};

type SyncResponse = {
  success: boolean;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errors: Array<{ externalProductId: string; message: string }>;
  syncedAt: string;
};

type Props = {
  lastSuccessAt?: string;
  lastErrorMessage?: string;
};

export function ShopcaisseCatalogPanel({ lastSuccessAt, lastErrorMessage }: Props) {
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  async function handlePreview() {
    setPreviewLoading(true);

    try {
      const response = await fetch("/api/shopcaisse/catalog/preview", {
        method: "GET",
        cache: "no-store",
      });
      const payload = (await response.json()) as PreviewResponse;
      setPreview(payload);
    } catch {
      setPreview({
        success: false,
        productsCount: 0,
        pricesCount: 0,
        stocksCount: 0,
        sampleItems: [],
        checkedAt: new Date().toISOString(),
        message: "Impossible de previsualiser le catalogue Shopcaisse.",
      });
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleSync() {
    setSyncLoading(true);

    try {
      const response = await fetch("/api/shopcaisse/catalog/sync", {
        method: "POST",
      });
      const payload = (await response.json()) as SyncResponse;
      setSyncResult(payload);
    } catch {
      setSyncResult({
        success: false,
        createdCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        errors: [{ externalProductId: "unknown", message: "Impossible de synchroniser le catalogue Shopcaisse." }],
        syncedAt: new Date().toISOString(),
      });
    } finally {
      setSyncLoading(false);
    }
  }

  return (
    <section className="border border-line bg-surface p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="font-serif text-3xl">Catalogue Shopcaisse</h3>
          <p className="mt-2 text-sm text-muted">
            Lecture seule depuis Shopcaisse, puis sync du cache Prisma par upsert.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handlePreview}
            disabled={previewLoading}
            className="border border-line px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {previewLoading ? "Previsualisation..." : "Previsualiser le catalogue"}
          </button>
          <button
            type="button"
            onClick={handleSync}
            disabled={syncLoading}
            className="bg-brand px-4 py-2 text-sm font-bold text-brand-contrast disabled:cursor-not-allowed disabled:opacity-60"
          >
            {syncLoading ? "Synchronisation..." : "Synchroniser le catalogue"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 text-sm md:grid-cols-2">
        <article className="border border-line p-4">
          <strong>Dernier succes</strong>
          <p className="mt-2 text-muted">
            {lastSuccessAt ? new Date(lastSuccessAt).toLocaleString("fr-FR") : "Aucun succes catalogue enregistre."}
          </p>
        </article>
        <article className="border border-line p-4">
          <strong>Derniere erreur</strong>
          <p className="mt-2 text-muted">{lastErrorMessage ?? "Aucune erreur catalogue enregistree."}</p>
        </article>
      </div>

      {preview ? (
        <div className="mt-6 grid gap-4">
          <article className="border border-line p-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <strong className={preview.success ? "text-accent" : "text-terracotta"}>
                {preview.success ? "Previsualisation OK" : "Previsualisation en echec"}
              </strong>
              <span>{new Date(preview.checkedAt).toLocaleString("fr-FR")}</span>
            </div>
            {preview.message ? <p className="mt-2 text-muted">{preview.message}</p> : null}
            <div className="mt-4 grid gap-2 md:grid-cols-3">
              <div className="border border-line p-3">Produits: {preview.productsCount}</div>
              <div className="border border-line p-3">Prix: {preview.pricesCount}</div>
              <div className="border border-line p-3">Stocks: {preview.stocksCount}</div>
            </div>
          </article>

          <article className="border border-line p-4 text-sm">
            <strong>Exemples detectes</strong>
            <div className="mt-4 grid gap-3">
              {preview.sampleItems.length > 0 ? (
                preview.sampleItems.slice(0, 5).map((item) => (
                  <div key={`${item.externalProductId}:${item.externalVariantId ?? "base"}`} className="border border-line p-3">
                    <div className="flex items-center justify-between gap-4">
                      <strong>{item.name}</strong>
                      <code>{item.externalProductId}</code>
                    </div>
                    <p className="mt-2 text-muted">
                      SKU {item.sku ?? "-"} | Barcode {item.barcode ?? "-"} | Prix {item.priceCents ?? "-"} | Stock {item.stockQuantity ?? "-"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted">Aucun produit exemple disponible.</p>
              )}
            </div>
          </article>
        </div>
      ) : null}

      {syncResult ? (
        <article className="mt-6 border border-line p-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <strong className={syncResult.success ? "text-accent" : "text-terracotta"}>
              {syncResult.success ? "Synchronisation OK" : "Synchronisation en echec"}
            </strong>
            <span>{new Date(syncResult.syncedAt).toLocaleString("fr-FR")}</span>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            <div className="border border-line p-3">Crees: {syncResult.createdCount}</div>
            <div className="border border-line p-3">Mis a jour: {syncResult.updatedCount}</div>
            <div className="border border-line p-3">Ignores: {syncResult.skippedCount}</div>
          </div>
          <div className="mt-4">
            <strong>Erreurs</strong>
            <div className="mt-3 grid gap-2">
              {syncResult.errors.length > 0 ? (
                syncResult.errors.slice(0, 10).map((error) => (
                  <div key={`${error.externalProductId}:${error.message}`} className="border border-line p-3 text-muted">
                    <code>{error.externalProductId}</code> {error.message}
                  </div>
                ))
              ) : (
                <p className="text-muted">Aucune erreur.</p>
              )}
            </div>
          </div>
        </article>
      ) : null}
    </section>
  );
}
