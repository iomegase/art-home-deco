"use client";

import { useEffect, useRef } from "react";
import { trackPurchase } from "@/lib/analytics/ecommerce";
import type { AnalyticsOrder } from "@/types/analytics";

type PurchaseRelayResponse =
  | {
      tracked: false;
    }
  | {
      tracked: true;
      order: AnalyticsOrder;
    };

export function PurchaseRelay({ sessionId }: { sessionId: string }) {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      return;
    }

    started.current = true;

    fetch("/api/analytics/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        const payload = (await response.json()) as PurchaseRelayResponse;
        return payload;
      })
      .then((payload) => {
        if (!payload || !payload.tracked) {
          return;
        }

        trackPurchase(payload.order);
      })
      .catch(() => {
        return;
      });
  }, [sessionId]);

  return null;
}
