import Link from "next/link";
import { Pen, Trash2 } from "lucide-react";
import { ProductImageFallback } from "@/components/product/product-image-fallback";
import { formatPriceCents } from "@/features/product/format";
import { archiveProductForAdminAction } from "@/features/product/actions";
import { listAdminProducts } from "@/server/repositories/admin-product.repository";

export default async function AdminProductsPage() {
  const products = await listAdminProducts();
  const activeCount = products.filter((product) => product.status === "active").length;
  const draftCount = products.filter((product) => product.status === "draft").length;
  const missingImagesCount = products.filter((product) => product.images.length === 0).length;
  const shopcaisseLinkedCount = products.filter((product) => Boolean(product.externalStockId)).length;

  return (
    <section className="w-full">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="section-title text-terracotta">Catalogue</p>
          <h2 className="mt-2 font-serif text-4xl md:text-5xl">Produits</h2>
          <p className="mt-3 max-w-3xl text-sm text-muted">
            Vue de gestion plein format pour piloter les produits storefront, leurs statuts, leurs stocks et leur
            enrichissement visuel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/products/new"
            className="bg-brand px-4 py-3 text-sm font-bold text-brand-contrast transition hover:opacity-90"
          >
            Import et brouillons
          </Link>

          <Link
            href="/admin/products/missing-images"
            className="border border-line px-4 py-3 text-sm font-bold transition hover:border-foreground"
          >
            Produits sans photo
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="border border-line bg-surface p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Total</p>
          <p className="mt-3 font-serif text-4xl">{products.length}</p>
        </article>
        <article className="border border-line bg-surface p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Actifs</p>
          <p className="mt-3 font-serif text-4xl">{activeCount}</p>
        </article>
        <article className="border border-line bg-surface p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Brouillons</p>
          <p className="mt-3 font-serif text-4xl">{draftCount}</p>
        </article>
        <article className="border border-line bg-surface p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Lies Shopcaisse</p>
          <p className="mt-3 font-serif text-4xl">{shopcaisseLinkedCount}</p>
          <p className="mt-2 text-xs text-muted">Sans photo: {missingImagesCount}</p>
        </article>
      </div>

      <div className="mt-8 overflow-hidden border border-line bg-background">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse text-left text-sm xl:min-w-full">
            <thead className="bg-surface text-xs uppercase text-muted">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 align-middle">#</th>
                <th className="whitespace-nowrap px-4 py-3 align-middle">
                  Produit
                </th>
                <th className="whitespace-nowrap px-4 py-3 align-middle">
                  SKU
                </th>
                <th className="whitespace-nowrap px-4 py-3 align-middle">
                  Statut
                </th>
                <th className="whitespace-nowrap px-4 py-3 align-middle">
                  Prix
                </th>
                <th className="whitespace-nowrap px-4 py-3 align-middle">
                  Stock
                </th>
                <th className="whitespace-nowrap px-4 py-3 align-middle">
                  Livraison
                </th>
                <th className="whitespace-nowrap px-4 py-3 align-middle">
                  Source
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right align-middle">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {products.map((product, index) => (
                <tr
                  key={product.id}
                  className="border-t border-line transition hover:bg-surface/60"
                >
                  <td className="whitespace-nowrap px-4 py-4 align-middle font-bold text-muted">
                    {index + 1}
                  </td>

                  <td className="px-4 py-4 align-middle">
                    <div className="flex min-w-[24rem] items-center gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[1rem] border border-line bg-surface">
                        <ProductImageFallback
                          src={product.images[0]?.url}
                          alt={product.images[0]?.alt || product.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="block truncate text-base font-bold hover:text-terracotta"
                        >
                          {product.title}
                        </Link>

                        <p className="mt-1 truncate text-xs text-muted">
                          {product.categories
                            .map((entry) => entry.category.title)
                            .join(", ") || "Sans catégorie"}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted">
                          {product.images.length > 0 ? "Photo disponible" : "Sans photo"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 align-middle">
                    {product.sku || "-"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 align-middle">
                    <span className="inline-flex items-center border border-line bg-surface px-3 py-1 text-xs font-bold">
                      {product.status}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 align-middle font-bold">
                    {formatPriceCents(product.priceCents)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 align-middle">
                    {product.stock}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 align-middle">
                    {product.shippingClass}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 align-middle">
                    <span className="inline-flex items-center border border-line bg-surface px-3 py-1 text-xs font-bold">
                      {product.externalStockId ? "Shopcaisse" : "Local"}
                    </span>
                  </td>

                  <td className="px-4 py-4 align-middle">
                    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex items-center gap-2 border border-line px-3 py-2 text-xs font-bold transition hover:border-foreground"
                      >
                        <Pen className="h-3.5 w-3.5" aria-hidden="true" />
                        Modifier
                      </Link>

                      <form action={archiveProductForAdminAction}>
                        <input type="hidden" name="id" value={product.id} />

                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 border border-line px-3 py-2 text-xs font-bold text-terracotta transition hover:border-terracotta"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Retirer
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
