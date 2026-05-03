import test from "node:test";
import assert from "node:assert/strict";

const { getCartItemCount } = (await import(new URL("./count.ts", import.meta.url).href)) as typeof import("./count");

test("getCartItemCount sums quantities from stored cart items", () => {
  const count = getCartItemCount([
    { productId: "product-1", quantity: 1 },
    { productId: "product-2", quantity: 2 },
    { productId: "product-3", quantity: 3 },
  ]);

  assert.equal(count, 6);
});

test("getCartItemCount ignores invalid or non-positive quantities", () => {
  const count = getCartItemCount([
    { productId: "product-1", quantity: 1 },
    { productId: "product-2", quantity: 0 },
    { productId: "product-3", quantity: -2 },
  ]);

  assert.equal(count, 1);
});
