import type { Metadata } from "next";
import Link from "next/link";
import { TrackViewItemList } from "@/components/analytics/TrackViewItemList";
import { BoutiqueFilters } from "@/components/product/boutique-filters";
import { BoutiquePagination } from "@/components/product/boutique-pagination";
import { ProductCard } from "@/components/product/product-card";
import { buildBoutiqueHref } from "@/features/product/boutique-query";
import { findLatestPublishedBlogPost } from "@/server/repositories/blog.repository";
import { listActiveProductsPage, listCategories } from "@/server/repositories/catalog.repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Boutique",
  description: "Parcourez les collections Art Home Déco.",
};

type BoutiquePageProps = {
  searchParams?: Promise<{
    q?: string;
    categorie?: string;
    page?: string;
  }>;
};

export default async function BoutiquePage({ searchParams }: BoutiquePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const query = params?.q?.trim() ?? "";
  const categorySlug = params?.categorie?.trim() ?? "";
  const page = Math.max(Number.parseInt(params?.page ?? "1", 10) || 1, 1);

  const [catalog, categories, latestBlogPost] = await Promise.all([
    listActiveProductsPage({
      query: query || undefined,
      categorySlug: categorySlug || undefined,
      page,
      pageSize: 12,
    }),
    listCategories(),
    findLatestPublishedBlogPost(),
  ]);
  const activeCategory = categories.find((entry) => entry.slug === categorySlug);

  return (
    <main className="min-h-screen bg-white pb-24">
      <div className="mx-auto max-w-7xl px-5 pt-12 md:px-8 md:pt-20">
        <TrackViewItemList
          listName="boutique"
          products={catalog.products.map((product) => ({
            item_id: product.id,
            item_name: product.title,
            item_category: product.categories[0]?.category.title,
            price: product.priceCents / 100,
            quantity: 1,
            sku: product.sku,
          }))}
        />
        <header className="mb-12 flex flex-col items-center text-center">
          <h1 className="text-4xl font-thin tracking-tight text-slate-800 md:text-6xl">
            Collection <span className="font-serif italic text-slate-400">Permanente</span>
          </h1>
          <p className="mt-6 max-w-2xl text-sm font-light leading-relaxed text-slate-500 md:text-base">
            Une sélection de pièces intemporelles pour un intérieur minimaliste et chaleureux. 
            Découvrez notre univers à travers des matériaux bruts et des lignes épurées.
          </p>
        </header>

      <BoutiqueFilters
        key={`${query}::${categorySlug}`}
        categories={categories}
        initialQuery={query}
        initialCategory={categorySlug}
        total={catalog.total}
      />

      {catalog.products.length > 0 ? (
        <>
          <section className="mt-10 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>

          <BoutiquePagination
            page={catalog.page}
            totalPages={catalog.totalPages}
            q={query}
            categorie={categorySlug}
          />
        </>
      ) : (
        <section className="mt-12 py-24 text-center">
          <h2 className="font-serif text-3xl text-slate-800">
            {query || categorySlug ? "Aucun produit ne correspond a votre recherche" : "Aucun produit actif"}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-light leading-relaxed text-slate-500">
            {query || categorySlug
              ? `Aucun resultat pour ${
                  query ? `la recherche "${query}"` : "les filtres actifs"
                }${activeCategory ? ` dans ${activeCategory.title}` : ""}.`
              : "Lancez le seed catalogue ou creez un produit depuis l&apos;admin."}
          </p>
          {(query || categorySlug) && (
            <div className="mt-8">
              <Link href={buildBoutiqueHref({ page: 1 })} className="inline-flex border border-slate-200 px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-900 transition-colors hover:bg-slate-50">
                Reinitialiser les filtres
              </Link>
            </div>
          )}
        </section>
      )}

      {catalog.products.length > 0 ? (
        <section className="mt-24 flex flex-col items-center rounded-sm bg-slate-50 border border-slate-100 p-12 text-center md:p-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Inspiration</p>
          <h2 className="mt-4 font-serif text-3xl text-slate-800 md:text-4xl">
            {latestBlogPost ? "Conseils deco et idees pour votre interieur" : "Decouvrez notre journal deco"}
          </h2>
          <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-slate-500">
            {latestBlogPost
              ? `Lire l'article: ${latestBlogPost.title}`
              : "Retrouvez nos articles pour composer un interieur chaleureux et harmonieux."}
          </p>
          <div className="mt-6">
            <Link
              href={latestBlogPost ? `/blog/${latestBlogPost.slug}` : "/blog"}
              className="mt-8 inline-flex border border-slate-200 bg-white px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-900 transition-colors hover:bg-slate-900 hover:text-white"
            >
              {latestBlogPost ? "Lire l'article" : "Voir le blog"}
            </Link>
          </div>
        </section>
      ) : (
        <section className="mt-24 flex flex-col items-center rounded-sm bg-slate-50 border border-slate-100 p-12 text-center md:p-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Besoin d&apos;aide</p>
          <h2 className="mt-4 font-serif text-3xl text-slate-800 md:text-4xl">Affinez votre selection ou contactez la boutique</h2>
          <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-slate-500">
            Si vous ne trouvez pas encore la bonne piece, nous pouvons vous orienter vers une famille de
            produits, un style ou un usage precis.
          </p>
          <div className="mt-6">
            <Link
              href="/contact"
              className="mt-8 inline-flex border border-slate-200 bg-white px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-900 transition-colors hover:bg-slate-900 hover:text-white"
            >
              Contacter la boutique
            </Link>
          </div>
        </section>
      )}
      </div>
    </main>
  );
}
