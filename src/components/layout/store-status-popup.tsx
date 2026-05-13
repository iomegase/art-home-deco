"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { StoreStatusSettings } from "@/features/admin-home/types";
import { isStoreOpenNow } from "@/lib/store-status";

type Props = {
  storeStatus: StoreStatusSettings;
};

export function StoreStatusPopup({ storeStatus }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const pathname = usePathname();

  const popup = useMemo(() => {
    if (!storeStatus.physicalStoreEnabled) return null;

    if (storeStatus.vacationModeEnabled) {
      const suffix = storeStatus.vacationReturnDate
        ? ` ${storeStatus.vacationReturnDate}.`
        : ".";
      return {
        title: "Boutique en vacances",
        message: `${storeStatus.vacationMessage}${suffix}`,
      };
    }

    if (storeStatus.showPopupWhenClosed && !isStoreOpenNow(storeStatus)) {
      return {
        title: "Boutique physique fermée",
        message: storeStatus.closedMessage,
      };
    }

    return null;
  }, [storeStatus]);

  if (pathname !== "/" || !popup || dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-[260] flex items-center justify-center bg-black/5 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-status-popup-title"
      onClick={() => setDismissed(true)}
    >
      <div
        className="w-full max-w-2xl  bg-white p-6 "
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="store-status-popup-title" className="text-lg font-semibold text-[#171717]">
          {popup.title}
        </h3>
        <p className="mt-3 text-sm text-[#404143]">{popup.message}</p>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="border border-[#171717] px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#171717] transition hover:bg-[#171717] hover:text-white"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
