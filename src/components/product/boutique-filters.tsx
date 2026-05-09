"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { trackFilterUse, trackSearch } from "@/lib/analytics/events";
import type { CatalogCategory } from "@/server/repositories/catalog.repository";
import { buildBoutiqueHref } from "@/features/product/boutique-query";

type BoutiqueFiltersProps = {
  categories: CatalogCategory[];
  initialQuery: string;
  initialCategory: string;
  total: number;
};

export function BoutiqueFilters({ categories, initialQuery, initialCategory, total }: BoutiqueFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);

  const hasActiveFilters = useMemo(
    () => query.trim().length > 0 || category.length > 0,
    [category, query],
  );

  function navigate(next: { q?: string; categorie?: string; page?: number }) {
    const href = buildBoutiqueHref(next);
    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const currentQuery = searchParams.get("q") ?? "";
      const currentCategory = searchParams.get("categorie") ?? "";
      const normalizedQuery = query.trim();

      if (normalizedQuery === currentQuery && category === currentCategory) {
        return;
      }

      if (normalizedQuery) {
        trackSearch(normalizedQuery);
      }

      navigate({
        q: normalizedQuery,
        categorie: category,
        page: 1,
      });
    }, 300);

    return () => window.clearTimeout(timeoutId);
    // The debounced navigation is keyed only by the controlled filters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category]);

  function handleCategoryChange(nextCategory: string) {
    setCategory(nextCategory);
    trackFilterUse("category", nextCategory || "all");
  }

  function handleReset() {
    setQuery("");
    setCategory("");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }

  return (
    <section className="mb-12 border-y border-slate-100 bg-white py-8">
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.75fr_auto] lg:items-end">
        <label className="grid gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
          <span>Recherche</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un produit…"
            className="w-full border-b border-slate-200 bg-transparent px-0 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-slate-800"
          />
        </label>

        <label className="grid gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
          <span>Categorie</span>
          <select
            value={category}
            onChange={(event) => handleCategoryChange(event.target.value)}
            className="w-full border-b border-slate-200 bg-transparent px-0 py-3 text-sm outline-none transition focus:border-slate-800"
          >
            <option value="">Toutes les categories</option>
            {categories.map((entry) => (
              <option key={entry.id} value={entry.slug}>
                {entry.title}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleReset}
          disabled={!hasActiveFilters}
          className="border border-slate-200 px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Reinitialiser
        </button>
      </div>

      <div className="mt-8 flex flex-col gap-3 text-sm font-light text-slate-500 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <span className="font-bold text-foreground">{total}</span>
          <span>{total > 1 ? "produits visibles" : "produit visible"}</span>
          {query.trim() ? (
            <span className="bg-slate-50 px-3 py-1 text-xs text-slate-600 rounded-sm">
              Recherche: {query.trim()}
            </span>
          ) : null}
          {category ? (
            <span className="bg-slate-50 px-3 py-1 text-xs text-slate-600 rounded-sm">
              Categorie: {categories.find((entry) => entry.slug === category)?.title ?? category}
            </span>
          ) : null}
        </div>

        <div className="min-h-5 text-xs font-bold uppercase tracking-[0.18em] text-muted">
          {isPending ? "Mise a jour..." : "URL partageable"}
        </div>
      </div>
    </section>
  );
}
