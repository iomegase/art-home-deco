"use client";

import { useEffect } from "react";
import { trackViewItemList } from "@/lib/analytics/ecommerce";
import type { AnalyticsProduct } from "@/types/analytics";

export function TrackViewItemList({ products, listName }: { products: AnalyticsProduct[]; listName: string }) {
  useEffect(() => {
    if (products.length === 0) {
      return;
    }

    trackViewItemList(products, listName);
  }, [products, listName]);

  return null;
}
