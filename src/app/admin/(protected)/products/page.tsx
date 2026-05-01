import Link from "next/link";
import { formatPriceCents } from "@/features/product/format";
import { listActiveProducts } from "@/server/repositories/catalog.repository";

export default async function AdminProductsPage() {
  const products = await listActiveProducts();

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="section-title text-terracotta">Catalogue</p>
          <h2 className="mt-2 font-serif text-4xl">Produits actifs</h2>
        </div>
        <Link href="/admin/products/new" className="bg-brand px-4 py-2 text-sm font-bold text-brand-contrast">
          Nouveau produit
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto border border-line">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Prix</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Livraison</th>
              <th className="px-4 py-3">Sync</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-line">
                <td className="px-4 py-4">
                  <Link href={`/boutique/${product.slug}`} className="font-bold hover:text-terracotta">
                    {product.title}
                  </Link>
                </td>
                <td className="px-4 py-4">{product.sku}</td>
                <td className="px-4 py-4">{formatPriceCents(product.priceCents)}</td>
                <td className="px-4 py-4">{product.stock}</td>
                <td className="px-4 py-4">{product.shippingClass}</td>
                <td className="px-4 py-4">{product.externalStockId ?? "Local"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
