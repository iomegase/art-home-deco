"use client";

import {
  buildCartAdditionResult,
  buildCartQuantityUpdateResult,
  normalizeCartItems,
} from "./limits";
import type { StoredCartItem } from "./types";

const CART_STORAGE_KEY = "art-home-deco-cart";

export function readCart(): StoredCartItem[] {
  const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);

  if (!rawCart) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawCart) as StoredCartItem[];
    return normalizeCartItems(parsed);
  } catch {
    return [];
  }
}

export function writeCart(items: StoredCartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalizeCartItems(items)));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addCartItem(productId: string, quantity = 1, availableStock = Number.MAX_SAFE_INTEGER) {
  const result = buildCartAdditionResult({
    items: readCart(),
    productId,
    requestedQuantity: quantity,
    availableStock,
  });

  if (result.ok) {
    writeCart(result.items);
  }

  return result;
}

export function updateCartItemQuantity(productId: string, nextQuantity: number, availableStock: number) {
  const result = buildCartQuantityUpdateResult({
    items: readCart(),
    productId,
    nextQuantity,
    availableStock,
  });

  if (result.ok) {
    writeCart(result.items);
  }

  return result;
}

export function clearCart() {
  writeCart([]);
}
