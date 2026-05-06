"use client";

import { useEffect, useRef } from "react";
import { trackBeginCheckout } from "@/lib/analytics/ecommerce";
import type { AnalyticsCart } from "@/types/analytics";

export function TrackBeginCheckout({ cart }: { cart: AnalyticsCart }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) {
      return;
    }

    tracked.current = true;
    trackBeginCheckout(cart);
  }, [cart]);

  return null;
}
