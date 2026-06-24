"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pen, Trash2, ImageOff, Package, Search } from "lucide-react";
import { ProductImageFallback } from "@/components/product/product-image-fallback";
import { formatPriceCents } from "@/features/product/format";
import { archiveProductForAdminAction } from "@/features/product/actions";
import type { listAdminProducts } from "@/server/repositories/admin-product.repository";

type AdminProduct = Awaited<ReturnType<typeof listAdminProducts>>[number];

// Lowercase + strip accents so "bol" matches "Bôl".
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function ProductsTable({ products }: { products: AdminProduct[] }) {
  const [query, setQuery] = useState("");

  const trimmedQuery = query.trim();

  const filtered = useMemo(() => {
    if (!trimmedQuery) {
      return products;
    }
    const needle = normalize(trimmedQuery);
    return products.filter((product) => normalize(product.title).includes(needle));
  }, [products, trimmedQuery]);

  return (
    <div className="grid gap-4">
      {/* ── Search bar ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un produit…"
            aria-label="Rechercher un produit par nom"
            className="w-full border border-[#ececec] bg-white py-2.5 pl-9 pr-3 text-[12px] text-[#111] outline-none transition focus:border-[#3b82f6]"
          />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          {filtered.length} produit{filtered.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto bg-white shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
        <table className="w-full min-w-[1100px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#f0f0f0] bg-[#fafafa]">
              {["#", "Produit", "SKU", "Statut", "Prix", "Stock", "Livraison", "Source", ""].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((product, index) => {
              const isActive = product.status === "active";
              const stockColor =
                product.stock === 0
                  ? "#ef4444"
                  : product.stock <= 5
                  ? "#f97316"
                  : "#22c55e";
              const isShopcaisse = Boolean(product.externalStockId);

              return (
                <tr
                  key={product.id}
                  className="group border-b border-[#f8f8f8] bg-white transition-colors hover:bg-[#fafafa]"
                >
                  {/* # */}
                  <td className="px-4 py-3.5">
                    <span className="text-[11px] font-bold tabular-nums text-slate-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </td>

                  {/* Produit */}
                  <td className="px-4 py-3.5">
                    <div className="flex min-w-[220px] items-center gap-3">
                      <div className="h-11 w-11 flex-shrink-0 overflow-hidden bg-[#f6f5f3]">
                        <ProductImageFallback
                          src={product.images[0]?.url}
                          alt={product.images[0]?.alt || product.title}
                          width={88}
                          height={88}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="block max-w-[200px] truncate text-[12px] font-bold text-[#111] transition hover:text-[#3b82f6]"
                        >
                          {product.title}
                        </Link>
                        <p className="mt-0.5 max-w-[200px] truncate text-[11px] text-slate-400">
                          {product.categories.map((e) => e.category.title).join(", ") || "Sans catégorie"}
                        </p>
                        {product.images.length === 0 && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#ef4444]">
                            <ImageOff size={9} /> sans photo
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-[10px] text-slate-400">
                      {product.sku || "—"}
                    </span>
                  </td>

                  {/* Statut */}
                  <td className="px-4 py-3.5">
                    <span
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em]"
                      style={{ color: isActive ? "#22c55e" : "#f97316" }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: isActive ? "#22c55e" : "#f97316" }}
                      />
                      {isActive ? "Actif" : "Brouillon"}
                    </span>
                  </td>

                  {/* Prix */}
                  <td className="px-4 py-3.5">
                    <span className="text-[12px] font-bold text-[#111]">
                      {formatPriceCents(product.priceCents)}
                    </span>
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-3.5">
                    <span
                      className="text-[12px] font-bold tabular-nums"
                      style={{ color: stockColor }}
                    >
                      {product.stock}
                    </span>
                  </td>

                  {/* Livraison */}
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-[10px] text-slate-400">
                      {product.shippingClass}
                    </span>
                  </td>

                  {/* Source */}
                  <td className="px-4 py-3.5">
                    <span
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em]"
                      style={{ color: isShopcaisse ? "#8b5cf6" : "#94a3b8" }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: isShopcaisse ? "#8b5cf6" : "#94a3b8" }}
                      />
                      {isShopcaisse ? "Shopcaisse" : "Local"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        title="Modifier"
                        aria-label={`Modifier ${product.title}`}
                        className="flex h-8 w-8 items-center justify-center bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all hover:brightness-95"
                        style={{ backgroundColor: "#eff6ff", color: "#3b82f6" }}
                      >
                        <Pen size={13} strokeWidth={2.5} />
                      </Link>

                      <form action={archiveProductForAdminAction}>
                        <input type="hidden" name="id" value={product.id} />
                        <button
                          type="submit"
                          title="Retirer"
                          aria-label={`Retirer ${product.title}`}
                          className="flex h-8 w-8 items-center justify-center bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all hover:brightness-95"
                          style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}
                        >
                          <Trash2 size={13} strokeWidth={2.5} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-16 text-center">
                  <Package size={28} className="mx-auto mb-4 text-slate-200" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">
                    {trimmedQuery
                      ? `Aucun produit ne correspond à « ${trimmedQuery} ».`
                      : "Aucun produit dans le catalogue."}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
