import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildBoutiqueHref } from "@/features/product/boutique-query";

type BoutiquePaginationProps = {
  page: number;
  totalPages: number;
  q: string;
  categorie: string;
};

function getPageWindow(page: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  return Array.from(pages)
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
}

export function BoutiquePagination({
  page,
  totalPages,
  q,
  categorie,
}: BoutiquePaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getPageWindow(page, totalPages);

  return (
    <nav
      aria-label="Pagination produits"
      className="mt-20 flex flex-wrap items-center justify-center gap-3 border-t border-[#e5e7eb] pt-10"
    >
      <Link
        href={buildBoutiqueHref({ q, categorie, page: Math.max(page - 1, 1) })}
        aria-disabled={page <= 1}
        className={`px-3 py-2 text-[#171717]/50 transition hover:text-[#171717] ${
          page <= 1 ? "pointer-events-none opacity-20" : ""
        }`}
      >
        <ChevronLeft className="h-7 w-7" strokeWidth={1.4} />
      </Link>

      {pages.map((entry, index) => {
        const previous = pages[index - 1];
        const showGap = previous && entry - previous > 1;

        return (
          <div key={entry} className="flex items-center gap-3">
            {showGap ? (
              <span className="text-[11px] font-bold text-[#b0a99a]">…</span>
            ) : null}
            <Link
              href={buildBoutiqueHref({ q, categorie, page: entry })}
              className={`flex h-10 w-10 items-center justify-center text-[12px] font-bold uppercase tracking-[0.1em] transition ${
                entry === page
                  ? "bg-[#171717] text-white"
                  : "text-[#b0a99a] hover:text-[#171717]"
              }`}
            >
              {entry}
            </Link>
          </div>
        );
      })}

      <Link
        href={buildBoutiqueHref({
          q,
          categorie,
          page: Math.min(page + 1, totalPages),
        })}
        aria-disabled={page >= totalPages}
        className={`px-3 py-2 text-[#171717]/50 transition hover:text-[#171717] ${
          page >= totalPages ? "pointer-events-none opacity-20" : ""
        }`}
      >
        <ChevronRight className="h-7 w-7" strokeWidth={1.4} />
      </Link>
    </nav>
  );
}
