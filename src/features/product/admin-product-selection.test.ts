import assert from "node:assert/strict";
import test from "node:test";

const selectionModule = (await import(
  new URL("./admin-product-selection.ts", import.meta.url).href
)) as typeof import("./admin-product-selection");

test("toggleProductSelection adds then removes an individual product", () => {
  const selected = new Set<string>();
  const added = selectionModule.toggleProductSelection(selected, "p1");
  const removed = selectionModule.toggleProductSelection(added, "p1");

  assert.deepEqual([...added], ["p1"]);
  assert.deepEqual([...removed], []);
  assert.notEqual(added, selected);
  assert.notEqual(removed, added);
});

test("toggleFilteredSelection preserves products outside the filter and toggles only filtered products", () => {
  const selected = new Set(["outside"]);
  const added = selectionModule.toggleFilteredSelection(selected, ["p1", "p2"]);
  const removed = selectionModule.toggleFilteredSelection(added, ["p1", "p2"]);

  assert.deepEqual([...added], ["outside", "p1", "p2"]);
  assert.deepEqual([...removed], ["outside"]);
});

test("getHeaderSelectionState reports partial and complete filtered selections", () => {
  assert.deepEqual(selectionModule.getHeaderSelectionState(new Set(["p1"]), ["p1", "p2"]), {
    checked: false,
    indeterminate: true,
  });
  assert.deepEqual(selectionModule.getHeaderSelectionState(new Set(["p1", "p2"]), ["p1", "p2"]), {
    checked: true,
    indeterminate: false,
  });
});
