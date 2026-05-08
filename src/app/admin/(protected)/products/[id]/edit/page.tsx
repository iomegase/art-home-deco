import Link from "next/link";
import { AdminRefreshButton } from "@/components/admin/admin-refresh-button";
import { ProductImageManager } from "@/components/admin/product-image-manager";
import { generateAiProductDraftAction, updateProductForAdminAction } from "@/features/product/actions";
import { shippingClassOptions } from "@/features/shipping/shipping-class-options";
import { listCategories } from "@/server/repositories/catalog.repository";
import { findProductForAdmin } from "@/server/repositories/admin-product.repository";

type AdminEditProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ saved?: string; ai?: string }>;
};

const productStatuses = ["draft", "active", "archived", "out_of_stock"] as const;

export default async function AdminEditProductPage({ params, searchParams }: AdminEditProductPageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : undefined;
  const [product, categories] = await Promise.all([findProductForAdmin(id), listCategories()]);

  if (!product) {
    return (
      <section className="max-w-3xl">
        <p className="section-title text-terracotta">Catalogue</p>
        <h2 className="mt-2 font-serif text-4xl">Produit introuvable</h2>
        <div className="mt-8 border border-line bg-surface p-6">
          <Link href="/admin/products" className="bg-brand px-4 py-2 text-sm font-bold text-brand-contrast">
            Retour produits
          </Link>
        </div>
      </section>
    );
  }

  const selectedCategories = new Set(product.categories.map((entry) => entry.category.slug));
  const primaryImage = product.images[0];

  return (
    <section className="max-w-4xl">
      <p className="section-title text-terracotta">Catalogue</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-4xl">{product.title}</h2>
          <p className="mt-2 text-sm text-muted">
            SKU {product.sku} · Statut {product.status} · {product.externalStockId ? "Lie Shopcaisse" : "Stock local"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/products" className="border border-line px-4 py-2 text-sm font-bold">
            Retour produits
          </Link>
          <AdminRefreshButton label="Actualiser le produit" />
          <Link href={`/boutique/${product.slug}`} className="bg-brand px-4 py-2 text-sm font-bold text-brand-contrast">
            Voir la fiche
          </Link>
        </div>
      </div>

      {query?.saved ? (
        <div className="mt-6 border border-line bg-surface p-4 text-sm">Produit enregistre.</div>
      ) : null}
      {query?.ai ? (
        <div className="mt-6 border border-line bg-surface p-4 text-sm">
          Brouillon IA applique. Le produit a ete repasse en statut `draft` pour relecture humaine.
        </div>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <form action={updateProductForAdminAction} className="grid gap-5 border border-line bg-surface p-6">
          <input type="hidden" name="id" value={product.id} />

          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-sm font-bold">
              Titre
              <input
                name="title"
                required
                defaultValue={product.title}
                className="mt-2 w-full border border-line bg-background px-3 py-3"
              />
            </label>
            <label className="text-sm font-bold">
              Slug
              <input
                name="slug"
                required
                defaultValue={product.slug}
                className="mt-2 w-full border border-line bg-background px-3 py-3"
              />
            </label>
            <label className="text-sm font-bold">
              SKU
              <input
                name="sku"
                required
                defaultValue={product.sku}
                className="mt-2 w-full border border-line bg-background px-3 py-3"
              />
            </label>
            <label className="text-sm font-bold">
              Barcode
              <input
                name="barcode"
                defaultValue={product.barcode ?? ""}
                className="mt-2 w-full border border-line bg-background px-3 py-3"
              />
            </label>
            <label className="text-sm font-bold">
              External stock ID
              <input
                name="externalStockId"
                defaultValue={product.externalStockId ?? ""}
                className="mt-2 w-full border border-line bg-background px-3 py-3"
              />
            </label>
            <label className="text-sm font-bold">
              Prix en centimes
              <input
                type="number"
                name="priceCents"
                min="0"
                required
                defaultValue={product.priceCents}
                className="mt-2 w-full border border-line bg-background px-3 py-3"
              />
            </label>
            <label className="text-sm font-bold">
              Stock
              <input
                type="number"
                name="stock"
                min="0"
                required
                defaultValue={product.stock}
                className="mt-2 w-full border border-line bg-background px-3 py-3"
              />
            </label>
            <label className="text-sm font-bold">
              Poids estime en grammes
              <input
                type="number"
                name="estimatedWeightGrams"
                min="0"
                required
                defaultValue={product.estimatedWeightGrams}
                className="mt-2 w-full border border-line bg-background px-3 py-3"
              />
            </label>
            <label className="text-sm font-bold">
              Format d&apos;emballage / colis
              <select
                name="shippingClass"
                defaultValue={product.shippingClass}
                className="mt-2 w-full border border-line bg-background px-3 py-3"
              >
                {shippingClassOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="mt-2 block text-xs font-normal leading-5 text-muted">
                Choisir le format du colis final emballe, pas seulement la taille du produit.
              </span>
            </label>
            <label className="text-sm font-bold">
              Statut
              <select
                name="status"
                defaultValue={product.status}
                className="mt-2 w-full border border-line bg-background px-3 py-3"
              >
                {productStatuses.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="text-sm font-bold">
            Description courte
            <textarea
              name="shortDescription"
              rows={3}
              defaultValue={product.shortDescription ?? ""}
              className="mt-2 w-full border border-line bg-background px-3 py-3"
            />
          </label>

          <label className="text-sm font-bold">
            Description longue
            <textarea
              name="description"
              rows={8}
              defaultValue={product.description ?? ""}
              className="mt-2 w-full border border-line bg-background px-3 py-3"
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-sm font-bold">
              SEO title
              <input
                name="seoTitle"
                defaultValue={product.seoTitle ?? ""}
                className="mt-2 w-full border border-line bg-background px-3 py-3"
              />
            </label>
            <label className="text-sm font-bold">
              SEO description
              <textarea
                name="seoDescription"
                rows={3}
                defaultValue={product.seoDescription ?? ""}
                className="mt-2 w-full border border-line bg-background px-3 py-3"
              />
            </label>
          </div>

          <div className="grid gap-5">
            <label className="text-sm font-bold">
              Alt image principale
              <input
                name="imageAlt"
                defaultValue=""
                placeholder={primaryImage?.alt ?? product.title}
                className="mt-2 w-full border border-line bg-background px-3 py-3"
              />
            </label>
          </div>

          <p className="text-xs leading-6 text-muted">
            Le multi-upload R2 se gere dans le panneau Visuels. Si une image produit manque ou ne peut pas
            s&apos;afficher, le site utilise automatiquement `/logo.png` comme fallback visuel.
          </p>

          <fieldset className="grid gap-3">
            <legend className="text-sm font-bold">Categories</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    name="categorySlugs"
                    value={category.slug}
                    defaultChecked={selectedCategories.has(category.slug)}
                  />
                  <span>{category.title}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-6 text-sm">
            <label className="flex items-center gap-3">
              <input type="checkbox" name="pickupOnly" defaultChecked={product.pickupOnly} />
              <span>Retrait boutique uniquement</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" name="isFragile" defaultChecked={product.isFragile} />
              <span>Produit fragile</span>
            </label>
          </div>

          <button type="submit" className="w-fit bg-brand px-5 py-3 text-sm font-bold text-brand-contrast">
            Enregistrer le produit
          </button>
        </form>

        <div className="grid gap-5">
          <ProductImageManager productId={product.id} productTitle={product.title} images={product.images} />

          <form action={generateAiProductDraftAction} className="border border-line bg-surface p-6">
            <input type="hidden" name="id" value={product.id} />
            <h3 className="font-serif text-2xl">Brouillon IA</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              Genere une base pour la description courte, la description longue, le SEO title, la SEO
              description et l&apos;alt principal. L&apos;action repasse toujours le produit en `draft`.
            </p>
            <button type="submit" className="mt-5 w-fit bg-brand px-5 py-3 text-sm font-bold text-brand-contrast">
              Generer le brouillon IA
            </button>
          </form>

          <div className="border border-line bg-surface p-6">
            <h3 className="font-serif text-2xl">Rappels M9</h3>
            <ul className="mt-3 grid gap-3 text-sm leading-6 text-muted">
              <li>Le CSV peut creer ou mettre a jour un produit.</li>
              <li>Le SKU reste la cle primaire metier de l&apos;import.</li>
              <li>La publication finale reste manuelle via le statut `active`.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
