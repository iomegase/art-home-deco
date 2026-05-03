import type { StoredCartItem } from "./types";

export function getCartItemCount(items: StoredCartItem[]): number {
  return items.reduce((sum, item) => {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return sum;
    }

    return sum + item.quantity;
  }, 0);
}
