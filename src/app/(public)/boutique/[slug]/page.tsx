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
    <main className="relative min-h-screen overflow-x-clip bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrackViewItem product={analyticsProduct} />

      {/* ── Blob d'arrière-plan très subtil pour l'ADN de la marque ── */}
      <div className="pointer-events-none absolute left-[-10%] top-[10%] z-0 h-[600px] w-[600px] rotate-[-15deg] rounded-[60%_40%_70%_30%/50%] bg-slate-100/50 mix-blend-multiply blur-3xl md:left-[5%]" />

      {/* ── Breadcrumb ── */}
      <div className="relative z-10 mx-auto max-w-[1240px] px-6 pt-25 md:px-16 lg:px-0">
        <div className="flex items-center justify-between">
          <Link
            href="/boutique"
            className="group inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#b0a99a] transition hover:text-[#171717]"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" strokeWidth={1.8} />
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
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] max-w-[1240px] flex-col px-6 pb-16 pt-8 md:px-16 lg:grid lg:grid-cols-[1fr_460px] lg:items-start lg:gap-20 lg:px-0 lg:py-16">
        
        {/* Gallery */}
        <div className="lg:sticky lg:top-24">
          <ProductGallery productTitle={product.title} images={product.images} />
        </div>

        {/* Info panel */}
        <div className="mt-12 lg:mt-0">
          {/* Category */}
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#b0a99a]">
            {category?.title ?? "Collection"}
          </p>

          {/* Title - Utilisation de la police signature */}
          <h1 
            className="mt-4 text-[42px] font-thin leading-[0.92] tracking-[-0.04em] text-[#171717] md:text-[52px]"
            style={{
              fontFamily: 'var(--font-elms-sans), "Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
          >
            {product.title}
          </h1>

          {/* Price - Style monospaced taupe */}
          <p className="mt-5 text-[28px] font-mono tracking-[-0.02em] text-[#8c8577]">
            {formatPriceCents(product.priceCents)}
          </p>

          {/* Short description - Rendu lisible (suppression du uppercase) */}
          {product.shortDescription && (
            <p className="mt-6 max-w-md text-[14px] leading-relaxed text-slate-600 md:text-[15px]">
              {product.shortDescription}
            </p>
          )}

          {/* Details - Bordures adoucies */}
          <dl className="mt-10 grid gap-4 border-t border-slate-100 pt-8">
            <div className="flex items-center justify-between">
              <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#b0a99a]">Stock</dt>
              <dd className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#171717]">
                {formatStockLabel(product.stock, product.pickupOnly)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#b0a99a]">Livraison</dt>
              <dd className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#171717]">
                {product.shippingClass}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#b0a99a]">Référence</dt>
              <dd className="text-[11px] tracking-[0.06em] text-slate-400">{product.sku}</dd>
            </div>
          </dl>

          {/* Add to cart */}
          <div className="mt-10">
            <AddToCartButton
              productId={product.id}
              productStock={product.stock}
              analyticsProduct={analyticsProduct}
              disabled={isUnavailable}
            />
          </div>

          {/* Long description */}
          {product.description && (
            <div className="mt-12 border-t border-slate-100 pt-10">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#171717]">
                Détails de l&apos;article
              </h2>
              <div className="prose prose-sm prose-slate mt-5 max-w-none">
                <p className="text-[14px] leading-7 text-slate-600 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}