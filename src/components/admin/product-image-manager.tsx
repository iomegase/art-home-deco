import {
  deleteProductImageAction,
  importProductImageFromUrlAction,
  reorderProductImagesAction,
  updateProductImageAltAction,
  uploadProductImagesAction,
} from "@/features/product/image-actions";
import { ProductImageFallback } from "@/components/product/product-image-fallback";
import { Upload, Link2, ArrowUp, ArrowDown, Trash2, ImageIcon, Star } from "lucide-react";

type ProductImageManagerProps = {
  productId: string;
  productTitle: string;
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    position: number;
    updatedAt?: Date | string;
  }>;
};

export function ProductImageManager({ productId, productTitle, images }: ProductImageManagerProps) {
  function withCacheBuster(url: string, updatedAt?: Date | string) {
    if (!updatedAt) return url;
    const version = new Date(updatedAt).getTime();
    if (Number.isNaN(version)) return url;
    return url.includes("?") ? `${url}&v=${version}` : `${url}?v=${version}`;
  }

  return (
    <div className="grid gap-3">

      {/* ── Header card ── */}
      <div className="rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: "#fdf2f8" }}
            >
              <ImageIcon size={13} style={{ color: "#ec4899" }} />
            </span>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#ec4899" }}>
              Visuels
            </p>
          </div>
          <span
            className="text-[10px] font-bold tabular-nums"
            style={{ color: images.length >= 6 ? "#ef4444" : "#94a3b8" }}
          >
            {images.length} / 6
          </span>
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
          6 images max · 5 MB · avif / jpg / png / webp
        </p>
      </div>

      {/* ── Upload form ── */}
      <form
        action={uploadProductImagesAction}
        className="rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5"
      >
        <input type="hidden" name="productId" value={productId} />
        <div className="flex items-center gap-2 mb-3">
          <Upload size={12} className="text-slate-400" />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Upload fichiers
          </span>
        </div>
        <input
          type="file"
          name="images"
          accept=".avif,.webp,.jpeg,.jpg,.png,image/avif,image/webp,image/jpeg,image/png"
          multiple
          required
          className="block w-full border border-[#f0f0f0] bg-[#fafafa] px-3 py-2 text-[11px] text-slate-500
            file:mr-3 file:border-0 file:bg-[#111] file:px-3 file:py-1.5
            file:text-[9px] file:font-bold file:uppercase file:tracking-[0.14em] file:text-white"
        />
        <button
          type="submit"
          className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-all hover:brightness-95"
          style={{ backgroundColor: "#eff6ff", color: "#3b82f6" }}
        >
          <Upload size={11} />
          Ajouter les images
        </button>
      </form>

      {/* ── Import URL form ── */}
      <form
        action={importProductImageFromUrlAction}
        className="rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5"
      >
        <input type="hidden" name="productId" value={productId} />
        <div className="flex items-center gap-2 mb-3">
          <Link2 size={12} className="text-slate-400" />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Import par URL
          </span>
        </div>
        <div className="grid gap-2">
          <input
            type="url"
            name="imageUrl"
            required
            placeholder="https://..."
            className="w-full border-0 border-b border-[#e8e8e8] bg-transparent px-0 py-2 text-[12px] text-[#111] outline-none transition placeholder:text-slate-300 focus:border-[#111]"
          />
          <input
            name="alt"
            defaultValue={productTitle}
            placeholder="Texte alternatif"
            className="w-full border-0 border-b border-[#e8e8e8] bg-transparent px-0 py-2 text-[12px] text-[#111] outline-none transition placeholder:text-slate-300 focus:border-[#111]"
          />
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
          URL publique http/https · téléchargée côté serveur.
        </p>
        <button
          type="submit"
          className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-all hover:brightness-95"
          style={{ backgroundColor: "#f5f3ff", color: "#8b5cf6" }}
        >
          <Link2 size={11} />
          Importer depuis URL
        </button>
      </form>

      {/* ── Image list ── */}
      {images.length === 0 ? (
        <div className="rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-5 py-8 text-center">
          <ImageIcon size={24} className="mx-auto mb-3 text-slate-200" />
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">
            Aucune image
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4"
            >
              <div className="flex gap-3">
                {/* Thumbnail */}
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden bg-[#f6f5f3]">
                  <ProductImageFallback
                    src={withCacheBuster(image.url, image.updatedAt)}
                    alt={image.alt ?? productTitle}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 grid gap-2">
                  {/* Position + badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tabular-nums text-slate-400">
                      #{image.position}
                    </span>
                    {index === 0 && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]"
                        style={{ backgroundColor: "#fdf2f8", color: "#ec4899" }}
                      >
                        <Star size={8} />
                        Principale
                      </span>
                    )}
                  </div>

                  {/* Alt form */}
                  <form
                    action={updateProductImageAltAction}
                    className="flex items-center gap-2"
                  >
                    <input type="hidden" name="imageId" value={image.id} />
                    <input
                      name="alt"
                      defaultValue={image.alt ?? ""}
                      placeholder="Texte alt…"
                      className="min-w-0 flex-1 border-0 border-b border-[#e8e8e8] bg-transparent px-0 py-1 text-[11px] text-[#111] outline-none placeholder:text-slate-300 focus:border-[#111]"
                    />
                    <button
                      type="submit"
                      className="flex-shrink-0 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] transition hover:brightness-95"
                      style={{ backgroundColor: "#f0fdf4", color: "#22c55e" }}
                    >
                      OK
                    </button>
                  </form>

                  {/* Reorder + delete */}
                  <div className="flex items-center gap-1.5">
                    <form action={reorderProductImagesAction}>
                      <input type="hidden" name="productId" value={productId} />
                      <input type="hidden" name="imageId" value={image.id} />
                      <input type="hidden" name="direction" value="up" />
                      <button
                        type="submit"
                        title="Monter"
                        className="flex h-7 w-7 items-center justify-center transition hover:brightness-95"
                        style={{ backgroundColor: "#f8fafc", color: "#94a3b8" }}
                      >
                        <ArrowUp size={11} strokeWidth={2.5} />
                      </button>
                    </form>
                    <form action={reorderProductImagesAction}>
                      <input type="hidden" name="productId" value={productId} />
                      <input type="hidden" name="imageId" value={image.id} />
                      <input type="hidden" name="direction" value="down" />
                      <button
                        type="submit"
                        title="Descendre"
                        className="flex h-7 w-7 items-center justify-center transition hover:brightness-95"
                        style={{ backgroundColor: "#f8fafc", color: "#94a3b8" }}
                      >
                        <ArrowDown size={11} strokeWidth={2.5} />
                      </button>
                    </form>
                    <form action={deleteProductImageAction}>
                      <input type="hidden" name="imageId" value={image.id} />
                      <button
                        type="submit"
                        title="Supprimer"
                        className="flex h-7 w-7 items-center justify-center transition hover:brightness-95"
                        style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}
                      >
                        <Trash2 size={11} strokeWidth={2.5} />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
