import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
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
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrackViewItem product={analyticsProduct} />

      {/* ── Breadcrumb ── */}
      <div className="mx-auto max-w-[1240px] px-6 pt-25 md:px-16 lg:px-0">
        <div className="flex items-center justify-between">
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#b0a99a] transition hover:text-[#171717]"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
            Boutique
          </Link>
          {category && (
            <Link
              href={`/boutique?categorie=${category.slug}`}
              className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#b0a99a] transition hover:text-[#171717]"
            >
              {category.title}
            </Link>
          )}
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-[1240px] flex-col justify-center px-6 pb-16 pt-8 md:px-16 lg:grid lg:grid-cols-[1fr_460px] lg:items-center lg:gap-20 lg:px-0 lg:py-16">
        {/* Gallery */}
        <div>
          <ProductGallery productTitle={product.title} images={product.images} />
        </div>

        {/* Info panel */}
        <div className="mt-12 lg:sticky lg:top-24 lg:mt-0">
          {/* Category + title */}
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#b0a99a]">
            {category?.title ?? "Collection"}
          </p>

          <h1 className="mt-4 text-3xl font-light!  leading-[0.92] tracking-[-0.04em] text-[#171717] md:text-4xl">
            {product.title}
          </h1>

          {/* Price */}
          <p className="mt-6 text-[28px] font-bold tracking-[-0.02em] text-[#171717]">
            {formatPriceCents(product.priceCents)}
          </p>

          {/* Short description */}
          {product.shortDescription && (
            <p className="mt-6 max-w-sm text-[12px] font-bold uppercase leading-6 tracking-[0.1em] text-slate-500">
              {product.shortDescription}
            </p>
          )}

          {/* Details */}
          <dl className="mt-8 border-t border-[#e5e7eb] pt-6 grid gap-3">
            <div className="flex items-center justify-between">
              <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#b0a99a]">Stock</dt>
              <dd className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#171717]">
                {formatStockLabel(product.stock, product.pickupOnly)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#b0a99a]">Livraison</dt>
              <dd className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#171717]">
                {product.shippingClass}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-[#e5e7eb] pt-3">
              <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#b0a99a]">Référence</dt>
              <dd className="text-[11px] tracking-[0.06em] text-[#b0a99a]">{product.sku}</dd>
            </div>
          </dl>

          {/* Add to cart */}
          <AddToCartButton
            productId={product.id}
            productStock={product.stock}
            analyticsProduct={analyticsProduct}
            disabled={isUnavailable}
          />

          {/* Long description */}
          {product.description && (
            <div className="mt-12 border-t border-[#e5e7eb] pt-8">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#b0a99a]">
                Détails
              </h2>
              <p className="mt-4 text-[13px] leading-7 text-slate-600 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
