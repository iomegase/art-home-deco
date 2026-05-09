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
      <article className="flex flex-col gap-5 transition-opacity hover:opacity-90">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-[#fcfcfc]">
          <ProductImageFallback
            src={primaryImage?.url}
            alt={primaryImage?.alt ?? product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* Overlay subtil */}
          <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {isUnavailable ? (
            <span className="absolute left-4 top-4 bg-white px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-slate-900 shadow-sm">
              Rupture
            </span>
          ) : null}
        </div>

        <div className="flex flex-col items-center px-2 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">{category}</p>
          <h3 className="mt-2 font-serif text-lg text-slate-800 transition-colors group-hover:text-terracotta">
            {product.title}
          </h3>
          <div className="mt-2 text-sm">
            <p className="font-light text-slate-600">{formatPriceCents(product.priceCents)}</p>
          </div>
        </div>
      </article>
    </Link>
  );
}
