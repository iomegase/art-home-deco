import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryNav } from "@/components/product/category-nav";
import { ProductCard } from "@/components/product/product-card";
import {
  findCategoryBySlug,
  listActiveProducts,
  listCategories,
} from "@/server/repositories/catalog.repository";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await findCategoryBySlug(slug);

  if (!category) {
    return {};
  }

  return {
    title: category.title,
    description: category.description ?? `Selection ${category.title} Art Home Deco.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [category, categories, products] = await Promise.all([
    findCategoryBySlug(slug),
    listCategories(),
    listActiveProducts({ categorySlug: slug }),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <header className="border-b border-line pb-10">
        <p className="section-title text-terracotta">Categorie</p>
        <h1 className="mt-3 text-5xl leading-none md:text-7xl">{category.title}</h1>
        {category.description ? (
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted">{category.description}</p>
        ) : null}
      </header>

      <div className="mt-8">
        <CategoryNav categories={categories} activeSlug={slug} />
      </div>

      {products.length > 0 ? (
        <section className="mt-10 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      ) : (
        <p className="mt-10 text-muted">Aucun produit actif dans cette categorie.</p>
      )}
    </div>
  );
}
