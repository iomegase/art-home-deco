# Admin Products Client Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Paginer côté client le tableau admin des produits par groupes de 30 tout en limitant la sélection globale à la page courante.

**Architecture:** Une fonction pure calcule la page bornée, les indices de tranche et les numéros compacts. `ProductsTable` recherche d'abord dans toute la liste, découpe ensuite la page visible, et transmet uniquement les ids visibles aux helpers de sélection existants.

**Tech Stack:** React 19, Next.js 16 App Router, TypeScript, `node:test`, Tailwind CSS.

---

### Task 1: Logique pure de pagination

**Files:**
- Create: `src/features/product/admin-product-pagination.test.ts`
- Create: `src/features/product/admin-product-pagination.ts`

- [ ] **Step 1: Écrire les tests rouges**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import {
  ADMIN_PRODUCTS_PAGE_SIZE,
  getAdminProductsPaginationItems,
  getAdminProductsPaginationState,
} from "./admin-product-pagination.ts";

test("271 products are split into ten pages of thirty", () => {
  assert.deepEqual(getAdminProductsPaginationState(271, 1), {
    currentPage: 1,
    totalPages: 10,
    startIndex: 0,
    endIndex: 30,
  });
  assert.equal(ADMIN_PRODUCTS_PAGE_SIZE, 30);
});

test("the last page contains the final product", () => {
  assert.deepEqual(getAdminProductsPaginationState(271, 10), {
    currentPage: 10,
    totalPages: 10,
    startIndex: 270,
    endIndex: 271,
  });
});

test("requested pages are clamped and an empty result keeps one logical page", () => {
  assert.equal(getAdminProductsPaginationState(271, 99).currentPage, 10);
  assert.deepEqual(getAdminProductsPaginationState(0, 4), {
    currentPage: 1,
    totalPages: 1,
    startIndex: 0,
    endIndex: 0,
  });
});

test("pagination items keep current neighbours and boundary pages", () => {
  assert.deepEqual(getAdminProductsPaginationItems(17, 9), [
    1,
    "ellipsis-start",
    8,
    9,
    10,
    "ellipsis-end",
    17,
  ]);
  assert.deepEqual(getAdminProductsPaginationItems(3, 1), [1, 2, 3]);
});
```

- [ ] **Step 2: Exécuter le test et vérifier RED**

Run:

```bash
node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test src/features/product/admin-product-pagination.test.ts
```

Expected: FAIL avec `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implémenter la logique minimale**

```ts
export const ADMIN_PRODUCTS_PAGE_SIZE = 30;

export type AdminProductsPaginationItem =
  | number
  | "ellipsis-start"
  | "ellipsis-end";

export function getAdminProductsPaginationState(
  totalItems: number,
  requestedPage: number,
  pageSize = ADMIN_PRODUCTS_PAGE_SIZE,
) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  return { currentPage, totalPages, startIndex, endIndex };
}

export function getAdminProductsPaginationItems(
  totalPages: number,
  currentPage: number,
): AdminProductsPaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [...new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1])]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);

  const items: AdminProductsPaginationItem[] = [];
  pages.forEach((page, index) => {
    const previous = pages[index - 1];
    if (previous && page - previous > 1) {
      items.push(previous === 1 ? "ellipsis-start" : "ellipsis-end");
    }
    items.push(page);
  });
  return items;
}
```

- [ ] **Step 4: Rejouer le test et constater 4 PASS**

- [ ] **Step 5: Exécuter également les tests de sélection existants**

Run:

```bash
node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test src/features/product/admin-product-pagination.test.ts src/features/product/admin-product-selection.test.ts
```

Expected: 7 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/product/admin-product-pagination.ts src/features/product/admin-product-pagination.test.ts
git commit -m "feat(products): ajouter la logique de pagination admin"
```

### Task 2: Pagination du tableau et sélection limitée à la page

**Files:**
- Modify: `src/app/admin/(protected)/products/products-table.tsx`

- [ ] **Step 1: Ajouter les imports et l'état**

Importer `ChevronLeft`, `ChevronRight` depuis `lucide-react`, puis :

```ts
import {
  ADMIN_PRODUCTS_PAGE_SIZE,
  getAdminProductsPaginationItems,
  getAdminProductsPaginationState,
} from "@/features/product/admin-product-pagination";
```

Dans `ProductsTable` :

```ts
const [currentPage, setCurrentPage] = useState(1);
```

- [ ] **Step 2: Paginer après la recherche**

Après le calcul de `filtered` :

```ts
const pagination = getAdminProductsPaginationState(filtered.length, currentPage);
const visibleProducts = useMemo(
  () => filtered.slice(pagination.startIndex, pagination.endIndex),
  [filtered, pagination.startIndex, pagination.endIndex],
);
const visibleIds = useMemo(
  () => visibleProducts.map(({ id }) => id),
  [visibleProducts],
);
const paginationItems = getAdminProductsPaginationItems(
  pagination.totalPages,
  pagination.currentPage,
);
const headerState = getHeaderSelectionState(selectedIds, visibleIds);
```

Supprimer l'ancien `filteredIds` et utiliser `visibleIds` pour la checkbox
d'en-tête et `toggleFilteredSelection`.

- [ ] **Step 3: Ramener la recherche à la première page**

Remplacer le handler de l'input par :

```tsx
onChange={(event) => {
  setQuery(event.target.value);
  setCurrentPage(1);
}}
```

- [ ] **Step 4: Afficher uniquement la page et conserver l'index global**

Remplacer :

```tsx
{filtered.map((product, index) => {
```

par :

```tsx
{visibleProducts.map((product, index) => {
```

Le numéro de ligne devient :

```tsx
{String(pagination.startIndex + index + 1).padStart(2, "0")}
```

L'état vide reste basé sur `filtered.length === 0`.

- [ ] **Step 5: Ajouter la barre de pagination sous le tableau**

```tsx
{filtered.length > 0 && (
  <nav
    aria-label="Pagination des produits"
    className="flex flex-col gap-3 border-t border-[#f0f0f0] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
      {pagination.startIndex + 1}–{pagination.endIndex} sur {filtered.length} produit
      {filtered.length !== 1 ? "s" : ""}
    </p>
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={pagination.currentPage === 1}
        onClick={() => setCurrentPage(pagination.currentPage - 1)}
        aria-label="Page précédente"
        className="flex h-8 items-center gap-1 px-2 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronLeft size={12} /> Précédent
      </button>
      {paginationItems.map((item) =>
        typeof item === "number" ? (
          <button
            key={item}
            type="button"
            onClick={() => setCurrentPage(item)}
            aria-label={`Page ${item}`}
            aria-current={item === pagination.currentPage ? "page" : undefined}
            className="flex h-8 min-w-8 items-center justify-center text-[10px] font-bold"
            style={
              item === pagination.currentPage
                ? { backgroundColor: "#111", color: "#fff" }
                : { color: "#64748b" }
            }
          >
            {item}
          </button>
        ) : (
          <span
            key={item}
            aria-hidden="true"
            className="flex h-8 min-w-6 items-center justify-center text-slate-300"
          >
            …
          </span>
        ),
      )}
      <button
        type="button"
        disabled={pagination.currentPage === pagination.totalPages}
        onClick={() => setCurrentPage(pagination.currentPage + 1)}
        aria-label="Page suivante"
        className="flex h-8 items-center gap-1 px-2 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500 disabled:cursor-not-allowed disabled:opacity-30"
      >
        Suivant <ChevronRight size={12} />
      </button>
    </div>
  </nav>
)}
```

Placer ce `nav` dans le conteneur blanc immédiatement après `</table>`, en
conservant le débordement horizontal sur un sous-conteneur autour du tableau si
nécessaire afin que la pagination reste visible sans scroll horizontal.

- [ ] **Step 6: Vérifier statiquement et fonctionnellement**

Run:

```bash
node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test src/features/product/admin-product-pagination.test.ts src/features/product/admin-product-selection.test.ts
npx eslint 'src/app/admin/(protected)/products/products-table.tsx' src/features/product/admin-product-pagination.ts src/features/product/admin-product-pagination.test.ts
npm run typecheck
git diff --check
```

Expected: tests PASS et toutes les commandes terminent avec exit code 0.

- [ ] **Step 7: Commit**

```bash
git add 'src/app/admin/(protected)/products/products-table.tsx'
git commit -m "feat(products): paginer le tableau admin par trente"
```

### Task 3: Vérification finale non destructive

- [ ] **Step 1: Lancer les nouveaux tests et ceux de suppression**

```bash
node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test src/features/product/admin-product-pagination.test.ts src/features/product/admin-product-selection.test.ts src/schemas/forms/product-bulk-delete.schema.test.ts
npx tsx --test src/server/use-cases/delete-products-permanently.use-case.test.ts
```

Expected: 11 tests PASS.

- [ ] **Step 2: Lancer lint, typecheck et build**

```bash
npm run lint
npm run typecheck
npm run build
```

Expected: exit code 0, en chargeant la configuration locale existante pour le
build sans afficher ses valeurs.

- [ ] **Step 3: Vérifier le rendu local sans supprimer**

Sur `/admin/products` :

- exactement 31 checkboxes sur une page pleine ;
- plage « 1–30 sur 271 produits » ;
- page 2 commence au numéro 31 ;
- la recherche revient à la page 1 ;
- la checkbox d'en-tête ne modifie que la page courante ;
- une sélection de la page 1 reste comptée sur la page 2 ;
- Précédent/Suivant et `aria-current` sont corrects ;
- aucune erreur Next.js ou console.

- [ ] **Step 4: Revue du diff**

```bash
git status --short
git diff --check
git log --oneline -5
```

Expected: seulement le helper, son test et `products-table.tsx` changent après
les documents de conception/plan.
