export function toggleProductSelection(selected: ReadonlySet<string>, id: string) {
  const nextSelected = new Set(selected);

  if (nextSelected.has(id)) {
    nextSelected.delete(id);
  } else {
    nextSelected.add(id);
  }

  return nextSelected;
}

export function getHeaderSelectionState(selected: ReadonlySet<string>, ids: readonly string[]) {
  const selectedCount = ids.filter((id) => selected.has(id)).length;
  const checked = ids.length > 0 && selectedCount === ids.length;

  return {
    checked,
    indeterminate: selectedCount > 0 && !checked,
  };
}

export function toggleFilteredSelection(selected: ReadonlySet<string>, ids: readonly string[]) {
  const nextSelected = new Set(selected);
  const allSelected = ids.length > 0 && ids.every((id) => selected.has(id));

  for (const id of ids) {
    if (allSelected) {
      nextSelected.delete(id);
    } else {
      nextSelected.add(id);
    }
  }

  return nextSelected;
}
