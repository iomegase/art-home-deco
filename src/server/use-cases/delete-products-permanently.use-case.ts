export type ProductDeleteTarget = {
  id: string;
  storageKeys: string[];
};

export type DeleteDependencies = {
  findTargets: (ids: string[]) => Promise<ProductDeleteTarget[]>;
  deleteStorageObjects: (keys: string[]) => Promise<void>;
  deleteProducts: (ids: string[]) => Promise<number>;
};

export async function deleteProductsPermanentlyUseCase(
  ids: string[],
  deps: DeleteDependencies,
) {
  const targets = await deps.findTargets(ids);

  if (targets.length === 0) {
    throw new Error("Aucun produit sélectionné n'existe encore.");
  }

  const storageKeys = [...new Set(targets.flatMap((target) => target.storageKeys))];

  if (storageKeys.length > 0) {
    await deps.deleteStorageObjects(storageKeys);
  }

  const deletedCount = await deps.deleteProducts(targets.map((target) => target.id));

  return { deletedCount };
}
