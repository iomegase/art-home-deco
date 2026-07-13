"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { deleteProductsPermanentlyForAdminAction } from "@/features/product/actions";

type BulkDeleteProductsDialogProps = {
  productIds: string[];
  includesShopcaisseProducts: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
};

export function BulkDeleteProductsDialog({
  productIds,
  includesShopcaisseProducts,
  open,
  onOpenChange,
  onDeleted,
}: BulkDeleteProductsDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  const productCount = productIds.length;
  const productLabel = `${productCount} produit${productCount > 1 ? "s" : ""}`;

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) {
      return;
    }

    if (!nextOpen) {
      setError(null);
    }
    onOpenChange(nextOpen);
  }

  function handleConfirm() {
    if (isPending || productIds.length === 0) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      for (const productId of productIds) {
        formData.append("ids", productId);
      }

      try {
        const result = await deleteProductsPermanentlyForAdminAction(formData);

        if (!result.ok) {
          setError(result.error);
          return;
        }

        onDeleted();
        onOpenChange(false);
        router.refresh();
      } catch {
        setError("La suppression a échoué. Veuillez réessayer.");
      }
    });
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.40)" }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            handleOpenChange(false);
          }
        }}
      >
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="bulk-delete-products-title"
          aria-describedby="bulk-delete-products-description"
          className="w-full max-w-[400px] overflow-hidden rounded-2xl bg-white shadow-[0_16px_48px_rgba(0,0,0,0.20)]"
          style={{ animation: "modalIn 0.18s cubic-bezier(0.22,1,0.36,1) both" }}
        >
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: "#fef2f2" }}
              >
                <AlertTriangle size={16} style={{ color: "#ef4444" }} strokeWidth={2.5} />
              </span>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Confirmation
                </p>
                <h2
                  id="bulk-delete-products-title"
                  className="mt-0.5 text-[15px] font-[600] leading-tight text-[#111]"
                >
                  Supprimer {productLabel} ?
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
              aria-label="Fermer la confirmation de suppression"
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-[#f5f5f5] hover:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>

          <div className="px-6 pb-5">
            <p
              id="bulk-delete-products-description"
              className="text-[11px] leading-relaxed text-slate-500"
            >
              Vous êtes sur le point de supprimer définitivement {productLabel}. Cette action est
              irréversible. L&apos;historique des commandes sera conservé.
            </p>
            {includesShopcaisseProducts && (
              <p className="mt-3 rounded-xl bg-[#fff7ed] px-3 py-2.5 text-[10px] leading-relaxed text-[#c2410c]">
                La sélection contient au moins un produit Shopcaisse. Sa suppression ici ne le
                supprimera pas de Shopcaisse.
              </p>
            )}
            {error && (
              <p role="alert" className="mt-3 text-[10px] font-bold leading-relaxed text-[#ef4444]">
                {error}
              </p>
            )}
          </div>

          <div className="h-px bg-[#f0f0f0]" />

          <div className="flex items-center justify-end gap-2 px-6 py-4">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
              aria-label="Annuler la suppression définitive"
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 transition hover:text-[#111] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending || productIds.length === 0}
              aria-label={`Supprimer définitivement ${productLabel}`}
              className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: "#ef4444" }}
            >
              {isPending ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Suppression…
                </>
              ) : (
                <>
                  <Trash2 size={11} strokeWidth={2.5} />
                  Supprimer
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </>
  );
}
