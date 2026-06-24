import Link from "next/link";
import { ImageOff, Plus } from "lucide-react";
import { listAdminProducts } from "@/server/repositories/admin-product.repository";
import { ProductsTable } from "./products-table";

export default async function AdminProductsPage() {
  const products = await listAdminProducts();
  const activeCount = products.filter((p) => p.status === "active").length;
  const draftCount = products.filter((p) => p.status === "draft").length;
  const missingImagesCount = products.filter((p) => p.images.length === 0).length;
  const shopcaisseLinkedCount = products.filter((p) => Boolean(p.externalStockId)).length;

  const stats = [
    { label: "Total",       value: products.length,      color: "#3b82f6", bg: "#eff6ff" },
    { label: "Actifs",      value: activeCount,           color: "#22c55e", bg: "#f0fdf4" },
    { label: "Brouillons",  value: draftCount,            color: "#f97316", bg: "#fff7ed" },
    { label: "Shopcaisse",  value: shopcaisseLinkedCount, color: "#8b5cf6", bg: "#f5f3ff" },
  ];

  return (
    <div className="grid gap-10">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
            Catalogue produits
          </p>
          <h1 className="mt-2 text-[36px] font-[200] leading-none tracking-[-0.04em] text-[#111]">
            Produits
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/missing-images"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-all hover:brightness-95"
            style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}
          >
            <ImageOff size={13} />
            Sans photo
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-[#111] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-all hover:bg-[#333]"
          >
            <Plus size={13} />
            Import / Brouillon
          </Link>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.10)]"
          >
            <span
              className="absolute inset-y-0 left-0 w-[3px]"
              style={{ backgroundColor: stat.color }}
            />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              {stat.label}
            </p>
            <p
              className="mt-2 text-[44px] font-[100] leading-none tracking-[-0.04em]"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
            {stat.label === "Shopcaisse" && (
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Sans photo : <span style={{ color: missingImagesCount > 0 ? "#ef4444" : "#22c55e" }}>{missingImagesCount}</span>
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ── Search + Table ── */}
      <ProductsTable products={products} />
    </div>
  );
}
