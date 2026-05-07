import Link from "next/link";
import { buildBoutiqueHref } from "@/features/product/boutique-query";

type BoutiquePaginationProps = {
  page: number;
  totalPages: number;
  q: string;
  categorie: string;
};

function getPageWindow(page: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  return Array.from(pages).filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b);
}

export function BoutiquePagination({ page, totalPages, q, categorie }: BoutiquePaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getPageWindow(page, totalPages);

  return (
    <nav
      aria-label="Pagination produits"
      className="mt-12 flex flex-wrap items-center justify-center gap-2 border-t border-line pt-8"
    >
      <Link
        href={buildBoutiqueHref({ q, categorie, page: Math.max(page - 1, 1) })}
        aria-disabled={page <= 1}
        className={`px-4 py-2 text-sm font-bold ${
          page <= 1 ? "pointer-events-none border border-line text-muted opacity-45" : "border border-line hover:border-foreground"
        }`}
      >
        Precedent
      </Link>

      {pages.map((entry, index) => {
        const previous = pages[index - 1];
        const showGap = previous && entry - previous > 1;

        return (
          <div key={entry} className="flex items-center gap-2">
            {showGap ? <span className="px-1 text-sm text-muted">…</span> : null}
            <Link
              href={buildBoutiqueHref({ q, categorie, page: entry })}
              className={`px-4 py-2 text-sm font-bold ${
                entry === page ? "bg-brand text-brand-contrast" : "border border-line hover:border-foreground"
              }`}
            >
              {entry}
            </Link>
          </div>
        );
      })}

      <Link
        href={buildBoutiqueHref({ q, categorie, page: Math.min(page + 1, totalPages) })}
        aria-disabled={page >= totalPages}
        className={`px-4 py-2 text-sm font-bold ${
          page >= totalPages ? "pointer-events-none border border-line text-muted opacity-45" : "border border-line hover:border-foreground"
        }`}
      >
        Suivant
      </Link>
    </nav>
  );
}
