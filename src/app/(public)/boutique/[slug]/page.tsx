import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { TrackViewItem } from "@/components/analytics/TrackViewItem";
import { ProductGallery } from "@/components/product/product-gallery";
import { formatPriceCents, formatStockLabel } from "@/features/product/format";
import { findActiveProductBySlug } from "@/server/repositories/catalog.repository";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await findActiveProductBySlug(slug);

  if (!product) {
    return {};
  }

  return {
    title: product.seoTitle ?? product.title,
    description: product.seoDescription ?? product.shortDescription ?? undefined,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await findActiveProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const category = product.categories[0]?.category;
  const isUnavailable = product.stock <= 0 || product.status === "out_of_stock";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.seoDescription ?? product.shortDescription,
    sku: product.sku,
    image: product.images.map((image) => image.url),
    category: category?.title,
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: (product.priceCents / 100).toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `/boutique/${product.slug}`,
    },
  };
  const analyticsProduct = {
    item_id: product.id,
    item_name: product.title,
    item_category: category?.title,
    price: product.priceCents / 100,
    quantity: 1,
    sku: product.sku,
  };

  return (
    <article className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TrackViewItem product={analyticsProduct} />
      <Link href="/boutique" className="text-sm font-bold text-muted hover:text-terracotta">
        Retour boutique
      </Link>

      <div className="mt-8 grid gap-10 md:grid-cols-[0.95fr_1fr] md:items-start">
        <ProductGallery productTitle={product.title} images={product.images} />

        <div className="md:sticky md:top-24">
          {category ? (
            <Link href={`/categorie/${category.slug}`} className="section-title text-terracotta hover:text-brand">
              {category.title}
            </Link>
          ) : (
            <p className="section-title text-terracotta">Collection</p>
          )}

          <h1 className="mt-4 max-w-2xl text-5xl leading-none md:text-7xl">{product.title}</h1>
          <p className="mt-6 text-2xl font-bold">{formatPriceCents(product.priceCents)}</p>

          {product.shortDescription ? (
            <p className="mt-6 max-w-xl text-base leading-7 text-muted">{product.shortDescription}</p>
          ) : null}

          <dl className="mt-8 grid gap-3 border-y border-line py-6 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Stock</dt>
              <dd className="font-bold">{formatStockLabel(product.stock, product.pickupOnly)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">SKU</dt>
              <dd className="font-bold">{product.sku}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Classe livraison</dt>
              <dd className="font-bold">{product.shippingClass}</dd>
            </div>
            {product.barcode ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Barcode</dt>
                <dd className="font-bold">{product.barcode}</dd>
              </div>
            ) : null}
            {product.externalStockId ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Stock externe</dt>
                <dd className="font-bold">{product.externalStockId}</dd>
              </div>
            ) : null}
          </dl>

          <AddToCartButton productId={product.id} analyticsProduct={analyticsProduct} disabled={isUnavailable} />

          {product.description ? (
            <div className="mt-10 max-w-2xl text-base leading-8 text-muted">
              <h2 className="font-serif text-3xl text-foreground">Details</h2>
              <p className="mt-3 whitespace-pre-line">{product.description}</p>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
