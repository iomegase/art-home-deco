import assert from "node:assert/strict";
import test from "node:test";

const schemaModule = (await import(
  new URL("./product-bulk-delete.schema.ts", import.meta.url).href
)) as typeof import("./product-bulk-delete.schema");

test("parseProductBulkDeleteIds rejects an empty selection", () => {
  assert.throws(() => schemaModule.parseProductBulkDeleteIds([]));
});

test("parseProductBulkDeleteIds trims and deduplicates product ids", () => {
  assert.deepEqual(schemaModule.parseProductBulkDeleteIds([" p1 ", "p2", "p1"]), ["p1", "p2"]);
});

test("parseProductBulkDeleteIds rejects more than 1000 distinct product ids", () => {
  const ids = Array.from({ length: 1001 }, (_, index) => `p${index}`);

  assert.throws(() => schemaModule.parseProductBulkDeleteIds(ids));
});
