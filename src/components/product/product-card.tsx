import Image from "next/image";
import Link from "next/link";
import { formatPriceCents, formatStockLabel } from "@/features/product/format";
import type { CatalogProduct } from "@/server/repositories/catalog.repository";

type ProductCardProps = {
  product: CatalogProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images[0];
  const category = product.categories[0]?.category.title ?? "Collection";
  const isUnavailable = product.stock <= 0 || product.status === "out_of_stock";

  return (
    <Link href={`/boutique/${product.slug}`} className="group block">
      <article className="grid gap-4">
        <div className="relative aspect-[4/5] overflow-hidden bg-surface">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt ?? product.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-[1.035]"
            />
          ) : (
            <div className="h-full w-full bg-[linear-gradient(135deg,var(--surface),var(--surface-strong))]" />
          )}
          {isUnavailable ? (
            <span className="absolute left-3 top-3 bg-brand px-3 py-1 text-xs font-bold text-brand-contrast">
              Rupture
            </span>
          ) : null}
        </div>

        <div>
          <p className="text-xs font-bold uppercase text-muted">{category}</p>
          <h3 className="mt-1 font-serif text-2xl leading-tight group-hover:text-terracotta">
            {product.title}
          </h3>
          <div className="mt-3 flex items-center justify-between gap-4 text-sm">
            <p className="font-bold text-brand">{formatPriceCents(product.priceCents)}</p>
            <p className="text-muted">{formatStockLabel(product.stock, product.pickupOnly)}</p>
          </div>
        </div>
      </article>
    </Link>
  );
}
