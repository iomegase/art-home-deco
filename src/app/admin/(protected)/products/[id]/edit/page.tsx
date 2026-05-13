import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Eye, Package, Sparkles } from "lucide-react";
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

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Actif", color: "#10b981", bg: "#e9faf2" },
  draft: { label: "Brouillon", color: "#f97316", bg: "#fff1e6" },
  archived: { label: "Archivé", color: "#64748b", bg: "#f1f3f6" },
  out_of_stock: { label: "Rupture", color: "#ef4444", bg: "#fdecec" },
};

const inputClass =
  "mt-2 w-full rounded-xl border border-[#ececef] bg-white px-3 py-2.5 text-[13px] text-[#0f1115] outline-none transition placeholder:text-slate-300 focus:border-[#111]";

const textareaClass =
  "mt-2 w-full resize-y rounded-xl border border-[#ececef] bg-white px-3 py-2.5 text-[13px] text-[#0f1115] outline-none transition placeholder:text-slate-300 focus:border-[#111]";

const selectClass =
  "mt-2 w-full rounded-xl border border-[#ececef] bg-white px-3 py-2.5 text-[13px] text-[#0f1115] outline-none transition focus:border-[#111]";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-semibold text-slate-500">{children}</span>;
}

function SectionCard({ n, title, subtitle, children }: { n: number; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#ececef] bg-white p-5 shadow-[0_1px_2px_rgba(15,17,21,0.04)] md:p-6">
      <div className="mb-5 flex items-center gap-3 border-b border-[#f3f3f5] pb-4">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#fdecf4] font-mono text-[11px] font-semibold text-[#ec4899]">
          {String(n).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-[#0f1115]">{title}</p>
          {subtitle ? <p className="text-[11px] text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export default async function AdminEditProductPage({ params, searchParams }: AdminEditProductPageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : undefined;
  const [product, categories] = await Promise.all([findProductForAdmin(id), listCategories()]);

  if (!product) {
    return (
      <div className="grid gap-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Catalogue</p>
          <h1 className="mt-2 text-[36px] font-[200] leading-none tracking-[-0.04em] text-[#111]">Produit introuvable</h1>
        </div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 rounded-xl bg-[#111] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white hover:bg-[#333]"
        >
          <ArrowLeft size={13} />
          Retour produits
        </Link>
      </div>
    );
  }

  const selectedCategories = new Set(product.categories.map((e) => e.category.slug));
  const primaryImage = product.images[0];
  const status = statusConfig[product.status] ?? { label: product.status, color: "#94a3b8", bg: "#f1f5f9" };
  const isShopcaisse = Boolean(product.externalStockId);

  return (
    <div className="mx-auto w-full max-w-7xl pb-32 lg:pb-10">
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 transition hover:text-[#111]"
        >
          <ArrowLeft size={11} />
          Produits
        </Link>

        <div className="relative mt-4 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-[#ececef] bg-white p-5 shadow-[0_1px_2px_rgba(15,17,21,0.04)]">
          {isShopcaisse ? (
            <span className="absolute right-5 top-5 inline-flex items-center rounded-full bg-[#f3efff] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7c3aed]">
              Shopcaisse
            </span>
          ) : null}

          <div className="flex min-w-0 items-start gap-4">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full bg-[#fafafa]">
              {primaryImage?.url ? (
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.alt ?? product.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  No Img
                </div>
              )}
            </div>
            <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Catalogue · édition</p>
            <h1 className="mt-2 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[#0f1115]">{product.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: status.color, backgroundColor: status.bg }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.color }} />
                {status.label}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">SKU {product.sku}</span>
            </div>
            </div>
          </div>

        </div>
      </div>

      {query?.saved ? (
        <div className="mb-4 rounded-xl border border-[#d1fae5] bg-[#f0fdf4] px-4 py-3 text-[12px] font-semibold text-[#047857]">
          Produit enregistré avec succès.
        </div>
      ) : null}
      {query?.ai ? (
        <div className="mb-4 rounded-xl border border-[#e9d5ff] bg-[#f5f3ff] px-4 py-3 text-[12px] font-semibold text-[#7e22ce]">
          Brouillon IA appliqué. Le produit est repassé en statut draft pour relecture.
        </div>
      ) : null}

      <div className="mb-4 rounded-2xl border border-[#ececef] bg-white p-4 shadow-[0_1px_2px_rgba(15,17,21,0.04)] lg:hidden">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Actions</p>
          <span className="text-[11px] text-slate-400">Dernière sauvegarde: 2 min</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <AdminRefreshButton label="Actualiser" />
          <Link
            href={`/boutique/${product.slug}`}
            target="_blank"
            className="inline-flex items-center justify-center gap-1 rounded-xl border border-[#ececef] bg-[#fafafa] px-3 py-2 text-[11px] font-semibold text-[#0f1115] transition hover:border-[#0f1115]"
          >
            <Eye size={12} />
            Voir
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form id="product-edit-form" action={updateProductForAdminAction} className="space-y-5">
          <input type="hidden" name="id" value={product.id} />

          <SectionCard n={1} title="Identité">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid">
                <FieldLabel>Titre *</FieldLabel>
                <input name="title" required defaultValue={product.title} className={inputClass} />
              </label>
              <label className="grid">
                <FieldLabel>Slug *</FieldLabel>
                <input name="slug" required defaultValue={product.slug} className={inputClass} />
              </label>
              <label className="grid">
                <FieldLabel>SKU *</FieldLabel>
                <input name="sku" required defaultValue={product.sku} className={inputClass} />
              </label>
              <label className="grid">
                <FieldLabel>Code-barres</FieldLabel>
                <input name="barcode" defaultValue={product.barcode ?? ""} className={inputClass} />
              </label>
              <label className="grid">
                <FieldLabel>ID stock externe (Shopcaisse)</FieldLabel>
                <input name="externalStockId" defaultValue={product.externalStockId ?? ""} className={inputClass} placeholder="—" />
              </label>
              <label className="grid">
                <FieldLabel>Statut</FieldLabel>
                <select name="status" defaultValue={product.status} className={selectClass}>
                  {productStatuses.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </SectionCard>

          <SectionCard n={2} title="Tarification & stock" subtitle="Prix public et inventaire courant">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid">
                <FieldLabel>Prix (centimes) *</FieldLabel>
                <input type="number" name="priceCents" min="0" required defaultValue={product.priceCents} className={inputClass} />
                <span className="mt-1 text-[11px] text-slate-500">Ex: 9600 = 96,00 €</span>
              </label>
              <label className="grid">
                <FieldLabel>Stock *</FieldLabel>
                <input type="number" name="stock" min="0" required defaultValue={product.stock} className={inputClass} />
              </label>
            </div>
          </SectionCard>

          <SectionCard n={3} title="Livraison" subtitle="Conditionnement, poids et options">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid">
                <FieldLabel>Classe logistique</FieldLabel>
                <select name="shippingClass" defaultValue={product.shippingClass} className={selectClass}>
                  {shippingClassOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid">
                <FieldLabel>Poids estimé (grammes) *</FieldLabel>
                <input
                  type="number"
                  name="estimatedWeightGrams"
                  min="0"
                  required
                  defaultValue={product.estimatedWeightGrams}
                  className={inputClass}
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              <label className="inline-flex items-center gap-2 rounded-lg border border-[#ececef] bg-[#fafafa] px-3 py-2 text-[12px] text-slate-600">
                <input type="checkbox" name="pickupOnly" defaultChecked={product.pickupOnly} className="h-4 w-4 accent-[#111]" />
                Retrait boutique uniquement
              </label>
              <label className="inline-flex items-center gap-2 rounded-lg border border-[#ececef] bg-[#fafafa] px-3 py-2 text-[12px] text-slate-600">
                <input type="checkbox" name="isFragile" defaultChecked={product.isFragile} className="h-4 w-4 accent-[#111]" />
                Produit fragile
              </label>
            </div>
          </SectionCard>

          <SectionCard n={4} title="Contenu" subtitle="Descriptions et SEO éditorial">
            <div className="grid gap-4">
              <label className="grid">
                <FieldLabel>Description courte</FieldLabel>
                <textarea name="shortDescription" rows={3} defaultValue={product.shortDescription ?? ""} className={textareaClass} />
              </label>
              <label className="grid">
                <FieldLabel>Description longue</FieldLabel>
                <textarea name="description" rows={8} defaultValue={product.description ?? ""} className={textareaClass} />
              </label>
              <label className="grid">
                <FieldLabel>Alt image principale</FieldLabel>
                <input name="imageAlt" defaultValue="" placeholder={primaryImage?.alt ?? product.title} className={inputClass} />
              </label>
            </div>
          </SectionCard>

          <SectionCard n={5} title="SEO">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid">
                <FieldLabel>Titre SEO</FieldLabel>
                <input name="seoTitle" defaultValue={product.seoTitle ?? ""} className={inputClass} />
              </label>
              <label className="grid">
                <FieldLabel>Description SEO</FieldLabel>
                <textarea name="seoDescription" rows={3} defaultValue={product.seoDescription ?? ""} className={textareaClass} />
              </label>
            </div>
          </SectionCard>

          <SectionCard n={6} title="Catégories">
            <div className="grid gap-3 md:grid-cols-2">
              {categories.map((category) => (
                <label key={category.id} className="inline-flex items-center gap-2 rounded-lg border border-[#ececef] bg-[#fafafa] px-3 py-2 text-[12px] text-slate-600">
                  <input
                    type="checkbox"
                    name="categorySlugs"
                    value={category.slug}
                    defaultChecked={selectedCategories.has(category.slug)}
                    className="h-4 w-4 accent-[#111]"
                  />
                  {category.title}
                </label>
              ))}
            </div>
          </SectionCard>

          <div className="fixed inset-x-3 bottom-3 z-30 rounded-2xl bg-[#0f1115] px-4 py-3 text-white shadow-[0_18px_40px_-16px_rgba(15,17,21,0.18)] lg:sticky lg:inset-x-auto lg:bottom-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 text-[12px]">
                <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                Modifications en cours
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="reset"
                  form="product-edit-form"
                  className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-white/20"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  form="product-edit-form"
                  className="rounded-lg bg-[#f97316] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#ea580c]"
                >
                  Publier les modifications
                </button>
              </div>
            </div>
          </div>
        </form>

        <aside className="self-start overflow-visible lg:sticky lg:top-6">
          <div className="grid gap-4 overflow-visible pr-1 lg:max-h-[calc(100vh-3rem)] lg:overflow-auto">
            <div className="hidden rounded-2xl border border-[#ececef] bg-white p-4 shadow-[0_1px_2px_rgba(15,17,21,0.04)] lg:block">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Actions</p>
                <span className="text-[11px] text-slate-400">Dernière sauvegarde: 2 min</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <AdminRefreshButton label="Actualiser" />
                <Link
                  href={`/boutique/${product.slug}`}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-[#ececef] bg-[#fafafa] px-3 py-2 text-[11px] font-semibold text-[#0f1115] transition hover:border-[#0f1115]"
                >
                  <Eye size={12} />
                  Voir
                </Link>
              </div>
            </div>

            <ProductImageManager productId={product.id} productTitle={product.title} images={product.images} />

            <form action={generateAiProductDraftAction} className="rounded-2xl border border-[#ececef] bg-white p-5 shadow-[0_1px_2px_rgba(15,17,21,0.04)]">
              <input type="hidden" name="id" value={product.id} />
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f5f3ff]">
                  <Sparkles size={13} className="text-[#8b5cf6]" />
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b5cf6]">Brouillon IA</p>
              </div>
              <p className="text-[12px] leading-relaxed text-slate-500">
                Génère description courte, description longue, SEO title, SEO description et alt principal. Le statut repasse en draft pour validation.
              </p>
              <button
                type="submit"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#f5f3ff] px-3 py-2 text-[11px] font-semibold text-[#8b5cf6] transition hover:brightness-95"
              >
                <Sparkles size={12} />
                Générer
              </button>
            </form>

            <div className="rounded-2xl border border-[#ececef] bg-white p-5 shadow-[0_1px_2px_rgba(15,17,21,0.04)]">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef2ff]">
                  <Package size={13} className="text-[#6366f1]" />
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6366f1]">Rappels import</p>
              </div>
              <ul className="grid gap-2.5 text-[12px] leading-relaxed text-slate-500">
                <li>Le CSV peut créer ou mettre à jour un produit.</li>
                <li>Le SKU reste la clé métier d&apos;import.</li>
                <li>La publication finale se fait via le statut active.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
