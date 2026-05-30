import test from "node:test";
import assert from "node:assert/strict";

const { normalizeFamilyRecords, shouldSyncFamily, buildUniqueCategorySlug } = (await import(
  new URL("./families.ts", import.meta.url).href
)) as typeof import("./families");

test("shouldSyncFamily excludes technical Shopcaisse families", () => {
  assert.equal(shouldSyncFamily("Mobilier"), true);
  assert.equal(shouldSyncFamily("System family"), false);
  assert.equal(shouldSyncFamily("Pas de famille"), false);
  assert.equal(shouldSyncFamily("  pas de famille  "), false);
  assert.equal(shouldSyncFamily(""), false);
  assert.equal(shouldSyncFamily(null), false);
});

test("normalizeFamilyRecords keeps id/name/position and drops invalid + excluded", () => {
  const result = normalizeFamilyRecords([
    { id: "a", name: "Mobilier", position: 3 },
    { id: "b", name: "System family", position: 0 },
    { id: "", name: "Sans id", position: 1 },
    { id: "c", name: "Luminaire" },
  ]);

  assert.deepEqual(result, [
    { externalFamilyId: "a", name: "Mobilier", position: 3 },
    { externalFamilyId: "c", name: "Luminaire", position: 0 },
  ]);
});

test("buildUniqueCategorySlug suffixes on collision", () => {
  const used = new Set<string>(["bijoux"]);
  assert.equal(buildUniqueCategorySlug("Mobilier", used), "mobilier");
  assert.equal(buildUniqueCategorySlug("Bijoux", used), "bijoux-2");
  used.add("bijoux-2");
  assert.equal(buildUniqueCategorySlug("Bijoux", used), "bijoux-3");
});

test("buildUniqueCategorySlug falls back to 'categorie' for empty slugs", () => {
  assert.equal(buildUniqueCategorySlug("???", new Set<string>()), "categorie");
  assert.equal(buildUniqueCategorySlug("---", new Set<string>(["categorie"])), "categorie-2");
});
