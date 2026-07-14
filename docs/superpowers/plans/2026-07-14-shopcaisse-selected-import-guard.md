# Shopcaisse Selected Import Guard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faire d'une case produit cochée l'autorité du périmètre d'import Shopcaisse et empêcher une confirmation ambiguë.

**Architecture:** Une fonction pure gère la sélection, la validation du passage à la confirmation et la construction du payload API. Le composant React réutilise cette logique sans modifier les modes globaux ni le backend existant.

**Tech Stack:** React 19, Next.js 16, TypeScript, Node test runner.

---

## Structure des fichiers

- Créer `src/features/product/shopcaisse-import-selection.ts` : types et règles pures de sélection/import.
- Créer `src/features/product/shopcaisse-import-selection.test.ts` : tests de bascule de mode, garde et payload.
- Modifier `src/components/admin/shopcaisse-import-panel.tsx` : utiliser ces règles dans les cases, la confirmation et la requête.

### Task 1: Règles pures de sélection

**Files:**
- Create: `src/features/product/shopcaisse-import-selection.test.ts`
- Create: `src/features/product/shopcaisse-import-selection.ts`

- [ ] **Step 1: Écrire les tests rouges**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import {
  buildShopcaisseImportPayload,
  canContinueToShopcaisseImportConfirmation,
  toggleShopcaisseImportSelection,
} from "./shopcaisse-import-selection";

test("une case cochée bascule le mode familles vers selected", () => {
  assert.deepEqual(toggleShopcaisseImportSelection([], "david", "families"), {
    selectedIds: ["david"],
    importMode: "selected",
  });
});

test("décocher la dernière ligne conserve le mode selected avec une liste vide", () => {
  assert.deepEqual(toggleShopcaisseImportSelection(["david"], "david", "selected"), {
    selectedIds: [],
    importMode: "selected",
  });
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
```

- [ ] **Step 2: Vérifier RED**

Run:
```bash
node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test src/features/product/shopcaisse-import-selection.test.ts
```
Expected: échec `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implémenter les règles minimales**

```ts
export type ShopcaisseImportMode = "families" | "selected" | "all" | "in_stock_only";

export function toggleShopcaisseImportSelection(
  selectedIds: string[],
  shopcaisseProductId: string,
  _currentMode: ShopcaisseImportMode,
) {
  const nextIds = selectedIds.includes(shopcaisseProductId)
    ? selectedIds.filter((id) => id !== shopcaisseProductId)
    : [...selectedIds, shopcaisseProductId];

  return { selectedIds: nextIds, importMode: "selected" as const };
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
```

- [ ] **Step 4: Vérifier GREEN**

Run:
```bash
node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test src/features/product/shopcaisse-import-selection.test.ts
```
Expected: 4 tests réussis, 0 échec.

### Task 2: Intégration dans l'assistant Shopcaisse

**Files:**
- Modify: `src/components/admin/shopcaisse-import-panel.tsx`

- [ ] **Step 1: Importer les règles et partager le type**

```ts
import {
  buildShopcaisseImportPayload,
  canContinueToShopcaisseImportConfirmation,
  toggleShopcaisseImportSelection,
  type ShopcaisseImportMode as ImportMode,
} from "@/features/product/shopcaisse-import-selection";
```

Supprimer le type local `ImportMode`.

- [ ] **Step 2: Rendre la sélection manuelle prioritaire**

```ts
function toggleSelected(shopcaisseProductId: string) {
  setSelectedIds((current) => {
    const next = toggleShopcaisseImportSelection(current, shopcaisseProductId, importMode);
    setImportMode(next.importMode);
    return next.selectedIds;
  });
}
```

- [ ] **Step 3: Construire le payload testé**

```ts
body: JSON.stringify(
  buildShopcaisseImportPayload({
    importMode,
    selectedIds,
    selectedFamilies,
    publishByDefault,
  }),
),
```

- [ ] **Step 4: Bloquer une confirmation selected vide**

```tsx
disabled={
  !canContinueToShopcaisseImportConfirmation(
    preview?.success ?? false,
    importMode,
    selectedIds.length,
  )
}
```

- [ ] **Step 5: Clarifier le résumé**

```tsx
<span>{importMode === "selected" ? "Produits selectionnes" : "Produits vises"}</span>
<strong>{estimatedImportCount}</strong>
```

- [ ] **Step 6: Vérifier le correctif complet**

Run:
```bash
node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test src/features/product/shopcaisse-import-selection.test.ts
npx eslint src/features/product/shopcaisse-import-selection.ts src/features/product/shopcaisse-import-selection.test.ts src/components/admin/shopcaisse-import-panel.tsx
npm run typecheck
npm run build
```
Expected: chaque commande termine avec le code 0.

- [ ] **Step 7: Commit**

```bash
git add src/features/product/shopcaisse-import-selection.ts src/features/product/shopcaisse-import-selection.test.ts src/components/admin/shopcaisse-import-panel.tsx
git commit -m "fix(shopcaisse): respecter la selection lors de l'import"
```

### Task 3: Revue, fusion et publication

**Files:**
- Verify only.

- [ ] **Step 1: Faire relire le diff par l'agent de revue existant**

Demander une vérification ciblée sur la bascule de mode, le payload et la garde
de confirmation. Corriger tout problème critique ou important.

- [ ] **Step 2: Fusionner dans `main`**

```bash
git merge --no-ff fix/shopcaisse-selected-import-guard -m "merge: securiser la selection import Shopcaisse"
```

- [ ] **Step 3: Vérifier sur le résultat fusionné**

Rejouer le test ciblé, ESLint ciblé, le typecheck et le build depuis `main`.

- [ ] **Step 4: Pousser**

```bash
git push origin main
```

Expected: `origin/main` pointe sur le commit de merge.
