export type ShopcaisseImportMode = "families" | "selected" | "all" | "in_stock_only";

export function toggleShopcaisseImportSelection(
  selectedIds: string[],
  shopcaisseProductId: string,
) {
  const nextIds = selectedIds.includes(shopcaisseProductId)
    ? selectedIds.filter((id) => id !== shopcaisseProductId)
    : [...selectedIds, shopcaisseProductId];

  return {
    selectedIds: nextIds,
    importMode: "selected" as const,
  };
}

export function canContinueToShopcaisseImportConfirmation(
  previewSuccess: boolean,
  importMode: ShopcaisseImportMode,
  selectedCount: number,
) {
  return previewSuccess && (importMode !== "selected" || selectedCount > 0);
}

export function buildShopcaisseImportPayload(input: {
  importMode: ShopcaisseImportMode;
  selectedIds: string[];
  selectedFamilies: string[];
  publishByDefault: boolean;
}) {
  return {
    mode: input.importMode,
    ...(input.importMode === "selected"
      ? { shopcaisseProductIds: input.selectedIds }
      : {}),
    ...(input.importMode === "families"
      ? { familyNames: input.selectedFamilies }
      : {}),
    publishByDefault: input.publishByDefault,
  };
}
