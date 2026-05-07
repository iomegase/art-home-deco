import Link from "next/link";
import { formatPriceCents } from "@/features/product/format";
import { ignoreProductImageAction, importProductImageFromUrlAction, uploadProductImagesAction } from "@/features/product/image-actions";
import { listProductsMissingImages } from "@/server/repositories/shopcaisse-product-import.repository";

type PageProps = {
  searchParams?: Promise<{
    family?: string;
    status?: string;
    q?: string;
    withStockOnly?: string;
    shopcaisseOnly?: string;
  }>;
};

export default async function AdminProductsMissingImagesPage({ searchParams }: PageProps) {
  const query = searchParams ? await searchParams : undefined;
  const filters = {
    family: query?.family?.trim() || null,
    status: query?.status?.trim() || null,
    q: query?.q?.trim() || null,
    withStockOnly: query?.withStockOnly === "true",
    shopcaisseOnly: query?.shopcaisseOnly !== "false",
  };

  const products = await listProductsMissingImages(filters);

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="section-title text-terracotta">Catalogue</p>
          <h2 className="mt-2 font-serif text-4xl">Produits sans photo</h2>
          <p className="mt-3 text-sm text-muted">Pilotage editorial des produits sans image principale.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products" className="border border-line px-4 py-2 text-sm font-bold">
            Retour produits
          </Link>
          <Link href="/admin/products/images/import-csv" className="bg-brand px-4 py-2 text-sm font-bold text-brand-contrast">
            Import CSV fournisseur
          </Link>
        </div>
      </div>

      <form className="mt-8 grid gap-4 border border-line bg-surface p-6 md:grid-cols-5">
        <label className="text-sm font-bold md:col-span-2">
          Recherche
          <input name="q" defaultValue={filters.q ?? ""} className="mt-2 w-full border border-line bg-background px-3 py-3" />
        </label>
        <label className="text-sm font-bold">
          Famille
          <input name="family" defaultValue={filters.family ?? ""} className="mt-2 w-full border border-line bg-background px-3 py-3" />
        </label>
        <label className="text-sm font-bold">
          Statut publication
          <select name="status" defaultValue={filters.status ?? ""} className="mt-2 w-full border border-line bg-background px-3 py-3">
            <option value="">Tous</option>
            <option value="draft">draft</option>
            <option value="active">active</option>
            <option value="archived">archived</option>
            <option value="out_of_stock">out_of_stock</option>
          </select>
        </label>
        <div className="grid gap-3 text-sm">
          <label className="flex items-center gap-3">
            <input type="checkbox" name="withStockOnly" value="true" defaultChecked={filters.withStockOnly} />
            Avec stock uniquement
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" name="shopcaisseOnly" value="true" defaultChecked={filters.shopcaisseOnly} />
            Source Shopcaisse uniquement
          </label>
        </div>
        <button type="submit" className="w-fit bg-brand px-4 py-2 text-sm font-bold text-brand-contrast">Filtrer</button>
      </form>

      <div className="mt-8 grid gap-6">
        {products.length === 0 ? (
          <article className="border border-line bg-surface p-6 text-sm text-muted">Aucun produit sans photo pour ces filtres.</article>
        ) : (
          products.map((product) => {
            const primaryCategory = product.categories[0]?.category.title ?? "Sans categorie";
            const candidateImageUrl = typeof product.shopcaisseCacheLinks[0]?.imageUrl === "string" ? product.shopcaisseCacheLinks[0]?.imageUrl : null;
            const candidateCount = Array.isArray(product.shopcaisseCacheLinks[0]?.images) ? product.shopcaisseCacheLinks[0]?.images.length : 0;

            return (
              <article key={product.id} className="grid gap-5 border border-line bg-surface p-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-2xl">{product.title}</h3>
                      <p className="mt-2 text-sm text-muted">
                        SKU {product.sku} · Barcode {product.barcode ?? "-"} · {primaryCategory}
                      </p>
                    </div>
                    <Link href={`/admin/products/${product.id}/edit`} className="border border-line px-4 py-2 text-sm font-bold">
                      Voir la fiche
                    </Link>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm md:grid-cols-4">
                    <div className="border border-line p-3">Prix: {formatPriceCents(product.priceCents)}</div>
                    <div className="border border-line p-3">Stock: {product.stock}</div>
                    <div className="border border-line p-3">Statut: {product.status}</div>
                    <div className="border border-line p-3">Image: {product.imageStatus ?? "missing"}</div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <form action={uploadProductImagesAction} className="border border-line p-4">
                      <input type="hidden" name="productId" value={product.id} />
                      <p className="text-sm font-bold">Uploader une image</p>
                      <input
                        type="file"
                        name="images"
                        accept="image/jpeg,image/png,image/webp"
                        className="mt-3 block w-full border border-line bg-background px-3 py-3 text-sm"
                      />
                      <button type="submit" className="mt-3 bg-brand px-4 py-2 text-sm font-bold text-brand-contrast">
                        Uploader
                      </button>
                    </form>

                    <form action={importProductImageFromUrlAction} className="border border-line p-4">
                      <input type="hidden" name="productId" value={product.id} />
                      <p className="text-sm font-bold">Coller une URL d&apos;image</p>
                      <input
                        type="url"
                        name="imageUrl"
                        placeholder="https://..."
                        required
                        className="mt-3 w-full border border-line bg-background px-3 py-3 text-sm"
                      />
                      <input
                        name="alt"
                        defaultValue={product.imageAlt ?? product.title}
                        placeholder="Texte alternatif"
                        className="mt-3 w-full border border-line bg-background px-3 py-3 text-sm"
                      />
                      <button type="submit" className="mt-3 border border-line px-4 py-2 text-sm font-bold">
                        Importer depuis URL
                      </button>
                    </form>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="flex h-40 items-center justify-center border border-dashed border-line text-sm text-muted">
                    Aucune image principale
                  </div>
                  <div className="border border-line p-4 text-sm">
                    <p className="font-bold">Images candidates</p>
                    {candidateImageUrl ? (
                      <div className="mt-3 grid gap-3">
                        <p className="text-muted">1 image candidate Shopcaisse detectee.</p>
                        <a href={candidateImageUrl} target="_blank" rel="noreferrer" className="text-accent underline">
                          Voir l&apos;image candidate
                        </a>
                      </div>
                    ) : (
                      <p className="mt-3 text-muted">Aucune image candidate exploitable. Total candidates: {candidateCount}.</p>
                    )}
                  </div>
                  <form action={ignoreProductImageAction} className="border border-line p-4">
                    <input type="hidden" name="productId" value={product.id} />
                    <p className="text-sm text-muted">Marquer ce produit comme ignore pour le suivi photo.</p>
                    <button type="submit" className="mt-3 border border-line px-4 py-2 text-sm font-bold text-terracotta">
                      Ignorer le produit
                    </button>
                  </form>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
