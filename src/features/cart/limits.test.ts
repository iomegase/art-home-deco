import test from "node:test";
import assert from "node:assert/strict";

const cartModule = (await import(new URL("./limits.ts", import.meta.url).href)) as typeof import("./limits");

test("normalizeCartItems merges duplicate product lines and drops invalid quantities", () => {
  const normalized = cartModule.normalizeCartItems([
    { productId: "product-1", quantity: 1 },
    { productId: "product-1", quantity: 2 },
    { productId: "product-2", quantity: 0 },
    { productId: "product-3", quantity: -1 },
    { productId: "product-4", quantity: 3 },
  ]);

  assert.deepEqual(normalized, [
    { productId: "product-1", quantity: 3 },
    { productId: "product-4", quantity: 3 },
  ]);
});

test("buildCartAdditionResult blocks an add when the product quantity would exceed stock", () => {
  const result = cartModule.buildCartAdditionResult({
    items: [{ productId: "product-1", quantity: 2 }],
    productId: "product-1",
    requestedQuantity: 1,
    availableStock: 2,
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "stock_limit_reached");
  assert.equal(result.quantityInCart, 2);
});

test("buildCartAdditionResult merges quantities when the add stays within stock", () => {
  const result = cartModule.buildCartAdditionResult({
    items: [{ productId: "product-1", quantity: 1 }],
    productId: "product-1",
    requestedQuantity: 1,
    availableStock: 3,
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.items, [{ productId: "product-1", quantity: 2 }]);
  assert.equal(result.quantityInCart, 2);
});

test("buildCartQuantityUpdateResult refuses quantities above stock and removes lines at zero", () => {
  const overLimit = cartModule.buildCartQuantityUpdateResult({
    items: [{ productId: "product-1", quantity: 2 }],
    productId: "product-1",
    nextQuantity: 3,
    availableStock: 2,
  });
  assert.equal(overLimit.ok, false);
  assert.equal(overLimit.reason, "stock_limit_reached");

  const removed = cartModule.buildCartQuantityUpdateResult({
    items: [{ productId: "product-1", quantity: 2 }],
    productId: "product-1",
    nextQuantity: 0,
    availableStock: 2,
  });
  assert.equal(removed.ok, true);
  assert.deepEqual(removed.items, []);
});
