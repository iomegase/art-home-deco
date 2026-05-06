"use client";

import { useEffect } from "react";
import { trackViewItem } from "@/lib/analytics/ecommerce";
import type { AnalyticsProduct } from "@/types/analytics";

export function TrackViewItem({ product }: { product: AnalyticsProduct }) {
  useEffect(() => {
    trackViewItem(product);
  }, [product]);

  return null;
}
