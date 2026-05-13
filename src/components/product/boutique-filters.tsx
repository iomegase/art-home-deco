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

export function BoutiqueFilters({
  categories,
  initialQuery,
  initialCategory,
  total,
}: BoutiqueFiltersProps) {
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

      navigate({ q: normalizedQuery, categorie: category, page: 1 });
    }, 300);

    return () => window.clearTimeout(timeoutId);
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

  const tabBase =
    "text-[11px] font-bold uppercase tracking-[0.14em] pb-1 transition-colors whitespace-nowrap";
  const tabActive = "text-[#171717] border-b border-[#171717]";
  const tabInactive = "text-[#b0a99a] hover:text-[#171717]";

  return (
    <div className="mb-16">
      {/* ── Category tabs ── */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[#e5e7eb] pt-8">
        <button
          type="button"
          onClick={() => handleCategoryChange("")}
          className={`${tabBase} ${!category ? tabActive : tabInactive}`}
        >
          Tout
        </button>
        {categories.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => handleCategoryChange(entry.slug)}
            className={`${tabBase} ${category === entry.slug ? tabActive : tabInactive}`}
          >
            {entry.title}
          </button>
        ))}
      </div>

      {/* ── Search + count ── */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un produit…"
          className="w-full max-w-xs border-b border-[#e5e7eb] bg-transparent pb-2 text-[12px] outline-none transition placeholder:text-[#d1d5db] focus:border-[#171717]"
        />

        <div className="flex items-center gap-6">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#b0a99a]">
            <span className="text-[#171717]">{total}</span>{" "}
            {total > 1 ? "produits" : "produit"}
          </span>
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasActiveFilters}
            className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#b0a99a] transition hover:text-[#171717] disabled:opacity-30"
          >
            {isPending ? "…" : "↺ Réinitialiser"}
          </button>
        </div>
      </div>
    </div>
  );
}
