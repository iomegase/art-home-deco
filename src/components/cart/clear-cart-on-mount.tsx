"use client";

import { useEffect } from "react";
import { clearCart } from "@/features/cart/storage";

export function ClearCartOnMount() {
  useEffect(() => {
    clearCart();
  }, []);

  return null;
}
