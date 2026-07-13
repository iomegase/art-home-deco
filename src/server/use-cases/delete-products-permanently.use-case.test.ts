import test from "node:test";
import assert from "node:assert/strict";
import { deleteProductsPermanentlyUseCase } from "./delete-products-permanently.use-case";

test("supprime le stockage avant les produits réellement trouvés", async () => {
  const calls: string[] = [];

  const result = await deleteProductsPermanentlyUseCase(["p1", "p2"], {
    findTargets: async () => [
      { id: "p1", storageKeys: ["products/p1/a.jpg"] },
      { id: "p2", storageKeys: [] },
    ],
    deleteStorageObjects: async (keys) => {
      calls.push(`storage:${keys.join(",")}`);
    },
    deleteProducts: async (ids) => {
      calls.push(`database:${ids.join(",")}`);
      return ids.length;
    },
  });

  assert.deepEqual(calls, ["storage:products/p1/a.jpg", "database:p1,p2"]);
  assert.deepEqual(result, { deletedCount: 2 });
});

test("ne supprime pas les produits si le nettoyage du stockage échoue", async () => {
  let deleteProductsCalled = false;

  await assert.rejects(
    deleteProductsPermanentlyUseCase(["p1"], {
      findTargets: async () => [{ id: "p1", storageKeys: ["products/p1/a.jpg"] }],
      deleteStorageObjects: async () => {
        throw new Error("R2 indisponible");
      },
      deleteProducts: async () => {
        deleteProductsCalled = true;
        return 1;
      },
    }),
    /R2 indisponible/,
  );

  assert.equal(deleteProductsCalled, false);
});

test("rejette une sélection dont aucun produit n'existe encore", async () => {
  await assert.rejects(
    deleteProductsPermanentlyUseCase(["p1"], {
      findTargets: async () => [],
      deleteStorageObjects: async () => {},
      deleteProducts: async () => 0,
    }),
    /Aucun produit sélectionné n'existe encore/,
  );
});
