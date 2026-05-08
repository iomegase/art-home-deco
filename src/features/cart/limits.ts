import type { StoredCartItem } from "./types";

type CartMutationInput = {
  items: StoredCartItem[];
  productId: string;
  availableStock: number;
};

type CartAdditionInput = CartMutationInput & {
  requestedQuantity: number;
};

type CartQuantityUpdateInput = CartMutationInput & {
  nextQuantity: number;
};

type CartMutationResult = {
  ok: boolean;
  items: StoredCartItem[];
  quantityInCart: number;
  reason?: "invalid_quantity" | "stock_limit_reached";
};

export function normalizeCartItems(items: StoredCartItem[]): StoredCartItem[] {
  const quantitiesByProductId = new Map<string, number>();

  for (const item of items) {
    if (!item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0) {
      continue;
    }

    quantitiesByProductId.set(item.productId, (quantitiesByProductId.get(item.productId) ?? 0) + item.quantity);
  }

  return Array.from(quantitiesByProductId.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

export function getCartQuantityForProduct(items: StoredCartItem[], productId: string) {
  return normalizeCartItems(items)
    .filter((item) => item.productId === productId)
    .reduce((sum, item) => sum + item.quantity, 0);
}

export function buildCartAdditionResult(input: CartAdditionInput): CartMutationResult {
  const items = normalizeCartItems(input.items);

  if (!Number.isInteger(input.requestedQuantity) || input.requestedQuantity <= 0) {
    return {
      ok: false,
      items,
      quantityInCart: getCartQuantityForProduct(items, input.productId),
      reason: "invalid_quantity",
    };
  }

  const quantityInCart = getCartQuantityForProduct(items, input.productId);
  const nextQuantity = quantityInCart + input.requestedQuantity;

  if (nextQuantity > input.availableStock) {
    return {
      ok: false,
      items,
      quantityInCart,
      reason: "stock_limit_reached",
    };
  }

  const nextItems = items.filter((item) => item.productId !== input.productId);
  nextItems.push({ productId: input.productId, quantity: nextQuantity });

  return {
    ok: true,
    items: normalizeCartItems(nextItems),
    quantityInCart: nextQuantity,
  };
}

export function buildCartQuantityUpdateResult(input: CartQuantityUpdateInput): CartMutationResult {
  const items = normalizeCartItems(input.items);
  const currentQuantity = getCartQuantityForProduct(items, input.productId);

  if (!Number.isInteger(input.nextQuantity)) {
    return {
      ok: false,
      items,
      quantityInCart: currentQuantity,
      reason: "invalid_quantity",
    };
  }

  if (input.nextQuantity < 0) {
    return {
      ok: false,
      items,
      quantityInCart: currentQuantity,
      reason: "invalid_quantity",
    };
  }

  if (input.nextQuantity > input.availableStock) {
    return {
      ok: false,
      items,
      quantityInCart: currentQuantity,
      reason: "stock_limit_reached",
    };
  }

  const nextItems = items.filter((item) => item.productId !== input.productId);

  if (input.nextQuantity > 0) {
    nextItems.push({ productId: input.productId, quantity: input.nextQuantity });
  }

  return {
    ok: true,
    items: normalizeCartItems(nextItems),
    quantityInCart: Math.max(0, input.nextQuantity),
  };
}
