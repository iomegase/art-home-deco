import type { Metadata } from "next";
import Link from "next/link";
import { TrackViewItemList } from "@/components/analytics/TrackViewItemList";
import { CategoryNav } from "@/components/product/category-nav";
import { ProductCard } from "@/components/product/product-card";
import { findLatestPublishedBlogPost } from "@/server/repositories/blog.repository";
import { listActiveProducts, listCategories } from "@/server/repositories/catalog.repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Boutique",
  description: "Parcourez les collections Art Home Déco.",
};

export default async function BoutiquePage() {
  const [products, categories, latestBlogPost] = await Promise.all([
    listActiveProducts(),
    listCategories(),
    findLatestPublishedBlogPost(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <TrackViewItemList
        listName="boutique"
        products={products.map((product) => ({
          item_id: product.id,
          item_name: product.title,
          item_category: product.categories[0]?.category.title,
          price: product.priceCents / 100,
          quantity: 1,
          sku: product.sku,
        }))}
      />
      <header className="grid gap-8 border-b border-line pb-10 md:grid-cols-[1fr_0.75fr] md:items-end">
        <div>
          <p className="section-title text-terracotta">Boutique</p>
          <h1 className="mt-3 max-w-3xl text-5xl leading-none md:text-7xl">Collection permanente</h1>
        </div>
        <p className="max-w-xl text-sm leading-7 text-muted md:text-base">
          Produits actifs uniquement, prix en centimes calcules cote serveur, stock local pret pour la
          verification Shopcaisse.
        </p>
      </header>

      <div className="mt-8">
        <CategoryNav categories={categories} />
      </div>

      {products.length > 0 ? (
        <section className="mt-10 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      ) : (
        <section className="mt-10 border border-line bg-surface p-8">
          <h2 className="font-serif text-3xl">Aucun produit actif</h2>
          <p className="mt-2 text-muted">Lancez le seed catalogue ou creez un produit depuis l&apos;admin.</p>
        </section>
      )}

      <section className="mt-14 rounded-3xl bg-foreground px-6 py-8 text-background md:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-background/70">Inspiration</p>
        <h2 className="mt-3 font-serif text-3xl">
          {latestBlogPost ? "Conseils deco et idees pour votre interieur" : "Decouvrez notre journal deco"}
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-background/80">
          {latestBlogPost
            ? `Lire l'article: ${latestBlogPost.title}`
            : "Retrouvez nos articles pour composer un interieur chaleureux et harmonieux."}
        </p>
        <div className="mt-6">
          <Link
            href={latestBlogPost ? `/blog/${latestBlogPost.slug}` : "/blog"}
            className="inline-flex rounded-full border border-background/40 px-5 py-3 text-sm font-semibold text-background hover:bg-background hover:text-foreground"
          >
            {latestBlogPost ? "Lire l'article" : "Voir le blog"}
          </Link>
        </div>
      </section>
    </div>
  );
}
