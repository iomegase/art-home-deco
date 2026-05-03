import type { Metadata } from "next";
import { CategoryNav } from "@/components/product/category-nav";
import { ProductCard } from "@/components/product/product-card";
import { listActiveProducts, listCategories } from "@/server/repositories/catalog.repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Boutique",
  description: "Parcourez les collections Art Home Deco.",
};

export default async function BoutiquePage() {
  const [products, categories] = await Promise.all([listActiveProducts(), listCategories()]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
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
    </div>
  );
}
