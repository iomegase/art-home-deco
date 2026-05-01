import type { Metadata } from "next";
import { getAllProducts } from "@/lib/sanity/queries";
import type { Product } from "@/types/sanity";
import { ProductCard } from "@/components/product/product-card";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Boutique",
  description: "Parcourez les collections Art Home Deco.",
};

const placeholderProducts: Product[] = [
  {
    _id: "placeholder-1",
    title: "Suspension cannage atelier",
    slug: "suspension-cannage-atelier",
    sku: "AHD-001",
    price: 119,
    stockStatus: "in_stock",
    category: { _id: "cat-1", title: "Luminaire", slug: "luminaire" },
  },
  {
    _id: "placeholder-2",
    title: "Cache-pot texture craie",
    slug: "cache-pot-texture-craie",
    sku: "AHD-002",
    price: 32,
    stockStatus: "in_stock",
    category: { _id: "cat-2", title: "Accessoire", slug: "accessoire" },
  },
  {
    _id: "placeholder-3",
    title: "Banc d'entree frene naturel",
    slug: "banc-entree-frene-naturel",
    sku: "AHD-003",
    price: 210,
    stockStatus: "in_stock",
    category: { _id: "cat-3", title: "Mobilier", slug: "mobilier" },
  },
];

export default async function BoutiquePage() {
  let products: Product[] = placeholderProducts;

  try {
    const cmsProducts = await getAllProducts();
    if (cmsProducts.length > 0) {
      products = cmsProducts;
    }
  } catch {
    products = placeholderProducts;
  }

  return (
    <div className="grain-bg showcase-shell page-enter py-14 md:py-20">
      <Container className="showcase-panel rounded-[2rem] p-7 md:p-9">
        <p className="section-title">Boutique</p>
        <h1 className="mt-3 text-5xl">Collection permanente</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Cette page lit les produits depuis Sanity quand la configuration est
          presente, avec un fallback local pour garder le parcours dev fluide.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              title={product.title}
              category={product.category?.title || "Collection"}
              price={`${product.price} EUR`}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
