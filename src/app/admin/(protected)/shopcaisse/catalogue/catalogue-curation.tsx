"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Row = {
  id: string;
  shopcaisseProductId: string;
  name: string;
  sku: string | null;
  priceCents: number | null;
  stockQuantity: number | null;
  hasImage: boolean;
  linkedProductId: string | null;
  status: string | null;
};

type Props = {
  categories: Array<{ familyId: string; title: string }>;
  rows: Row[];
  total: number;
  page: number;
  totalPages: number;
  activeFamilyId: string;
  query: string;
};

function stateLabel(row: Row): string {
  if (!row.linkedProductId) return "non publié";
  return row.status ?? "—";
}

function euros(priceCents: number | null): string {
  return priceCents === null ? "—" : `${(priceCents / 100).toFixed(2)} €`;
}

export function CatalogueCuration(props: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  function toggle(shopcaisseProductId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(shopcaisseProductId)) {
        next.delete(shopcaisseProductId);
      } else {
        next.add(shopcaisseProductId);
      }
      return next;
    });
  }

  function navigate(params: { familyId?: string; q?: string; page?: number }) {
    const search = new URLSearchParams();
    const familyId = params.familyId ?? props.activeFamilyId;
    const q = params.q ?? props.query;
    if (familyId) search.set("familyId", familyId);
    if (q) search.set("q", q);
    if (params.page && params.page > 1) search.set("page", String(params.page));
    router.push(`/admin/shopcaisse/catalogue?${search.toString()}`);
  }

  async function post(url: string, payload: unknown) {
    setBusy(true);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(`Erreur: ${data?.error ?? response.status}`);
        return;
      }
      setSelected(new Set());
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const selectedProductIds = Array.from(selected);
  const selectedDbIds = props.rows
    .filter((row) => selected.has(row.shopcaisseProductId) && row.linkedProductId)
    .map((row) => row.linkedProductId as string);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          Catégorie
          <select
            className="ml-2 border border-line px-2 py-1"
            value={props.activeFamilyId}
            onChange={(event) => navigate({ familyId: event.target.value, page: 1 })}
          >
            <option value="">Toutes</option>
            {props.categories.map((category) => (
              <option key={category.familyId} value={category.familyId}>
                {category.title}
              </option>
            ))}
          </select>
        </label>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const value = new FormData(event.currentTarget).get("q");
            navigate({ q: typeof value === "string" ? value : "", page: 1 });
          }}
        >
          <input name="q" defaultValue={props.query} placeholder="Rechercher…" className="border border-line px-2 py-1" />
          <button type="submit" className="ml-2 border border-line px-3 py-1">Filtrer</button>
        </form>
        <span className="text-sm text-muted">{props.total} article(s)</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || selectedProductIds.length === 0}
          className="border border-line px-3 py-1 disabled:opacity-40"
          onClick={() =>
            post("/api/admin/shopcaisse/import-products", {
              mode: "selected",
              shopcaisseProductIds: selectedProductIds,
              publishByDefault: false,
            })
          }
        >
          Publier la sélection ({selectedProductIds.length})
        </button>
        <button
          type="button"
          disabled={busy || selectedDbIds.length === 0}
          className="border border-line px-3 py-1 disabled:opacity-40"
          onClick={() => post("/api/admin/shopcaisse/products/activate", { productIds: selectedDbIds })}
        >
          Activer ({selectedDbIds.length})
        </button>
        <button
          type="button"
          disabled={busy || selectedDbIds.length === 0}
          className="border border-line px-3 py-1 disabled:opacity-40"
          onClick={() => post("/api/admin/shopcaisse/products/archive", { productIds: selectedDbIds })}
        >
          Archiver ({selectedDbIds.length})
        </button>
        <button
          type="button"
          disabled={busy || !props.activeFamilyId}
          className="border border-line px-3 py-1 disabled:opacity-40"
          onClick={() => post("/api/admin/shopcaisse/products/publish-family", { familyId: props.activeFamilyId })}
        >
          Publier toute la catégorie
        </button>
      </div>

      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            <th className="py-2"></th>
            <th>Nom</th>
            <th>SKU</th>
            <th>Prix</th>
            <th>Stock</th>
            <th>Image</th>
            <th>État</th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row) => (
            <tr key={row.id} className="border-b border-line/50">
              <td className="py-2">
                <input
                  type="checkbox"
                  checked={selected.has(row.shopcaisseProductId)}
                  onChange={() => toggle(row.shopcaisseProductId)}
                />
              </td>
              <td>{row.name}</td>
              <td>{row.sku ?? "—"}</td>
              <td>{euros(row.priceCents)}</td>
              <td>{row.stockQuantity ?? "—"}</td>
              <td>{row.hasImage ? "✓" : "—"}</td>
              <td>{stateLabel(row)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          disabled={props.page <= 1}
          className="border border-line px-3 py-1 disabled:opacity-40"
          onClick={() => navigate({ page: props.page - 1 })}
        >
          Précédent
        </button>
        <span className="text-sm">Page {props.page} / {props.totalPages}</span>
        <button
          type="button"
          disabled={props.page >= props.totalPages}
          className="border border-line px-3 py-1 disabled:opacity-40"
          onClick={() => navigate({ page: props.page + 1 })}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
