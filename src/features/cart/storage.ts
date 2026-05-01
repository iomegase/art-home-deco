"use client";

import type { StoredCartItem } from "./types";

const CART_STORAGE_KEY = "art-home-deco-cart";

export function readCart(): StoredCartItem[] {
  const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);

  if (!rawCart) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawCart) as StoredCartItem[];
    return parsed.filter((item) => item.productId && Number.isInteger(item.quantity) && item.quantity > 0);
  } catch {
    return [];
  }
}

export function writeCart(items: StoredCartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addCartItem(productId: string, quantity = 1) {
  const items = readCart();
  const existing = items.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ productId, quantity });
  }

  writeCart(items);
}

export function clearCart() {
  writeCart([]);
}
