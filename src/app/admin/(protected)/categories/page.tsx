import Link from "next/link";
import { listCategories } from "@/server/repositories/catalog.repository";

export default async function AdminCategoriesPage() {
  const categories = await listCategories();

  return (
    <section>
      <p className="section-title text-terracotta">Catalogue</p>
      <h2 className="mt-2 font-serif text-4xl">Categories</h2>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categorie/${category.slug}`}
            className="border border-line bg-surface p-5 transition hover:border-brand"
          >
            <h3 className="font-serif text-2xl">{category.title}</h3>
            {category.description ? <p className="mt-2 text-sm text-muted">{category.description}</p> : null}
            <p className="mt-4 text-sm font-bold">{category._count.products} produit(s)</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
