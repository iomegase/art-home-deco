# Archived Products Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supprimer les 12 produits archivés restants et empêcher la page des images manquantes d'afficher ou de conserver en cache des produits archivés.

**Architecture:** Extraire la construction du filtre Prisma et la liste des routes à revalider dans deux petits modules purs testables. Le repository utilise le filtre, la Server Action parcourt les routes, puis le nettoyage de production réutilise le use case existant afin de supprimer d'abord les éventuelles images R2 et ensuite les lignes Prisma.

**Tech Stack:** Next.js 16 App Router, TypeScript, Prisma 6, Node test runner, AWS SDK S3/R2.

---

## Structure des fichiers

- Créer `src/server/repositories/shopcaisse-product-missing-images.query.ts` : construit le `ProductWhereInput` en excluant toujours les archives.
- Créer `src/server/repositories/shopcaisse-product-missing-images.query.test.ts` : vérifie le filtre de statut et les filtres combinés.
- Modifier `src/server/repositories/shopcaisse-product-import.repository.ts` : délègue la construction du `where` au module testé.
- Créer `src/features/product/product-revalidation.ts` : expose les routes revalidées après suppression définitive.
- Créer `src/features/product/product-revalidation.test.ts` : protège la présence de la route des images manquantes.
- Modifier `src/features/product/actions.ts` : revalide toutes les routes listées.

### Task 1: Exclure les archives des images manquantes

**Files:**
- Create: `src/server/repositories/shopcaisse-product-missing-images.query.test.ts`
- Create: `src/server/repositories/shopcaisse-product-missing-images.query.ts`
- Modify: `src/server/repositories/shopcaisse-product-import.repository.ts:658`

- [ ] **Step 1: Écrire le test rouge du filtre**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { buildProductsMissingImagesWhere } from "./shopcaisse-product-missing-images.query";

test("exclut toujours les produits archivés", () => {
  assert.deepEqual(buildProductsMissingImagesWhere({}), {
    AND: [{ images: { none: {} } }, { status: { not: "archived" } }],
  });
});

test("un filtre de statut reste combiné à l'exclusion des archives", () => {
  assert.deepEqual(buildProductsMissingImagesWhere({ status: "active" }), {
    AND: [
      { images: { none: {} } },
      { status: { not: "archived" } },
      { status: "active" },
    ],
  });
});
```

- [ ] **Step 2: Vérifier que le test échoue pour la bonne raison**

Run:
```bash
node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test src/server/repositories/shopcaisse-product-missing-images.query.test.ts
```
Expected: `ERR_MODULE_NOT_FOUND` pour le module de requête absent.

- [ ] **Step 3: Implémenter le constructeur minimal**

```ts
import type { Prisma } from "@prisma/client";
import { slugify } from "@/lib/slugify";

export type ProductsMissingImagesFilters = {
  family?: string | null;
  status?: string | null;
  q?: string | null;
  withStockOnly?: boolean;
  shopcaisseOnly?: boolean;
};

export function buildProductsMissingImagesWhere(
  filters: ProductsMissingImagesFilters,
): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [
    { images: { none: {} } },
    { status: { not: "archived" } },
  ];

  if (filters.family) {
    and.push({
      categories: { some: { category: { slug: slugify(filters.family) } } },
    });
  }
  if (filters.status) and.push({ status: filters.status });
  if (filters.withStockOnly) and.push({ stock: { gt: 0 } });
  if (filters.shopcaisseOnly) and.push({ externalProvider: "shopcaisse" });
  if (filters.q) {
    and.push({
      OR: [
        { title: { contains: filters.q, mode: "insensitive" } },
        { sku: { contains: filters.q, mode: "insensitive" } },
        { barcode: { contains: filters.q, mode: "insensitive" } },
      ],
    });
  }

  return { AND: and };
}
```

- [ ] **Step 4: Brancher le repository sur le constructeur**

```ts
return db.product.findMany({
  where: buildProductsMissingImagesWhere(filters),
  include: { /* conserver les inclusions existantes */ },
  orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
});
```

- [ ] **Step 5: Rejouer le test ciblé**

Run:
```bash
node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test src/server/repositories/shopcaisse-product-missing-images.query.test.ts
```
Expected: 2 tests réussis, 0 échec.

### Task 2: Invalider la page après suppression

**Files:**
- Create: `src/features/product/product-revalidation.test.ts`
- Create: `src/features/product/product-revalidation.ts`
- Modify: `src/features/product/actions.ts:123-137`

- [ ] **Step 1: Écrire le test rouge de revalidation**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { PRODUCT_DELETE_REVALIDATION_PATHS } from "./product-revalidation";

test("revalide la liste des images manquantes après une suppression", () => {
  assert.ok(PRODUCT_DELETE_REVALIDATION_PATHS.includes("/admin/products/missing-images"));
});
```

- [ ] **Step 2: Vérifier RED**

Run:
```bash
node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test src/features/product/product-revalidation.test.ts
```
Expected: `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implémenter et utiliser la liste minimale**

```ts
export const PRODUCT_DELETE_REVALIDATION_PATHS = [
  "/admin/products",
  "/admin/products/missing-images",
  "/boutique",
] as const;
```

Dans `deleteProductsPermanentlyForAdminAction`, remplacer les revalidations de
pages par :

```ts
for (const path of PRODUCT_DELETE_REVALIDATION_PATHS) {
  revalidatePath(path);
}
revalidatePath("/", "layout");
```

- [ ] **Step 4: Rejouer les deux tests ciblés**

Run:
```bash
node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test src/server/repositories/shopcaisse-product-missing-images.query.test.ts src/features/product/product-revalidation.test.ts
```
Expected: 3 tests réussis, 0 échec.

### Task 3: Vérification et nettoyage de production

**Files:**
- Verify only: code et base de production.

- [ ] **Step 1: Exécuter toutes les vérifications du dépôt**

```bash
node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test $(find src -name '*.test.ts' -print)
npm run lint
npm run typecheck
npm run build
```

Expected: toutes les commandes terminent avec le code 0.

- [ ] **Step 2: Recontrôler le périmètre destructif**

Lire en base `Product.count()`, le groupement par statut et les clés R2 des
images. Continuer uniquement si les 12 produits restants sont toujours tous
`archived` et qu'aucun produit actif n'est inclus.

- [ ] **Step 3: Supprimer via le flux applicatif existant**

Appeler `findProductDeleteTargets`, `deleteProductImageObjects` puis
`deleteProductsPermanently` à travers
`deleteProductsPermanentlyUseCase`, avec les 12 identifiants archivés relus à
l'étape précédente. Ne supprimer aucune ligne `ShopcaisseProductCache`.

- [ ] **Step 4: Vérifier l'état final de production**

Lire à nouveau les compteurs et exiger :

```json
{"products":0,"missingImages":0,"shopcaisseCacheRows":2270}
```

Le nombre du cache est contrôlé pour vérifier qu'il n'a pas été affecté ; s'il
a évolué indépendamment entre les lectures, seule l'absence de suppression du
cache et les deux compteurs produit à zéro sont bloquants.

- [ ] **Step 5: Contrôler le diff, commit et push**

```bash
git diff --check
git status --short
git add docs/superpowers/plans/2026-07-13-archived-products-cleanup.md src/server/repositories/shopcaisse-product-missing-images.query.ts src/server/repositories/shopcaisse-product-missing-images.query.test.ts src/server/repositories/shopcaisse-product-import.repository.ts src/features/product/product-revalidation.ts src/features/product/product-revalidation.test.ts src/features/product/actions.ts
git commit -m "fix(products): nettoyer les archives des images manquantes"
git push origin main
```

Expected: commit sur `main`, puis push accepté par `origin`.
