import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TrackViewItemList } from "@/components/analytics/TrackViewItemList";
import { CategoryNav } from "@/components/product/category-nav";
import { ProductCard } from "@/components/product/product-card";
import { buildBreadcrumbJsonLd, stringifyJsonLd } from "@/lib/seo/local-business";
import { getSiteUrl } from "@/lib/site-url";
import {
  findCategoryBySlug,
  listActiveProducts,
  listCategories,
} from "@/server/repositories/catalog.repository";

export const dynamic = "force-dynamic";

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
    title: `${category.title} | Boutique decoration Saint-Gervais-les-Bains`,
    description:
      category.description ?? `Selection ${category.title} disponible chez Art Home Déco a Saint-Gervais-les-Bains.`,
    alternates: {
      canonical: `/categorie/${category.slug}`,
    },
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

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Accueil", item: getSiteUrl() },
    { name: "Boutique", item: `${getSiteUrl()}/boutique` },
    { name: category.title, item: `${getSiteUrl()}/categorie/${slug}` },
  ]);

  return (
    <div className="mx-auto mt-6 max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(breadcrumbJsonLd) }}
      />
      <TrackViewItemList
        listName={`categorie:${slug}`}
        products={products.map((product) => ({
          item_id: product.id,
          item_name: product.title,
          item_category: category.title,
          price: product.priceCents / 100,
          quantity: 1,
          sku: product.sku,
        }))}
      />
      <header className="border-b border-line pb-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b0a99a]">Categorie</p>
        <h1 className="mt-3 text-5xl text-thin! leading-none ">{category.title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
          {category.description
            ? category.description
            : `Retrouvez notre selection ${category.title.toLowerCase()} dans notre boutique de decoration a Saint-Gervais-les-Bains.`}
        </p>
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
