"use client";

import { useState } from "react";

type PreviewRow = {
  rowNumber: number;
  barcode: string;
  sku: string;
  name: string;
  matchedProductId: string | null;
  matchedProductTitle: string | null;
  matchedBy: "barcode" | "sku" | null;
  imageUrls: string[];
  invalidImageUrls: string[];
  license: string;
  canApply: boolean;
  message: string;
};

type PreviewResponse = {
  success: boolean;
  totalRows: number;
  recognizedRows: number;
  unrecognizedRows: number;
  invalidUrlRows: number;
  applicableRows: number;
  rows: PreviewRow[];
  error?: string;
};

type ApplyResponse = {
  success: boolean;
  appliedCount: number;
  skippedCount: number;
  errors: Array<{ rowNumber: number; message: string }>;
  error?: string;
};

export function ProductImagesCsvImportPanel() {
  const [csvContent, setCsvContent] = useState("");
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [applyResult, setApplyResult] = useState<ApplyResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFileChange(file: File | null) {
    if (!file) {
      return;
    }

    const text = await file.text();
    setCsvContent(text);
    setPreview(null);
    setApplyResult(null);
  }

  async function handlePreview() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/products/images/import-csv/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvContent }),
      });
      const payload = (await response.json()) as PreviewResponse;
      setPreview(payload);
    } finally {
      setLoading(false);
    }
  }

  async function handleApply() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/products/images/import-csv/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvContent }),
      });
      const payload = (await response.json()) as ApplyResponse;
      setApplyResult(payload);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <p className="section-title text-terracotta">Catalogue</p>
      <h2 className="mt-2 font-serif text-4xl">Import CSV images fournisseur</h2>
      <div className="mt-8 grid gap-6 border border-line bg-surface p-6">
        <p className="text-sm text-muted">
          Format supporte: `barcode,sku,name,image_url,image_2_url,image_3_url,alt,source,license`.
          Les images sont telechargees cote serveur puis stockees dans R2. Aucun hotlinking.
        </p>
        <label className="text-sm font-bold">
          Fichier CSV
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
            className="mt-2 block w-full border border-line bg-background px-3 py-3"
          />
        </label>
        <label className="text-sm font-bold">
          Contenu CSV
          <textarea
            value={csvContent}
            onChange={(event) => setCsvContent(event.target.value)}
            rows={10}
            className="mt-2 w-full border border-line bg-background px-3 py-3 font-mono text-xs"
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handlePreview}
            disabled={loading || csvContent.trim().length === 0}
            className="border border-line px-4 py-2 text-sm font-bold disabled:opacity-60"
          >
            {loading ? "Traitement..." : "Previsualiser"}
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={loading || !preview || !preview.success}
            className="bg-brand px-4 py-2 text-sm font-bold text-brand-contrast disabled:opacity-60"
          >
            {loading ? "Traitement..." : "Importer les images autorisees"}
          </button>
        </div>
      </div>

      {preview ? (
        <article className="mt-8 border border-line bg-surface p-6 text-sm">
          <div className="grid gap-2 md:grid-cols-5">
            <div className="border border-line p-3">Lignes: {preview.totalRows}</div>
            <div className="border border-line p-3">Reconnu: {preview.recognizedRows}</div>
            <div className="border border-line p-3">Non reconnu: {preview.unrecognizedRows}</div>
            <div className="border border-line p-3">URLs invalides: {preview.invalidUrlRows}</div>
            <div className="border border-line p-3">Applicables: {preview.applicableRows}</div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-left text-sm">
              <thead className="bg-surface text-xs uppercase text-muted">
                <tr>
                  <th className="px-3 py-2">Ligne</th>
                  <th className="px-3 py-2">Produit CSV</th>
                  <th className="px-3 py-2">Match</th>
                  <th className="px-3 py-2">Licence</th>
                  <th className="px-3 py-2">URLs valides</th>
                  <th className="px-3 py-2">URLs invalides</th>
                  <th className="px-3 py-2">Etat</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 50).map((row) => (
                  <tr key={row.rowNumber} className="border-t border-line">
                    <td className="px-3 py-3">{row.rowNumber}</td>
                    <td className="px-3 py-3">
                      <div className="font-bold">{row.name || "-"}</div>
                      <div className="text-xs text-muted">Barcode {row.barcode || "-"} · SKU {row.sku || "-"}</div>
                    </td>
                    <td className="px-3 py-3">{row.matchedProductTitle ? `${row.matchedProductTitle} (${row.matchedBy})` : "-"}</td>
                    <td className="px-3 py-3">{row.license || "-"}</td>
                    <td className="px-3 py-3">{row.imageUrls.length}</td>
                    <td className="px-3 py-3">{row.invalidImageUrls.length}</td>
                    <td className="px-3 py-3">{row.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      ) : null}

      {applyResult ? (
        <article className="mt-8 border border-line bg-surface p-6 text-sm">
          <div className="grid gap-2 md:grid-cols-2">
            <div className="border border-line p-3">Images appliquees: {applyResult.appliedCount}</div>
            <div className="border border-line p-3">Lignes ignorees: {applyResult.skippedCount}</div>
          </div>
          <div className="mt-4 grid gap-2">
            {applyResult.errors.length > 0 ? applyResult.errors.map((error) => (
              <div key={`${error.rowNumber}-${error.message}`} className="border border-line p-3 text-muted">
                Ligne {error.rowNumber}: {error.message}
              </div>
            )) : <p className="text-muted">Aucune erreur.</p>}
          </div>
        </article>
      ) : null}
    </section>
  );
}
