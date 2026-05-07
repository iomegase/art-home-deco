"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw } from "lucide-react";

type AdminRefreshButtonProps = {
  label?: string;
};

export function AdminRefreshButton({ label = "Actualiser" }: AdminRefreshButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(() => {
          router.refresh();
        });
      }}
      disabled={isPending}
      className="inline-flex items-center gap-2 border border-line px-4 py-2 text-sm font-bold hover:border-foreground disabled:cursor-not-allowed disabled:opacity-60"
    >
      <RefreshCcw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
      <span>{isPending ? "Actualisation..." : label}</span>
    </button>
  );
}
