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
  const cta = latestBlogPost
    ? {
        title: latestBlogPost.title,
        body: latestBlogPost.excerpt ?? "",
        primaryLabel: "Lire l'article",
        primaryLink: `/blog/${latestBlogPost.slug}`,
        secondaryLabel: "Voir le journal",
        secondaryLink: "/blog",
      }
    : {
        title: "Conseils déco pour votre intérieur",
        body: "Inspiration, tendances et conseils pratiques pour composer un intérieur élégant.",
        primaryLabel: "Voir le journal",
        primaryLink: "/blog",
        secondaryLabel: "Parcourir la boutique",
        secondaryLink: "/boutique",
      };

  return (
    <main className="min-h-screen bg-white">
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

      {/* ── Hero header ── */}
      <header className="mx-auto max-w-[1240px] px-6 pb-16 pt-20 md:px-16 md:pt-28 lg:px-0">
        <p className="mb-6 mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b0a99a]">
          La boutique 
        </p>
        <h1 className="text-3xl font-thin leading-[0.92] tracking-[-0.04em] text-[#171717] md:text-5xl">
          Découvrez 
          <br />
          <span className="text-[#b0a99a]">tous nos produits</span>
        </h1>
        <p className="mt-10 max-w-[440px] text-[12px] font-bold uppercase leading-6 tracking-[0.12em] text-slate-500">
          Une sélection de pièces intemporelles pour un intérieur minimaliste et chaleureux.
        </p>
      </header>

      {/* ── Filters + grid ── */}
      <div className="mx-auto max-w-[1240px] px-6 pb-32 md:px-16 lg:px-0">
        <BoutiqueFilters
          key={`${query}::${categorySlug}`}
          categories={categories}
          initialQuery={query}
          initialCategory={categorySlug}
          total={catalog.total}
        />

        {catalog.products.length > 0 ? (
          <>
            <section className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
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
          <section className="py-32 text-center">
            <h2 className="text-[40px] font-[300] leading-tight tracking-[-0.03em] text-[#171717]">
              {query || categorySlug ? "Aucun résultat" : "Aucun produit actif"}
            </h2>
            <p className="mx-auto mt-6 max-w-md text-[12px] font-bold uppercase leading-6 tracking-[0.1em] text-slate-400">
              {query || categorySlug
                ? `Aucun résultat pour ${query ? `"${query}"` : "les filtres actifs"}${activeCategory ? ` dans ${activeCategory.title}` : ""}.`
                : "Lancez le seed catalogue ou créez un produit depuis l'admin."}
            </p>
            {(query || categorySlug) && (
              <div className="mt-10">
                <Link
                  href={buildBoutiqueHref({ page: 1 })}
                  className="inline-flex h-[48px] items-center justify-center border border-[#dedede] px-10 text-[11px] font-bold uppercase tracking-[0.16em] transition hover:border-[#171717]"
                >
                  Réinitialiser les filtres
                </Link>
              </div>
            )}
          </section>
        )}
      </div>

      {/* ── Inspiration strip ── */}
         <section className="shadow-md! py-24">
           <div className="mx-auto max-w-[1240px] px-6 md:px-16 lg:px-0">
             <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
               <div>
                 <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b0a99a]">
                   Boutique
                 </p>
                 <h2 className="max-w-[560px] text-3xl font-[300] leading-[0.94] tracking-[-0.03em] text-[#171717] md:text-4xl">
                   {cta.title}
                 </h2>
                 {cta.body && (
                   <p className="mt-5 max-w-md text-[12px] font-bold uppercase leading-6 tracking-[0.1em] text-slate-500">
                     {cta.body}
                   </p>
                 )}
               </div>
   
               <div className="flex shrink-0 flex-col gap-3">
                 <Link
                   href={cta.primaryLink}
                   className="inline-flex h-[48px] items-center justify-center bg-[#171717] px-10 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#747b4f]"
                 >
                   {cta.primaryLabel}
                 </Link>
                 <Link
                   href={cta.secondaryLink}
                   className="inline-flex h-[48px] items-center justify-center border border-[#dedede] px-10 text-[11px] font-bold uppercase tracking-[0.16em] text-[#171717] transition hover:border-[#171717]"
                 >
                   {cta.secondaryLabel}
                 </Link>
               </div>
             </div>
           </div>
         </section>
    </main>
  );
}
