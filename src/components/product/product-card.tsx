"use client";

import Link from "next/link";
import { trackSelectItem } from "@/lib/analytics/ecommerce";
import { formatPriceCents } from "@/features/product/format";
import { ProductImageFallback } from "@/components/product/product-image-fallback";
import type { CatalogProduct } from "@/server/repositories/catalog.repository";

type ProductCardProps = {
  product: CatalogProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images[0];
  const category = product.categories[0]?.category.title ?? "Collection";
  const isUnavailable = product.stock <= 0 || product.status === "out_of_stock";

  return (
    <Link
      href={`/boutique/${product.slug}`}
      className="group block"
      onClick={() =>
        trackSelectItem({
          item_id: product.id,
          item_name: product.title,
          item_category: category,
          price: product.priceCents / 100,
          quantity: 1,
          sku: product.sku,
        })
      }
    >
      <article className="flex flex-col">
        {/* Conteneur Image avec gris extrêmement doux */}
        <div className="relative aspect-square w-full overflow-hidden bg-[#f9f8f6]">
          <ProductImageFallback
            src={primaryImage?.url}
            alt={primaryImage?.alt ?? product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-8 mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
          />
          
          {/* Badge Noir Minimaliste */}
          {isUnavailable ? (
            <span className="absolute left-4 top-4 bg-[#171717] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.2em] text-white">
              Épuisé
            </span>
          ) : null}
        </div>

        {/* Espace augmenté (mt-5) entre l'image et le texte pour aérer */}
        <div className="mt-5 flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b0a99a]">
            {category}
          </p>
          
          {/* Titre affiné pour plus de délicatesse */}
          <h3 
            className="text-[18px] font-[300] leading-snug tracking-[-0.02em] text-[#171717] transition-colors group-hover:text-[#b0a99a]"
            style={{
              fontFamily: 'var(--font-elms-sans), "Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
          >
            {product.title}
          </h3>
          
          {/* Prix : font-mono et espacement ajusté */}
          <p className="mt-1.5 text-[15px] font-mono tracking-[-0.02em] text-[#8c8577]">
            {formatPriceCents(product.priceCents)}
          </p>
        </div>
      </article>
    </Link>
  );
}