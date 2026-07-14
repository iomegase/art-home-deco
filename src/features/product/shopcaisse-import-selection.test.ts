import test from "node:test";
import assert from "node:assert/strict";

const {
  buildShopcaisseImportPayload,
  canContinueToShopcaisseImportConfirmation,
  clearShopcaisseImportSelection,
  resolveShopcaissePreviewSelection,
  toggleShopcaisseImportSelection,
} = (await import(
  new URL("./shopcaisse-import-selection.ts", import.meta.url).href
)) as typeof import("./shopcaisse-import-selection");

test("une case cochée bascule le mode familles vers selected", () => {
  assert.deepEqual(toggleShopcaisseImportSelection([], "david"), {
    selectedIds: ["david"],
    importMode: "selected",
  });
});

test("décocher la dernière ligne conserve le mode selected avec une liste vide", () => {
  assert.deepEqual(toggleShopcaisseImportSelection(["david"], "david"), {
    selectedIds: [],
    importMode: "selected",
  });
});

test("tout décocher vide la sélection et force le mode selected", () => {
  assert.deepEqual(clearShopcaisseImportSelection(), {
    selectedIds: [],
    importMode: "selected",
  });
});

test("une nouvelle prévisualisation ne recoche rien après tout décocher", () => {
  assert.deepEqual(
    resolveShopcaissePreviewSelection({
      importMode: "selected",
      selectedIds: [],
      previewImportableIds: ["article-1", "article-2"],
    }),
    [],
  );
});

test("une prévisualisation conserve l'auto-sélection dans un mode global", () => {
  assert.deepEqual(
    resolveShopcaissePreviewSelection({
      importMode: "families",
      selectedIds: [],
      previewImportableIds: ["article-1", "article-2"],
    }),
    ["article-1", "article-2"],
  );
});

test("la confirmation selected exige au moins un identifiant", () => {
  assert.equal(canContinueToShopcaisseImportConfirmation(true, "selected", 0), false);
  assert.equal(canContinueToShopcaisseImportConfirmation(true, "selected", 1), true);
  assert.equal(canContinueToShopcaisseImportConfirmation(true, "families", 0), true);
  assert.equal(canContinueToShopcaisseImportConfirmation(false, "selected", 1), false);
});

test("le payload selected transmet uniquement les identifiants cochés", () => {
  assert.deepEqual(
    buildShopcaisseImportPayload({
      importMode: "selected",
      selectedIds: ["david"],
      selectedFamilies: ["Senteurs"],
      publishByDefault: false,
    }),
    {
      mode: "selected",
      shopcaisseProductIds: ["david"],
      publishByDefault: false,
    },
  );
});

test("les modes globaux conservent leur périmètre sans identifiants cochés", () => {
  const common = {
    selectedIds: ["david"],
    selectedFamilies: ["Senteurs"],
    publishByDefault: false,
  };

  assert.deepEqual(buildShopcaisseImportPayload({ ...common, importMode: "families" }), {
    mode: "families",
    familyNames: ["Senteurs"],
    publishByDefault: false,
  });
  assert.deepEqual(buildShopcaisseImportPayload({ ...common, importMode: "all" }), {
    mode: "all",
    publishByDefault: false,
  });
  assert.deepEqual(buildShopcaisseImportPayload({ ...common, importMode: "in_stock_only" }), {
    mode: "in_stock_only",
    publishByDefault: false,
  });
});
