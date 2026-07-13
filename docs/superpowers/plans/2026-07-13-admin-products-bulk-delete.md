# Admin Products Bulk Delete Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter à `/admin/products` une sélection type Gmail et une suppression définitive, sécurisée et groupée des produits sélectionnés.

**Architecture:** Le composant client conserve les identifiants sélectionnés et délègue la mutation à une Server Action protégée par `requireAdmin`. Une logique pure calcule l'état des cases ; un use case orchestre la suppression R2 puis Prisma via des dépendances injectables.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Zod 4, Prisma 6, AWS SDK S3/R2, `node:test`, Tailwind CSS.

---

## Structure des fichiers

- Créer `src/features/product/admin-product-selection.ts` : logique pure de sélection filtrée.
- Créer `src/features/product/admin-product-selection.test.ts` : tests de sélection.
- Créer `src/schemas/forms/product-bulk-delete.schema.ts` et son test : validation des ids.
- Créer `src/server/use-cases/delete-products-permanently.use-case.ts` et son test : orchestration.
- Créer `src/server/services/product-image/delete-product-images.ts` : suppression R2 par lots.
- Modifier `src/server/repositories/admin-product.repository.ts` : cibles et `deleteMany`.
- Modifier `src/features/product/actions.ts` : Server Action authentifiée.
- Créer `src/app/admin/(protected)/products/bulk-delete-products-dialog.tsx` : modale.
- Modifier `src/app/admin/(protected)/products/products-table.tsx` : checkboxes et barre d'action.

### Task 1: Validation et logique de sélection

**Files:**
- Create: `src/schemas/forms/product-bulk-delete.schema.ts`
- Create: `src/schemas/forms/product-bulk-delete.schema.test.ts`
- Create: `src/features/product/admin-product-selection.ts`
- Create: `src/features/product/admin-product-selection.test.ts`

- [ ] **Step 1: Écrire le test rouge du schéma**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { parseProductBulkDeleteIds } from "./product-bulk-delete.schema.ts";

test("rejects an empty product selection", () => {
  assert.throws(() => parseProductBulkDeleteIds([]));
});
test("trims and deduplicates product ids", () => {
  assert.deepEqual(parseProductBulkDeleteIds([" p1 ", "p2", "p1"]), ["p1", "p2"]);
});
test("rejects more than 1000 distinct ids", () => {
  assert.throws(() =>
    parseProductBulkDeleteIds(Array.from({ length: 1001 }, (_, index) => `p${index}`)),
  );
});
```

- [ ] **Step 2: Vérifier RED**

Run:
```bash
node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test src/schemas/forms/product-bulk-delete.schema.test.ts
```
Expected: FAIL avec `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implémenter le schéma minimal**

```ts
import { z } from "zod";

const schema = z
  .array(z.string().trim().min(1))
  .transform((ids) => [...new Set(ids)])
  .pipe(z.array(z.string()).min(1).max(1000));

export function parseProductBulkDeleteIds(ids: string[]) {
  return schema.parse(ids);
}
```

- [ ] **Step 4: Rejouer le test et constater 3 PASS**

- [ ] **Step 5: Écrire le test rouge de sélection**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import {
  getHeaderSelectionState,
  toggleFilteredSelection,
  toggleProductSelection,
} from "./admin-product-selection.ts";

test("toggles one product", () => {
  const selected = toggleProductSelection(new Set<string>(), "p1");
  assert.deepEqual([...selected], ["p1"]);
  assert.deepEqual([...toggleProductSelection(selected, "p1")], []);
});
test("filtered toggle preserves selections outside the filter", () => {
  const selected = toggleFilteredSelection(new Set(["outside"]), ["p1", "p2"]);
  assert.deepEqual([...selected], ["outside", "p1", "p2"]);
  assert.deepEqual([...toggleFilteredSelection(selected, ["p1", "p2"])], ["outside"]);
});
test("reports checked and indeterminate header states", () => {
  assert.deepEqual(getHeaderSelectionState(new Set(["p1"]), ["p1", "p2"]), {
    checked: false,
    indeterminate: true,
  });
  assert.deepEqual(getHeaderSelectionState(new Set(["p1", "p2"]), ["p1", "p2"]), {
    checked: true,
    indeterminate: false,
  });
});
```

- [ ] **Step 6: Exécuter le test et constater `ERR_MODULE_NOT_FOUND`**

- [ ] **Step 7: Implémenter la logique minimale**

```ts
export function toggleProductSelection(selected: ReadonlySet<string>, id: string) {
  const next = new Set(selected);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}
export function getHeaderSelectionState(selected: ReadonlySet<string>, ids: string[]) {
  const count = ids.filter((id) => selected.has(id)).length;
  return {
    checked: ids.length > 0 && count === ids.length,
    indeterminate: count > 0 && count < ids.length,
  };
}
export function toggleFilteredSelection(selected: ReadonlySet<string>, ids: string[]) {
  const next = new Set(selected);
  const { checked } = getHeaderSelectionState(selected, ids);
  for (const id of ids) checked ? next.delete(id) : next.add(id);
  return next;
}
```

- [ ] **Step 8: Rejouer les deux fichiers et constater 6 PASS**

- [ ] **Step 9: Commit**

```bash
git add src/schemas/forms/product-bulk-delete.schema.ts src/schemas/forms/product-bulk-delete.schema.test.ts src/features/product/admin-product-selection.ts src/features/product/admin-product-selection.test.ts
git commit -m "feat(products): ajouter la selection groupee validee"
```

### Task 2: Use case, repository et stockage R2

**Files:**
- Create: `src/server/use-cases/delete-products-permanently.use-case.ts`
- Create: `src/server/use-cases/delete-products-permanently.use-case.test.ts`
- Create: `src/server/services/product-image/delete-product-images.ts`
- Modify: `src/server/repositories/admin-product.repository.ts`

- [ ] **Step 1: Écrire le test rouge du use case**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { deleteProductsPermanentlyUseCase } from "./delete-products-permanently.use-case.ts";

test("deletes storage before database products", async () => {
  const calls: string[] = [];
  const result = await deleteProductsPermanentlyUseCase(["p1", "p2"], {
    findTargets: async () => [
      { id: "p1", storageKeys: ["products/p1/a.jpg"] },
      { id: "p2", storageKeys: [] },
    ],
    deleteStorageObjects: async (keys) => calls.push(`storage:${keys.join(",")}`),
    deleteProducts: async (ids) => {
      calls.push(`database:${ids.join(",")}`);
      return 2;
    },
  });
  assert.deepEqual(calls, ["storage:products/p1/a.jpg", "database:p1,p2"]);
  assert.deepEqual(result, { deletedCount: 2 });
});
test("does not touch the database when storage deletion fails", async () => {
  let databaseCalled = false;
  await assert.rejects(() =>
    deleteProductsPermanentlyUseCase(["p1"], {
      findTargets: async () => [{ id: "p1", storageKeys: ["a.jpg"] }],
      deleteStorageObjects: async () => { throw new Error("R2 unavailable"); },
      deleteProducts: async () => { databaseCalled = true; return 1; },
    }),
  );
  assert.equal(databaseCalled, false);
});
test("rejects when no selected product exists", async () => {
  await assert.rejects(
    () => deleteProductsPermanentlyUseCase(["missing"], {
      findTargets: async () => [],
      deleteStorageObjects: async () => undefined,
      deleteProducts: async () => 0,
    }),
    /Aucun produit sélectionné n'existe encore/,
  );
});
```

- [ ] **Step 2: Exécuter le test et vérifier RED**

- [ ] **Step 3: Implémenter le use case minimal**

```ts
export type ProductDeleteTarget = { id: string; storageKeys: string[] };
export type DeleteDependencies = {
  findTargets(ids: string[]): Promise<ProductDeleteTarget[]>;
  deleteStorageObjects(keys: string[]): Promise<void>;
  deleteProducts(ids: string[]): Promise<number>;
};
export async function deleteProductsPermanentlyUseCase(
  ids: string[],
  dependencies: DeleteDependencies,
) {
  const targets = await dependencies.findTargets(ids);
  if (targets.length === 0) throw new Error("Aucun produit sélectionné n'existe encore.");
  const targetIds = targets.map(({ id }) => id);
  const keys = [...new Set(targets.flatMap(({ storageKeys }) => storageKeys))];
  if (keys.length) await dependencies.deleteStorageObjects(keys);
  return { deletedCount: await dependencies.deleteProducts(targetIds) };
}
```

- [ ] **Step 4: Rejouer et constater 3 PASS**

- [ ] **Step 5: Ajouter au repository**

```ts
export async function findProductDeleteTargets(ids: string[]) {
  const products = await db.product.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      images: { where: { storageKey: { not: null } }, select: { storageKey: true } },
    },
  });
  return products.map((product) => ({
    id: product.id,
    storageKeys: product.images.flatMap(({ storageKey }) => storageKey ? [storageKey] : []),
  }));
}
export async function deleteProductsPermanently(ids: string[]) {
  return (await db.product.deleteMany({ where: { id: { in: ids } } })).count;
}
```

- [ ] **Step 6: Créer la suppression R2 par lots**

```ts
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getRequiredR2Config, getR2Client } from "@/server/services/storage/r2.client";

export async function deleteProductImageObjects(keys: string[]) {
  if (!keys.length) return;
  const r2 = getR2Client();
  const { bucketName } = getRequiredR2Config();
  if (!r2) throw new Error("Cloudflare R2 is not configured.");
  for (let index = 0; index < keys.length; index += 1000) {
    const batch = keys.slice(index, index + 1000);
    const result = await r2.send(new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
    }));
    if (result.Errors?.length) {
      throw new Error(`La suppression de ${result.Errors.length} image(s) a échoué.`);
    }
  }
}
```

- [ ] **Step 7: Exécuter test ciblé et `npm run typecheck`; attendre PASS**

- [ ] **Step 8: Commit**

```bash
git add src/server/use-cases/delete-products-permanently.use-case.ts src/server/use-cases/delete-products-permanently.use-case.test.ts src/server/services/product-image/delete-product-images.ts src/server/repositories/admin-product.repository.ts
git commit -m "feat(products): supprimer definitivement une selection"
```

### Task 3: Server Action protégée

**Files:**
- Modify: `src/features/product/actions.ts`

- [ ] **Step 1: Importer le schéma, le use case, le service R2 et les deux fonctions repository**

```ts
import { parseProductBulkDeleteIds } from "@/schemas/forms/product-bulk-delete.schema";
import {
  deleteProductsPermanently,
  findProductDeleteTargets,
} from "@/server/repositories/admin-product.repository";
import { deleteProductImageObjects } from "@/server/services/product-image/delete-product-images";
import { deleteProductsPermanentlyUseCase } from "@/server/use-cases/delete-products-permanently.use-case";
```

- [ ] **Step 2: Ajouter l'action avec l'authentification hors du bloc d'erreur**

```ts
export async function deleteProductsPermanentlyForAdminAction(formData: FormData) {
  await requireAdmin();
  try {
    const ids = parseProductBulkDeleteIds(formData.getAll("ids").map(String));
    const result = await deleteProductsPermanentlyUseCase(ids, {
      findTargets: findProductDeleteTargets,
      deleteStorageObjects: deleteProductImageObjects,
      deleteProducts: deleteProductsPermanently,
    });
    revalidatePath("/admin/products");
    revalidatePath("/boutique");
    revalidatePath("/", "layout");
    return { ok: true as const, deletedCount: result.deletedCount };
  } catch (error) {
    console.error("Bulk product deletion failed", error);
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "La suppression a échoué.",
    };
  }
}
```

- [ ] **Step 3: Exécuter `npm run typecheck` et ESLint sur les fichiers serveur**

- [ ] **Step 4: Commit**

```bash
git add src/features/product/actions.ts
git commit -m "feat(products): exposer la suppression groupee admin"
```

### Task 4: Modale et tableau type Gmail

**Files:**
- Create: `src/app/admin/(protected)/products/bulk-delete-products-dialog.tsx`
- Modify: `src/app/admin/(protected)/products/products-table.tsx`

- [ ] **Step 1: Créer une modale contrôlée avec cette interface**

```tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { deleteProductsPermanentlyForAdminAction } from "@/features/product/actions";

type Props = {
  productIds: string[];
  includesShopcaisseProducts: boolean;
  open: boolean;
  onOpenChange(open: boolean): void;
  onDeleted(): void;
};

export function BulkDeleteProductsDialog(props: Props) {
  const { productIds, includesShopcaisseProducts, open, onOpenChange, onDeleted } = props;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function close() {
    if (!isPending) {
      setError(null);
      onOpenChange(false);
    }
  }

  function confirm() {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      for (const id of productIds) formData.append("ids", id);
      const result = await deleteProductsPermanentlyForAdminAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onDeleted();
      onOpenChange(false);
      router.refresh();
    });
  }

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(event) => event.target === event.currentTarget && close()}
    >
      <div role="alertdialog" aria-modal="true" className="w-full max-w-[430px] rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <AlertTriangle size={16} strokeWidth={2.5} />
            </span>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">Confirmation</p>
              <p className="mt-0.5 text-[15px] font-semibold text-[#111]">Supprimer les produits ?</p>
            </div>
          </div>
          <button type="button" onClick={close} disabled={isPending} aria-label="Fermer">
            <X size={14} />
          </button>
        </div>
        <div className="space-y-3 px-6 pb-5 text-[11px] leading-relaxed text-slate-500">
          <p>
            Vous allez supprimer définitivement {productIds.length} produit
            {productIds.length > 1 ? "s" : ""}. Cette action est irréversible.
            L&apos;historique des commandes sera conservé.
          </p>
          {includesShopcaisseProducts && (
            <p className="font-medium text-amber-700">
              Certains produits viennent de Shopcaisse et pourront réapparaître lors
              d&apos;une prochaine synchronisation.
            </p>
          )}
          {error && <p role="alert" className="font-medium text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button type="button" onClick={close} disabled={isPending}>Annuler</button>
          <button type="button" onClick={confirm} disabled={isPending || productIds.length === 0} className="inline-flex items-center gap-2 bg-red-500 px-5 py-2.5 text-white disabled:opacity-60">
            <Trash2 size={12} />
            {isPending ? "Suppression…" : "Supprimer définitivement"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Ajouter dans `ProductsTable` l'état suivant**

```ts
const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const filteredIds = useMemo(() => filtered.map(({ id }) => id), [filtered]);
const headerState = getHeaderSelectionState(selectedIds, filteredIds);
const selectedProducts = products.filter(({ id }) => selectedIds.has(id));
```

Ajouter aussi un effet de cohérence lorsque les props serveur changent :

```ts
useEffect(() => {
  const availableIds = new Set(products.map(({ id }) => id));
  setSelectedIds((current) => {
    const next = new Set([...current].filter((id) => availableIds.has(id)));
    return next.size === current.size ? current : next;
  });
}, [products]);
```

- [ ] **Step 3: Ajouter un composant local `SelectionCheckbox`**

Il reçoit `checked`, `indeterminate`, `onChange`, `aria-label`, applique
la propriété DOM `indeterminate` avec une ref callback, et utilise une classe
`h-4 w-4 accent-[#111]`.

```tsx
function SelectionCheckbox({
  checked,
  indeterminate = false,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange(): void;
  ariaLabel: string;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(node) => {
        if (node) node.indeterminate = indeterminate;
      }}
      onChange={onChange}
      aria-label={ariaLabel}
      className="h-4 w-4 cursor-pointer accent-[#111]"
    />
  );
}
```

- [ ] **Step 4: Ajouter la colonne de sélection**

La checkbox d'en-tête appelle
`toggleFilteredSelection(current, filteredIds)`. Celle d'une ligne appelle
`toggleProductSelection(current, product.id)`. Ajouter la cellule avant `#`,
passer le `colSpan` vide de 9 à 10, et donner aux lignes cochées
`bg-[#f8fbff]`.

- [ ] **Step 5: Ajouter la barre d'action**

Quand `selectedIds.size > 0`, afficher le compteur réel, « Tout
désélectionner » et le bouton rouge « Supprimer définitivement ». Brancher la
modale avec `productIds={[...selectedIds]}`,
`includesShopcaisseProducts={selectedProducts.some(p => Boolean(p.externalStockId))}`
et `onDeleted={() => setSelectedIds(new Set())}`.

- [ ] **Step 6: Exécuter ESLint ciblé et `npm run typecheck`; attendre exit 0**

- [ ] **Step 7: Commit**

```bash
git add 'src/app/admin/(protected)/products/products-table.tsx' 'src/app/admin/(protected)/products/bulk-delete-products-dialog.tsx'
git commit -m "feat(products): ajouter la suppression multiple type gmail"
```

### Task 5: Vérification complète non destructive

- [ ] **Step 1: Lancer tous les tests TypeScript**

```bash
node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test $(rg --files src -g '*.test.ts')
```

Expected: tous les tests PASS.

- [ ] **Step 2: Lancer `npm run lint`, `npm run typecheck` et `npm run build`**

Expected: les trois commandes terminent avec exit code 0.

- [ ] **Step 3: Vérifier dans le navigateur local**

Démarrer `npm run dev`, ouvrir `/admin/products` et vérifier sans confirmer
une suppression réelle : checkboxes par ligne, sélection globale, filtre limité
aux résultats affichés, sélection hors filtre conservée, état indéterminé,
compteur, modale, avertissement Shopcaisse, annulation et absence d'erreur
console.

- [ ] **Step 4: Inspecter le diff final**

```bash
git status --short
git diff --check
git log --oneline -5
```

Expected: les changements préexistants du worktree sont toujours intacts et
n'ont pas été inclus dans les commits de la fonctionnalité.
