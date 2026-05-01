import Link from "next/link";
import type { CatalogCategory } from "@/server/repositories/catalog.repository";

type CategoryNavProps = {
  categories: CatalogCategory[];
  activeSlug?: string;
};

export function CategoryNav({ categories, activeSlug }: CategoryNavProps) {
  return (
    <nav aria-label="Categories produits" className="flex gap-2 overflow-x-auto pb-2">
      <Link
        href="/boutique"
        className={`shrink-0 border px-4 py-2 text-sm font-bold ${
          activeSlug ? "border-line text-muted" : "border-brand bg-brand text-brand-contrast"
        }`}
      >
        Tout
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/categorie/${category.slug}`}
          className={`shrink-0 border px-4 py-2 text-sm font-bold ${
            activeSlug === category.slug
              ? "border-brand bg-brand text-brand-contrast"
              : "border-line text-muted hover:border-brand hover:text-brand"
          }`}
        >
          {category.title}
        </Link>
      ))}
    </nav>
  );
}
