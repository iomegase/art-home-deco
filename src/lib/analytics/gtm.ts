import type { DataLayerEvent } from "@/types/analytics";

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
  }
}

export function pushToDataLayer(event: DataLayerEvent) {
  if (typeof window === "undefined") {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}
