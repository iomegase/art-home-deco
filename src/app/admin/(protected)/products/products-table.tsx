"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Pen,
  Trash2,
  ImageOff,
  Package,
  Search,
} from "lucide-react";
import { ProductImageFallback } from "@/components/product/product-image-fallback";
import { formatPriceCents } from "@/features/product/format";
import { archiveProductForAdminAction } from "@/features/product/actions";
import {
  getHeaderSelectionState,
  toggleFilteredSelection,
  toggleProductSelection,
} from "@/features/product/admin-product-selection";
import {
  getAdminProductsPaginationItems,
  getAdminProductsPaginationState,
} from "@/features/product/admin-product-pagination";
import type { listAdminProducts } from "@/server/repositories/admin-product.repository";
import { BulkDeleteProductsDialog } from "./bulk-delete-products-dialog";

type AdminProduct = Awaited<ReturnType<typeof listAdminProducts>>[number];

// Lowercase + strip accents so "bol" matches "Bôl".
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

type SelectionCheckboxProps = {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  ariaLabel: string;
  disabled?: boolean;
};

function SelectionCheckbox({
  checked,
  indeterminate = false,
  onChange,
  ariaLabel,
  disabled = false,
}: SelectionCheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(node) => {
        if (node) {
          node.indeterminate = indeterminate;
        }
      }}
      onChange={onChange}
      aria-label={ariaLabel}
      disabled={disabled}
      className="h-4 w-4 cursor-pointer accent-[#ef4444] disabled:cursor-not-allowed disabled:opacity-40"
    />
  );
}

export function ProductsTable({ products }: { products: AdminProduct[] }) {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const trimmedQuery = query.trim();

  const filtered = useMemo(() => {
    if (!trimmedQuery) {
      return products;
    }
    const needle = normalize(trimmedQuery);
    return products.filter((product) => normalize(product.title).includes(needle));
  }, [products, trimmedQuery]);

  const pagination = getAdminProductsPaginationState(filtered.length, currentPage);
  const visibleProducts = useMemo(
    () => filtered.slice(pagination.startIndex, pagination.endIndex),
    [filtered, pagination.startIndex, pagination.endIndex],
  );
  const visibleIds = useMemo(
    () => visibleProducts.map((product) => product.id),
    [visibleProducts],
  );
  const paginationItems = getAdminProductsPaginationItems(
    pagination.totalPages,
    pagination.currentPage,
  );
  const selectedProducts = products.filter((product) => selectedIds.has(product.id));
  const selectedProductIds = selectedProducts.map((product) => product.id);
  const headerState = getHeaderSelectionState(selectedIds, visibleIds);

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
            ref={searchInputRef}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Rechercher un produit…"
            aria-label="Rechercher un produit par nom"
            className="w-full border border-[#ececec] bg-white py-2.5 pl-9 pr-3 text-[12px] text-[#111] outline-none transition focus:border-[#3b82f6]"
          />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          {filtered.length} produit{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {selectedProducts.length > 0 && (
        <div className="flex flex-col gap-3 border border-[#fecaca] bg-[#fef2f2] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b91c1c]">
            {selectedProducts.length} produit{selectedProducts.length > 1 ? "s" : ""} sélectionné
            {selectedProducts.length > 1 ? "s" : ""}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500 transition hover:text-[#111]"
            >
              Tout désélectionner
            </button>
            <button
              type="button"
              onClick={() => setDeleteDialogOpen(true)}
              className="flex items-center gap-2 bg-[#ef4444] px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white transition hover:brightness-90"
            >
              <Trash2 size={11} strokeWidth={2.5} />
              Supprimer définitivement
            </button>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#f0f0f0] bg-[#fafafa]">
              <th className="px-4 py-3">
                <SelectionCheckbox
                  checked={headerState.checked}
                  indeterminate={headerState.indeterminate}
                  onChange={() =>
                    setSelectedIds((current) => toggleFilteredSelection(current, visibleIds))
                  }
                  ariaLabel={
                    headerState.checked
                      ? "Désélectionner les produits de la page courante"
                      : "Sélectionner les produits de la page courante"
                  }
                  disabled={visibleIds.length === 0}
                />
              </th>
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
            {visibleProducts.map((product, index) => {
              const isActive = product.status === "active";
              const stockColor =
                product.stock === 0
                  ? "#ef4444"
                  : product.stock <= 5
                  ? "#f97316"
                  : "#22c55e";
              const isShopcaisse = Boolean(product.externalStockId);
              const isSelected = selectedIds.has(product.id);

              return (
                <tr
                  key={product.id}
                  className={`group border-b border-[#f8f8f8] transition-colors hover:bg-[#fafafa] ${
                    isSelected ? "bg-[#fff7f7]" : "bg-white"
                  }`}
                >
                  {/* Sélection */}
                  <td className="px-4 py-3.5">
                    <SelectionCheckbox
                      checked={isSelected}
                      onChange={() =>
                        setSelectedIds((current) => toggleProductSelection(current, product.id))
                      }
                      ariaLabel={`${isSelected ? "Désélectionner" : "Sélectionner"} ${
                        product.title
                      }`}
                    />
                  </td>

                  {/* # */}
                  <td className="px-4 py-3.5">
                    <span className="text-[11px] font-bold tabular-nums text-slate-300">
                      {String(pagination.startIndex + index + 1).padStart(2, "0")}
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
                <td colSpan={10} className="px-4 py-16 text-center">
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

        {filtered.length > 0 && (
          <nav
            aria-label="Pagination des produits"
            className="flex flex-col gap-3 border-t border-[#f0f0f0] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              {pagination.startIndex + 1}–{pagination.endIndex} sur {filtered.length} produit
              {filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                disabled={pagination.currentPage === 1}
                onClick={() => setCurrentPage(pagination.currentPage - 1)}
                aria-label="Page précédente"
                className="flex h-8 items-center gap-1 px-2 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft size={12} /> Précédent
              </button>

              {paginationItems.map((item) =>
                typeof item === "number" ? (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCurrentPage(item)}
                    aria-label={`Page ${item}`}
                    aria-current={item === pagination.currentPage ? "page" : undefined}
                    className="flex h-8 min-w-8 items-center justify-center text-[10px] font-bold transition hover:bg-slate-50"
                    style={
                      item === pagination.currentPage
                        ? { backgroundColor: "#111", color: "#fff" }
                        : { color: "#64748b" }
                    }
                  >
                    {item}
                  </button>
                ) : (
                  <span
                    key={item}
                    aria-hidden="true"
                    className="flex h-8 min-w-6 items-center justify-center text-slate-300"
                  >
                    …
                  </span>
                ),
              )}

              <button
                type="button"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => setCurrentPage(pagination.currentPage + 1)}
                aria-label="Page suivante"
                className="flex h-8 items-center gap-1 px-2 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Suivant <ChevronRight size={12} />
              </button>
            </div>
          </nav>
        )}
      </div>

      <BulkDeleteProductsDialog
        productIds={selectedProductIds}
        includesShopcaisseProducts={selectedProducts.some((product) => product.externalStockId)}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleted={() => setSelectedIds(new Set())}
        fallbackFocusRef={searchInputRef}
      />
    </div>
  );
}
