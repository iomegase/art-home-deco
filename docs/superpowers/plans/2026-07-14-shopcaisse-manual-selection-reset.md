# Shopcaisse Manual Selection Reset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Garantir qu'aucun produit Shopcaisse n'est sélectionné par défaut et que le compteur, la confirmation et le payload correspondent exactement aux cases choisies manuellement.

**Architecture:** Les transitions de sélection restent dans le module pur `shopcaisse-import-selection.ts`, où elles sont testables sans React. Le composant initialise le mode `selected` avec une liste vide, efface les identifiants lors d'un changement de stratégie ou de famille, et propose des actions explicites pour sélectionner la page courante ou vider toute la sélection.

**Tech Stack:** React 19, Next.js 16, TypeScript, Node test runner, ESLint.

---

## Structure des fichiers

- Modifier `src/features/product/shopcaisse-import-selection.ts` : ajouter les transitions pures de changement de mode et de sélection de la page courante.
- Modifier `src/features/product/shopcaisse-import-selection.test.ts` : reproduire la sélection invisible et verrouiller le comportement attendu.
- Modifier `src/components/admin/shopcaisse-import-panel.tsx` : initialiser une sélection vide, réinitialiser les changements de périmètre et afficher les deux actions explicites.

### Task 1: Verrouiller les transitions de sélection

**Files:**
- Modify: `src/features/product/shopcaisse-import-selection.test.ts`
- Modify: `src/features/product/shopcaisse-import-selection.ts`

- [ ] **Step 1: Écrire les tests rouges**

Ajouter aux imports `selectShopcaisseImportPage` et `switchShopcaisseImportMode`, puis ajouter :

```ts
test("passer d'un mode global au mode selected supprime les identifiants invisibles", () => {
  assert.deepEqual(
    switchShopcaisseImportMode({
      currentMode: "families",
      nextMode: "selected",
      selectedIds: Array.from({ length: 11 }, (_, index) => `ancien-${index + 1}`),
    }),
    {
      selectedIds: [],
      importMode: "selected",
    },
  );
});

test("rester en mode selected conserve la sélection manuelle", () => {
  assert.deepEqual(
    switchShopcaisseImportMode({
      currentMode: "selected",
      nextMode: "selected",
      selectedIds: ["david"],
    }),
    {
      selectedIds: ["david"],
      importMode: "selected",
    },
  );
});

test("tout sélectionner ajoute uniquement les produits importables de la page sans doublon", () => {
  assert.deepEqual(
    selectShopcaisseImportPage(["page-precedente", "article-1"], ["article-1", "article-2"]),
    {
      selectedIds: ["page-precedente", "article-1", "article-2"],
      importMode: "selected",
    },
  );
});
```

- [ ] **Step 2: Vérifier que les tests échouent pour la bonne raison**

Run:

```bash
node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test src/features/product/shopcaisse-import-selection.test.ts
```

Expected: FAIL parce que `selectShopcaisseImportPage` et `switchShopcaisseImportMode` ne sont pas exportées.

- [ ] **Step 3: Implémenter les transitions minimales**

Ajouter dans `src/features/product/shopcaisse-import-selection.ts` :

```ts
export function selectShopcaisseImportPage(
  selectedIds: string[],
  pageImportableIds: string[],
) {
  return {
    selectedIds: Array.from(new Set([...selectedIds, ...pageImportableIds])),
    importMode: "selected" as const,
  };
}

export function switchShopcaisseImportMode(input: {
  currentMode: ShopcaisseImportMode;
  nextMode: ShopcaisseImportMode;
  selectedIds: string[];
}) {
  return {
    selectedIds:
      input.nextMode === "selected" && input.currentMode !== "selected"
        ? []
        : input.selectedIds,
    importMode: input.nextMode,
  };
}
```

- [ ] **Step 4: Vérifier que la suite ciblée passe**

Run:

```bash
node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test src/features/product/shopcaisse-import-selection.test.ts
```

Expected: 11 tests réussis, 0 échec.

- [ ] **Step 5: Commit**

```bash
git add src/features/product/shopcaisse-import-selection.ts src/features/product/shopcaisse-import-selection.test.ts
git commit -m "test(shopcaisse): verrouiller la selection manuelle"
```

### Task 2: Corriger l'assistant Shopcaisse

**Files:**
- Modify: `src/components/admin/shopcaisse-import-panel.tsx`

- [ ] **Step 1: Importer les nouvelles transitions et désactiver l'auto-sélection initiale**

Ajouter les imports :

```ts
selectShopcaisseImportPage,
switchShopcaisseImportMode,
```

Puis remplacer l'état initial du mode :

```ts
const [importMode, setImportMode] = useState<ImportMode>("selected");
```

Le premier appel à `handlePreview(1)` conserve alors `selectedIds = []` via `resolveShopcaissePreviewSelection`.

- [ ] **Step 2: Réinitialiser la sélection lors d'un changement de famille ou de stratégie**

Remplacer `toggleFamily` et ajouter `chooseImportMode` :

```ts
function toggleFamily(familyName: string) {
  setSelectedIds([]);
  setSelectedFamilies((current) =>
    current.includes(familyName)
      ? current.filter((value) => value !== familyName)
      : [...current, familyName],
  );
}

function chooseImportMode(nextMode: ImportMode) {
  const next = switchShopcaisseImportMode({
    currentMode: importMode,
    nextMode,
    selectedIds,
  });
  setSelectedIds(next.selectedIds);
  setImportMode(next.importMode);
}
```

Remplacer dans les cartes de stratégie :

```tsx
onClick={() => chooseImportMode(mode)}
```

- [ ] **Step 3: Ajouter la sélection explicite de la page courante**

Ajouter :

```ts
function selectCurrentPage() {
  const pageImportableIds = visiblePreviewItems
    .filter((item) => !item.alreadyImported && item.priceCents !== null)
    .map((item) => item.shopcaisseProductId);
  const next = selectShopcaisseImportPage(selectedIds, pageImportableIds);
  setSelectedIds(next.selectedIds);
  setImportMode(next.importMode);
}
```

À côté du compteur, afficher les deux boutons :

```tsx
<button
  type="button"
  onClick={selectCurrentPage}
  disabled={!visiblePreviewItems.some((item) => !item.alreadyImported && item.priceCents !== null)}
  className="border border-[#ececef] bg-white px-3 py-2 text-xs font-semibold disabled:opacity-50"
>
  Tout sélectionner
</button>
<button
  type="button"
  onClick={clearSelected}
  disabled={selectedIds.length === 0}
  className="border border-[#ececef] bg-white px-3 py-2 text-xs font-semibold disabled:opacity-50"
>
  Tout désélectionner
</button>
```

- [ ] **Step 4: Vérifier statiquement l'intégration**

Run:

```bash
npx eslint src/features/product/shopcaisse-import-selection.ts src/features/product/shopcaisse-import-selection.test.ts src/components/admin/shopcaisse-import-panel.tsx
npm run typecheck
```

Expected: les deux commandes terminent avec le code 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/shopcaisse-import-panel.tsx
git commit -m "fix(shopcaisse): vider la selection par defaut"
```

### Task 3: Vérifier le parcours complet

**Files:**
- Verify: `src/features/product/shopcaisse-import-selection.test.ts`
- Verify: `src/components/admin/shopcaisse-import-panel.tsx`

- [ ] **Step 1: Rejouer les tests ciblés**

Run:

```bash
node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test src/features/product/shopcaisse-import-selection.test.ts
```

Expected: 11 tests réussis, 0 échec.

- [ ] **Step 2: Construire l'application**

Run:

```bash
npm run build
```

Expected: build Next.js réussi et toutes les routes générées.

- [ ] **Step 3: Vérifier la propreté du diff**

Run:

```bash
git diff --check
git status --short
```

Expected: aucune erreur d'espacement ; seuls les fichiers prévus sont modifiés ou committés.

- [ ] **Step 4: Effectuer la revue finale**

Relire le diff depuis le commit de base `778bd84` et confirmer : sélection vide au chargement, remise à zéro des identifiants invisibles, sélection de la page courante uniquement, compteur et payload identiques.
