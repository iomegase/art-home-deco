"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { deleteBlogPostForAdminAction } from "@/features/blog/actions";

type Props = {
  id: string;
  title: string;
};

export function DeleteBlogPostButton({ id, title }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("id", id);
      await deleteBlogPostForAdminAction(fd);
    });
  }

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Supprimer"
        aria-label={`Supprimer ${title}`}
        className="flex h-8 w-8 items-center justify-center transition-all hover:brightness-95"
        style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}
      >
        <Trash2 size={13} strokeWidth={2.5} />
      </button>

      {/* Backdrop + Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.40)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="w-full max-w-[400px] overflow-hidden rounded-2xl bg-white shadow-[0_16px_48px_rgba(0,0,0,0.20)]"
            style={{ animation: "modalIn 0.18s cubic-bezier(0.22,1,0.36,1) both" }}
          >
            {/* Header */}
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
                  <p className="mt-0.5 text-[15px] font-[600] leading-tight text-[#111]">
                    Supprimer l&apos;article ?
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-[#f5f5f5] hover:text-slate-500"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 pb-5">
              <p className="text-[11px] leading-relaxed text-slate-500">
                Vous êtes sur le point de supprimer définitivement{" "}
                <span className="font-bold text-[#111]">
                  &laquo;&nbsp;{title}&nbsp;&raquo;
                </span>
                . Cette action est irréversible.
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#f0f0f0]" />

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 transition hover:text-[#111] disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
                className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:brightness-90 disabled:opacity-60"
                style={{ backgroundColor: "#ef4444" }}
              >
                {isPending ? (
                  <>
                    <span
                      className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"
                    />
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
      )}

      {/* Keyframe */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </>
  );
}
