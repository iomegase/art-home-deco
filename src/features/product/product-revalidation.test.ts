import test from "node:test";
import assert from "node:assert/strict";

const { PRODUCT_DELETE_REVALIDATION_PATHS } = (await import(
  new URL("./product-revalidation.ts", import.meta.url).href
)) as typeof import("./product-revalidation");

test("revalide la liste des images manquantes après une suppression", () => {
  assert.deepEqual(PRODUCT_DELETE_REVALIDATION_PATHS, [
    "/admin/products",
    "/admin/products/missing-images",
    "/boutique",
  ]);
});
