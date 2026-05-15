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
      <article className="flex flex-col gap-4 shadow-md rounded-md">
        {/* Image */}
        <div className="relative aspect-4/4 w-full overflow-hidden bg-white">
          <ProductImageFallback
            src={primaryImage?.url}
            alt={primaryImage?.alt ?? product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          {isUnavailable ? (
            <span className="absolute left-0 top-4 bg-red-400 px-3 py-1 text-[9px] font-lignt uppercase tracking-widest text-white rounded-tl-md rounded-br-md shadow-md">
              Rupture
            </span>
          ) : null}
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1 p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b0a99a]">
            {category}
          </p>
          <h3 className="text-[20px] leading-tight tracking-[-0.02em] text-[#171717] transition-colors group-hover:text-[#747b4f]">
            {product.title}
          </h3>
          <p className="mt-1 text-md font-bold! tracking-[0.06em] text-[#171717]">
            {formatPriceCents(product.priceCents)}
          </p>
        </div>
      </article>
    </Link>
  );
}
