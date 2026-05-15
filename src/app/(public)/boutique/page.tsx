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
    <main className="min-h-screen mt-6 overflow-x-clip bg-white">
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

      {/* ── Hero header avec ADN de marque ── */}
      <header className="relative mx-auto max-w-[1240px] px-6 pb-12 pt-20 md:px-16 md:pt-28 lg:px-0">
        
        {/* Blob décoratif à droite pour habiller le vide */}
        <div className="pointer-events-none absolute right-[-5%] top-[10%] z-0 hidden h-[450px] w-[450px] rotate-[15deg] rounded-[40%_60%_30%_70%/60%_40%_60%_40%] bg-slate-100/60 mix-blend-multiply blur-3xl lg:block" />

        <div className="relative z-10">
          <p className="mb-6 mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-[#b0a99a]">
            La boutique 
          </p>
          <h1 
            className="text-[42px] font-thin leading-[0.92] tracking-[-0.04em] text-[#171717] md:text-[56px]"
            style={{
              fontFamily: 'var(--font-elms-sans), "Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
          >
            Découvrez 
            <br />
            <span className="text-[#b0a99a]">tous nos produits.</span>
          </h1>
          <p className="mt-8 max-w-[440px] text-[14px] leading-relaxed text-slate-600 md:text-[15px]">
            Une sélection de pièces intemporelles pour un intérieur minimaliste et chaleureux.
          </p>
        </div>
      </header>

      {/* ── Filters + grid ── */}
      <div className="relative z-10 mx-auto max-w-[1240px] px-6 pb-32 md:px-16 lg:px-0">
        
        {/* Conteneur des filtres avec espacement repensé */}
        <div className="mb-14">
          <BoutiqueFilters
            key={`${query}::${categorySlug}`}
            categories={categories}
            initialQuery={query}
            initialCategory={categorySlug}
            total={catalog.total}
          />
        </div>

        {catalog.products.length > 0 ? (
          <>
            <section className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {catalog.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </section>

            <div className="mt-20">
              <BoutiquePagination
                page={catalog.page}
                totalPages={catalog.totalPages}
                q={query}
                categorie={categorySlug}
              />
            </div>
          </>
        ) : (
          <section className="py-32 text-center">
            <h2 
              className="text-[34px] font-[300] leading-tight tracking-[-0.03em] text-[#171717]"
              style={{
                fontFamily: 'var(--font-elms-sans), "Helvetica Neue", Helvetica, Arial, sans-serif',
              }}
            >
              {query || categorySlug ? "Aucun résultat" : "Aucun produit actif"}
            </h2>
            <p className="mx-auto mt-6 max-w-md text-[14px] leading-relaxed text-slate-500">
              {query || categorySlug
                ? `Nous n'avons trouvé aucun résultat pour ${query ? `"${query}"` : "les filtres actifs"}${activeCategory ? ` dans ${activeCategory.title}` : ""}.`
                : "La boutique est en cours d'approvisionnement."}
            </p>
            {(query || categorySlug) && (
              <div className="mt-10">
                <Link
                  href={buildBoutiqueHref({ page: 1 })}
                  className="inline-flex h-[46px] items-center justify-center border border-[#171717] px-10 text-[11px] font-bold uppercase tracking-[0.16em] text-[#171717] transition hover:bg-[#171717] hover:text-white"
                >
                  Réinitialiser les filtres
                </Link>
              </div>
            )}
          </section>
        )}
      </div>

      {/* ── Inspiration strip adouci ── */}
      <section className="bg-[#f8f7f5] py-24">
        <div className="mx-auto max-w-[1240px] px-6 md:px-16 lg:px-0">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-[#b0a99a]">
                Le Journal
              </p>
              <h2 
                className="max-w-[560px] text-[34px] font-[300] leading-[1.1] tracking-[-0.03em] text-[#171717] md:text-[42px]"
                style={{
                  fontFamily: 'var(--font-elms-sans), "Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
              >
                {cta.title}
              </h2>
              {cta.body && (
                <p className="mt-5 max-w-md text-[14px] leading-relaxed text-slate-600">
                  {cta.body}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-col gap-4 sm:flex-row lg:flex-col">
              <Link
                href={cta.primaryLink}
                className="inline-flex h-[46px] items-center justify-center bg-[#171717] px-10 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#b0a99a]"
              >
                {cta.primaryLabel}
              </Link>
              <Link
                href={cta.secondaryLink}
                className="inline-flex h-[46px] items-center justify-center border border-[#171717] px-10 text-[11px] font-bold uppercase tracking-[0.16em] text-[#171717] transition hover:bg-[#171717] hover:text-white"
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