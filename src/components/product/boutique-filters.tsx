"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, RotateCcw } from "lucide-react";

type Category = {
  slug: string;
  title: string;
};

type BoutiqueFiltersProps = {
  categories: Category[];
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

  const [search, setSearch] = useState(initialQuery);

  const updateFilters = (newCategory?: string, newSearch?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Catégorie
    if (newCategory !== undefined) {
      if (newCategory === "") params.delete("categorie");
      else params.set("categorie", newCategory);
    }
    
    // Recherche
    if (newSearch !== undefined) {
      if (newSearch === "") params.delete("q");
      else params.set("q", newSearch);
    }

    // Retour à la page 1 lors d'un nouveau filtre
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(undefined, search);
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* LIGNE 1 : Catégories */}
      <div className="flex flex-wrap items-center gap-8">
        <button
          onClick={() => updateFilters("", undefined)}
          className={`text-[11px] font-bold uppercase tracking-[0.16em] pb-1.5 transition-all ${
            !initialCategory
              ? "text-[#171717] border-b-2 border-[#171717]"
              : "text-[#b0a99a] border-b-2 border-transparent hover:text-[#171717]"
          }`}
        >
          Tout
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => updateFilters(cat.slug, undefined)}
            className={`text-[11px] font-bold uppercase tracking-[0.16em] pb-1.5 transition-all ${
              initialCategory === cat.slug
                ? "text-[#171717] border-b-2 border-[#171717]"
                : "text-[#b0a99a] border-b-2 border-transparent hover:text-[#171717]"
            }`}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {/* LIGNE 2 : Barre de recherche & Compteur (Séparée par une ligne continue) */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-3">
        
        {/* Input de recherche avec Icône Loupe */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full bg-transparent pl-8 pr-4 py-1 text-[13px] text-[#171717] placeholder:text-slate-400 outline-none transition focus:border-b focus:border-[#171717]"
          />
        </form>

        {/* Compteur & Bouton Reset */}
        <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b0a99a]">
          <span>{total} Produit{total > 1 ? "s" : ""}</span>
          
          {(initialQuery || initialCategory) && (
            <button
              onClick={() => {
                setSearch("");
                router.push(pathname);
              }}
              className="flex items-center gap-1.5 transition hover:text-[#171717]"
            >
              <RotateCcw className="h-3 w-3" strokeWidth={2} />
              Réinitialiser
            </button>
          )}
        </div>
      </div>
    </div>
  );
}