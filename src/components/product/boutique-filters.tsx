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
    <section className="mt-8 border border-line bg-surface p-5 md:p-6">
      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.75fr_auto] lg:items-end">
        <label className="grid gap-2 text-sm font-bold text-foreground">
          <span>Recherche</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un produit…"
            className="w-full border border-line bg-background px-4 py-3 text-base outline-none transition placeholder:text-muted focus:border-foreground"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-foreground">
          <span>Categorie</span>
          <select
            value={category}
            onChange={(event) => handleCategoryChange(event.target.value)}
            className="w-full border border-line bg-background px-4 py-3 text-base outline-none transition focus:border-foreground"
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
          className="border border-line px-5 py-3 text-sm font-bold text-foreground transition hover:border-foreground disabled:cursor-not-allowed disabled:opacity-45"
        >
          Reinitialiser
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <span className="font-bold text-foreground">{total}</span>
          <span>{total > 1 ? "produits visibles" : "produit visible"}</span>
          {query.trim() ? (
            <span className="border border-line bg-background px-3 py-1 text-xs font-bold text-foreground">
              Recherche: {query.trim()}
            </span>
          ) : null}
          {category ? (
            <span className="border border-line bg-background px-3 py-1 text-xs font-bold text-foreground">
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
