# Shopcaisse Categories Fetch & Catalog Curation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fetch all Shopcaisse families as site categories, and let an admin curate per category which cached articles are published on the storefront (cache → draft → active, archive to unpublish).

**Architecture:** The `ShopcaisseProductCache` table (1998 rows) stays the source of truth for "everything Shopcaisse"; the `Product` table stays the curated subset that is shown on the site. We fetch the `/families` endpoint, persist all families as `Category` rows keyed by a stable `externalFamilyId`, store `familyId` on each cache row, and reuse the existing `importShopcaisseProductsToCatalog` flow (already creates draft Products and links cache rows) for publishing. New status actions handle activate/archive. A new admin page lists cache rows by category with bulk actions.

**Tech Stack:** Next.js App Router, TypeScript, Prisma 6 (Postgres, `prisma db push`), Zod 4, Node built-in test runner (`node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test`).

**Reference spec:** `docs/superpowers/specs/2026-05-30-shopcaisse-categories-curation-design.md`

**Conventions used in this repo (do not deviate):**
- Tests: files named `*.test.ts`, using `import test from "node:test"` + `import assert from "node:assert/strict"`. Run a single file with: `node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test <path>`.
- DB schema changes are applied with `npm run db:push` (no migration files in this project), then `npm run db:generate`.
- Type check the whole project with `npm run typecheck`.
- Admin API routes call `await requireAdmin();` first and `revalidatePath(...)` after mutations.
- One-shot scripts live in `scripts/` as `.mjs` and import `@prisma/client` directly.

---

## File Structure

**Created:**
- `src/server/services/shopcaisse/families.ts` — pure helpers: normalize family records, exclusion filter, unique category slug.
- `src/server/services/shopcaisse/families.test.ts` — unit tests for the pure helpers.
- `src/server/repositories/product-publication.repository.ts` — `setProductsStatus` / `archiveProducts`.
- `src/server/repositories/product-publication.test.ts` — unit test for the pure status guard.
- `src/schemas/api/product-publication.schema.ts` — Zod schema for `{ productIds }`.
- `src/app/api/admin/shopcaisse/products/activate/route.ts` — POST activate selection.
- `src/app/api/admin/shopcaisse/products/archive/route.ts` — POST archive selection.
- `src/app/api/admin/shopcaisse/products/publish-family/route.ts` — POST publish a whole category.
- `src/app/admin/(protected)/shopcaisse/catalogue/page.tsx` — server page (filters + data).
- `src/app/admin/(protected)/shopcaisse/catalogue/catalogue-curation.tsx` — client component (checkboxes + bulk actions).
- `scripts/backfill-shopcaisse-family-ids.mjs` — one-shot backfill of `cache.familyId`.

**Modified:**
- `prisma/schema.prisma` — add `Category.externalFamilyId/position/source`, `ShopcaisseProductCache.familyId`.
- `src/server/services/shopcaisse/catalog.types.ts` — add `ShopcaisseFamilyRecord`, `families` on snapshot, `familyId` on item.
- `src/server/services/shopcaisse/client.ts` — add `listShopcaisseFamilies`, set `familyId` in mapper, fetch families in snapshot.
- `src/server/repositories/shopcaisse-catalog.repository.ts` — persist `familyId` in cache; add `syncShopcaisseCategories`, `listCacheForCuration`, `listCacheProductIdsByFamily`.
- `src/server/repositories/shopcaisse-product-import.repository.ts` — add `familyId` to `CachePreviewRow` + `listCacheRows` select; replace name-based category resolution with `ensureCategoryByFamilyId`.
- `src/app/api/shopcaisse/catalog/sync/route.ts` — call `syncShopcaisseCategories(snapshot.families)`.

---

## Task 1: Prisma schema — category external id + cache family id

**Files:**
- Modify: `prisma/schema.prisma` (model `Category` ~line 65, model `ShopcaisseProductCache` ~line 203)

- [ ] **Step 1: Add fields to `Category`**

In `model Category`, after the `description String?` line, add:

```prisma
  externalFamilyId String? @unique
  position         Int     @default(0)
  source           String  @default("local")
```

- [ ] **Step 2: Add field + index to `ShopcaisseProductCache`**

In `model ShopcaisseProductCache`, after the `familyName String?` line, add:

```prisma
  familyId             String?
```

And inside the same model, in the `@@index(...)` block at the bottom, add:

```prisma
  @@index([familyId])
```

- [ ] **Step 3: Apply schema to the database and regenerate the client**

Run: `npm run db:push && npm run db:generate`
Expected: `db push` reports the schema is in sync (new nullable columns added), then `Generated Prisma Client` with no errors.

- [ ] **Step 4: Type check**

Run: `npm run typecheck`
Expected: PASS (no errors). New optional fields don't break existing code.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(db): add Category.externalFamilyId/position/source and cache.familyId"
```

---

## Task 2: Pure families helpers (normalize, filter, unique slug)

**Files:**
- Create: `src/server/services/shopcaisse/families.ts`
- Test: `src/server/services/shopcaisse/families.test.ts`
- Depends on existing: `src/lib/slugify.ts` (named export `slugify`)

- [ ] **Step 1: Write the failing test**

Create `src/server/services/shopcaisse/families.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test src/server/services/shopcaisse/families.test.ts`
Expected: FAIL — cannot resolve `./families.ts` (module not found).

- [ ] **Step 3: Write the implementation**

Create `src/server/services/shopcaisse/families.ts`:

```ts
import { slugify } from "@/lib/slugify";
import type { ShopcaisseFamilyRecord } from "./catalog.types";

export type NormalizedFamily = {
  externalFamilyId: string;
  name: string;
  position: number;
};

const EXCLUDED_FAMILY_NAMES = new Set(["system family", "pas de famille"]);

export function shouldSyncFamily(name: string | null | undefined): boolean {
  if (!name) {
    return false;
  }
  const normalized = name.trim().toLowerCase();
  if (!normalized) {
    return false;
  }
  return !EXCLUDED_FAMILY_NAMES.has(normalized);
}

export function normalizeFamilyRecords(records: ShopcaisseFamilyRecord[]): NormalizedFamily[] {
  const result: NormalizedFamily[] = [];

  for (const record of records) {
    const id = typeof record.id === "string" ? record.id.trim() : "";
    const name = typeof record.name === "string" ? record.name.trim() : "";

    if (!id || !shouldSyncFamily(name)) {
      continue;
    }

    result.push({
      externalFamilyId: id,
      name,
      position:
        typeof record.position === "number" && Number.isFinite(record.position) ? record.position : 0,
    });
  }

  return result;
}

export function buildUniqueCategorySlug(name: string, used: Set<string>): string {
  const base = slugify(name) || "categorie";
  if (!used.has(base)) {
    return base;
  }
  let attempt = 2;
  while (used.has(`${base}-${attempt}`)) {
    attempt += 1;
  }
  return `${base}-${attempt}`;
}
```

> Note: this module uses `import type { ShopcaisseFamilyRecord }` from `./catalog.types`, a type added in Task 3. Because the test runner strips types at runtime (`--experimental-strip-types`), the `import type` is erased and Step 4's test runs green even before Task 3. The type only matters for `npm run typecheck`, which is first run in Task 3 Step 5. Execute Task 2 then Task 3.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test src/server/services/shopcaisse/families.test.ts`
Expected: PASS — `# pass 3`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add src/server/services/shopcaisse/families.ts src/server/services/shopcaisse/families.test.ts
git commit -m "feat(shopcaisse): pure helpers to normalize/filter families + unique slug"
```

---

## Task 3: Types + client `listShopcaisseFamilies` + snapshot wiring + `familyId` mapping

**Files:**
- Modify: `src/server/services/shopcaisse/catalog.types.ts`
- Modify: `src/server/services/shopcaisse/client.ts` (mapper ~line 385, `getShopcaisseCatalogSnapshot` ~line 584, add new function near `listShopcaisseStocks` ~line 573)

- [ ] **Step 1: Add types**

In `catalog.types.ts`, add the `familyId` field to `ShopcaisseCatalogItem` (after `familyName?: string | null;`):

```ts
  familyId?: string | null;
```

Add a new exported type (after `ShopcaisseStockRecord`):

```ts
export type ShopcaisseFamilyRecord = {
  id: string;
  name?: string;
  position?: number;
  active?: boolean;
  [key: string]: unknown;
};
```

Add `families` to `ShopcaisseCatalogSnapshot`:

```ts
export type ShopcaisseCatalogSnapshot = {
  products: ShopcaisseProductRecord[];
  priceLists: ShopcaissePriceListRecord[];
  prices: ShopcaissePriceRecord[];
  stocks: ShopcaisseStockRecord[];
  families: ShopcaisseFamilyRecord[];
  items: ShopcaisseCatalogItem[];
};
```

- [ ] **Step 2: Set `familyId` in the mapper**

In `client.ts`, inside `normalizeShopcaisseCatalogItems`, the `input.products.map(...)` callback already computes `const familyName = coerceString(product.family?.name);`. Add right after it:

```ts
    const familyId = coerceString(product.family?.id);
```

And in the returned object literal, add `familyId,` next to `familyName,`:

```ts
      familyName,
      familyId,
```

- [ ] **Step 3: Add `listShopcaisseFamilies` and import the type**

In `client.ts`, add `ShopcaisseFamilyRecord` to the type import block at the top (the `import type { ... } from "./catalog.types";`).

Add this function after `listShopcaisseStocks` (it mirrors the existing paginated readers):

```ts
export async function listShopcaisseFamilies(): Promise<ShopcaisseFamilyRecord[]> {
  const env = assertShopcaisseCatalogEnv();

  return fetchPaginatedShopcaisse<ShopcaisseFamilyRecord>((page) =>
    `/v1/companies/${env.SHOPCAISSE_COMPANY_ID}/families${buildQuery({
      page,
      pageSize: 200,
    })}`,
  );
}
```

- [ ] **Step 4: Fetch families in the snapshot**

In `getShopcaisseCatalogSnapshot`, change the parallel fetch and the return:

```ts
export async function getShopcaisseCatalogSnapshot(): Promise<ShopcaisseCatalogSnapshot> {
  const [products, priceLists, stocks, families] = await Promise.all([
    listShopcaisseProducts(),
    listShopcaissePriceLists(),
    listShopcaisseStocks(),
    listShopcaisseFamilies(),
  ]);
  const prices = await listShopcaissePricesFromPriceLists(priceLists);

  return {
    products,
    priceLists,
    prices,
    stocks,
    families,
    items: normalizeShopcaisseCatalogItems({ products, prices, stocks }),
  };
}
```

- [ ] **Step 5: Type check**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Verify against the live API (read-only)**

Run this throwaway check (it does not modify anything):

```bash
KEY=$(grep -E '^SHOPCAISSE_API_KEY=' .env | cut -d= -f2-)
BASE=$(grep -E '^SHOPCAISSE_API_URL=' .env | cut -d= -f2-)
CID=$(grep -E '^SHOPCAISSE_COMPANY_ID=' .env | cut -d= -f2-)
SID=$(grep -E '^SHOPCAISSE_STORE_ID=' .env | cut -d= -f2-)
/usr/bin/curl -s -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -H "X-Store-Id: $SID" \
  "$BASE/v1/companies/$CID/families?page=0&pageSize=200" \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print('families:',len(d.get('items',[])),'hasNextPage:',d.get('hasNextPage'))"
```

Expected: prints a non-zero family count and a boolean `hasNextPage`. Confirms the endpoint + shape the client relies on.

- [ ] **Step 7: Commit**

```bash
git add src/server/services/shopcaisse/catalog.types.ts src/server/services/shopcaisse/client.ts
git commit -m "feat(shopcaisse): fetch families in snapshot and map item familyId"
```

---

## Task 4: Category sync repository + wire into catalog sync route

**Files:**
- Modify: `src/server/repositories/shopcaisse-catalog.repository.ts`
- Modify: `src/app/api/shopcaisse/catalog/sync/route.ts`

- [ ] **Step 1: Add `syncShopcaisseCategories`**

In `shopcaisse-catalog.repository.ts`, add imports at the top:

```ts
import { normalizeFamilyRecords, buildUniqueCategorySlug } from "@/server/services/shopcaisse/families";
import type { ShopcaisseFamilyRecord } from "@/server/services/shopcaisse/catalog.types";
```

Add this exported function (it adopts the 5 pre-existing name-based categories by slug instead of creating duplicates):

```ts
export async function syncShopcaisseCategories(families: ShopcaisseFamilyRecord[]) {
  const normalized = normalizeFamilyRecords(families);

  const existing = await db.category.findMany({
    select: { id: true, slug: true, externalFamilyId: true },
  });
  const usedSlugs = new Set(existing.map((category) => category.slug));
  const bySlug = new Map(existing.map((category) => [category.slug, category]));
  const byExternalId = new Map(
    existing
      .filter((category) => category.externalFamilyId)
      .map((category) => [category.externalFamilyId as string, category]),
  );

  let createdCount = 0;
  let updatedCount = 0;
  let adoptedCount = 0;

  for (const family of normalized) {
    const matchedById = byExternalId.get(family.externalFamilyId);
    if (matchedById) {
      await db.category.update({
        where: { id: matchedById.id },
        data: { title: family.name, position: family.position, source: "shopcaisse" },
      });
      updatedCount += 1;
      continue;
    }

    const candidateSlug = buildUniqueCategorySlug(family.name, new Set());
    const matchedBySlug = bySlug.get(candidateSlug);
    if (matchedBySlug && !matchedBySlug.externalFamilyId) {
      await db.category.update({
        where: { id: matchedBySlug.id },
        data: {
          externalFamilyId: family.externalFamilyId,
          title: family.name,
          position: family.position,
          source: "shopcaisse",
        },
      });
      byExternalId.set(family.externalFamilyId, { ...matchedBySlug, externalFamilyId: family.externalFamilyId });
      adoptedCount += 1;
      continue;
    }

    const slug = buildUniqueCategorySlug(family.name, usedSlugs);
    usedSlugs.add(slug);
    const created = await db.category.create({
      data: {
        title: family.name,
        slug,
        position: family.position,
        source: "shopcaisse",
        externalFamilyId: family.externalFamilyId,
      },
      select: { id: true, slug: true, externalFamilyId: true },
    });
    bySlug.set(created.slug, created);
    byExternalId.set(family.externalFamilyId, created);
    createdCount += 1;
  }

  return { createdCount, updatedCount, adoptedCount, total: normalized.length };
}
```

- [ ] **Step 2: Wire it into the catalog sync route**

In `src/app/api/shopcaisse/catalog/sync/route.ts`:

Add the import:

```ts
import { syncShopcaisseCatalogCache, syncShopcaisseCategories } from "@/server/repositories/shopcaisse-catalog.repository";
```

(Replace the existing single-name import of `syncShopcaisseCatalogCache`.)

After `const result = await syncShopcaisseCatalogCache(snapshot.items);` add:

```ts
    const categoryResult = await syncShopcaisseCategories(snapshot.families);
```

Add `categoryResult` to the success log payload and to the JSON response:

```ts
      payload: {
        createdCount: result.createdCount,
        updatedCount: result.updatedCount,
        skippedCount: result.skippedCount,
        categoriesCreated: categoryResult.createdCount,
        categoriesAdopted: categoryResult.adoptedCount,
        categoriesUpdated: categoryResult.updatedCount,
        errors: result.errors.length,
      },
```

```ts
    return NextResponse.json({
      success: true,
      createdCount: result.createdCount,
      updatedCount: result.updatedCount,
      skippedCount: result.skippedCount,
      categories: categoryResult,
      errors: result.errors,
      syncedAt: result.syncedAt.toISOString(),
    });
```

- [ ] **Step 3: Type check**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Verify against the dev DB**

Trigger a catalog sync (admin authenticated) or, for a quick check, run a throwaway script that calls the function directly is not possible without env wiring — instead verify after the next real sync that categories exist:

```bash
cat > _verify-cat.mjs <<'EOF'
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const cats = await db.category.findMany({ select: { title: true, slug: true, externalFamilyId: true, position: true }, orderBy: { position: "asc" } });
console.table(cats);
console.log("with externalFamilyId:", cats.filter(c => c.externalFamilyId).length, "/", cats.length);
await db.$disconnect();
EOF
node _verify-cat.mjs; rm -f _verify-cat.mjs
```

Expected (after a sync has run): the pre-existing 5 categories now carry `externalFamilyId`, plus the previously-missing families (Mobilier, Luminaire, Objets deco, Vaisselle, Senteurs, …) appear. `"System family"` and `"Pas de famille"` are absent.

- [ ] **Step 5: Commit**

```bash
git add src/server/repositories/shopcaisse-catalog.repository.ts src/app/api/shopcaisse/catalog/sync/route.ts
git commit -m "feat(shopcaisse): sync all families into categories on catalog sync"
```

---

## Task 5: Persist `familyId` on cache + category resolution by familyId

**Files:**
- Modify: `src/server/repositories/shopcaisse-catalog.repository.ts` (`syncShopcaisseCatalogCache` ~line 109-149)
- Modify: `src/server/repositories/shopcaisse-product-import.repository.ts` (`CachePreviewRow` ~line 6, `listCacheRows` select ~line 340, `ensureCategoryIdByFamilyName` ~line 229, import call site ~line 525)

- [ ] **Step 1: Persist `familyId` when writing the cache**

In `syncShopcaisseCatalogCache`, add `familyId: item.familyId ?? null,` to **both** the `update:` and `create:` objects of the `cacheDelegate.upsert(...)` call (next to the existing `familyName:` line).

- [ ] **Step 2: Add `familyId` to the import row type and query**

In `shopcaisse-product-import.repository.ts`:

In `type CachePreviewRow`, add after `familyName: string | null;`:

```ts
  familyId: string | null;
```

In `listCacheRows`'s `select: { ... }`, add after `familyName: true,`:

```ts
      familyId: true,
```

- [ ] **Step 3: Add `ensureCategoryByFamilyId`**

In the same file, add this function next to the existing `ensureCategoryIdByFamilyName` (keep the old one as fallback):

```ts
async function ensureCategoryByFamilyId(input: { familyId: string; familyName: string | null }) {
  const existing = await db.category.findUnique({
    where: { externalFamilyId: input.familyId },
    select: { id: true },
  });
  if (existing) {
    return existing.id;
  }

  // Fallback: family not yet synced as a category — create it from the name.
  const title = (input.familyName ?? "").trim();
  if (!title) {
    return null;
  }
  const normalizedKey = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (normalizedKey === "pas de famille" || normalizedKey === "system family") {
    return null;
  }
  const slug = slugify(title);
  if (!slug) {
    return null;
  }

  const category = await db.category.upsert({
    where: { externalFamilyId: input.familyId },
    update: { title },
    create: { externalFamilyId: input.familyId, slug, title, source: "shopcaisse" },
  });
  return category.id;
}
```

- [ ] **Step 4: Use familyId at the import call site**

In `importShopcaisseProductsToCatalog`, replace:

```ts
      const categoryId = row.familyName ? await ensureCategoryIdByFamilyName(row.familyName) : null;
```

with:

```ts
      const categoryId = row.familyId
        ? await ensureCategoryByFamilyId({ familyId: row.familyId, familyName: row.familyName })
        : row.familyName
          ? await ensureCategoryIdByFamilyName(row.familyName)
          : null;
```

- [ ] **Step 5: Type check**

Run: `npm run typecheck`
Expected: PASS. (`ensureCategoryIdByFamilyName` is still referenced, so no unused-symbol error.)

- [ ] **Step 6: Commit**

```bash
git add src/server/repositories/shopcaisse-catalog.repository.ts src/server/repositories/shopcaisse-product-import.repository.ts
git commit -m "feat(shopcaisse): persist familyId on cache and resolve category by familyId"
```

---

## Task 6: Backfill `cache.familyId` from existing rawJson (one-shot)

**Files:**
- Create: `scripts/backfill-shopcaisse-family-ids.mjs`

- [ ] **Step 1: Write the idempotent backfill script**

Create `scripts/backfill-shopcaisse-family-ids.mjs`:

```js
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function extractFamilyId(rawJson) {
  const family = rawJson?.product?.family;
  const id = family?.id;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

const rows = await db.shopcaisseProductCache.findMany({
  where: { familyId: null },
  select: { id: true, rawJson: true },
});

let updated = 0;
let missing = 0;

for (const row of rows) {
  const familyId = extractFamilyId(row.rawJson);
  if (!familyId) {
    missing += 1;
    continue;
  }
  await db.shopcaisseProductCache.update({
    where: { id: row.id },
    data: { familyId },
  });
  updated += 1;
}

console.log(`cache rows scanned: ${rows.length}`);
console.log(`familyId backfilled: ${updated}`);
console.log(`no family.id in rawJson: ${missing}`);

await db.$disconnect();
```

- [ ] **Step 2: Run it**

Run: `node scripts/backfill-shopcaisse-family-ids.mjs`
Expected: prints `cache rows scanned: <~1998>` and a large `familyId backfilled` count (rows whose rawJson has `product.family.id`).

- [ ] **Step 3: Verify and confirm idempotency**

Run the script a second time: `node scripts/backfill-shopcaisse-family-ids.mjs`
Expected: `cache rows scanned: <small>` (only rows still null), `familyId backfilled: 0` if all resolvable — confirms it is safe to re-run.

Quick DB check:

```bash
cat > _verify-fam.mjs <<'EOF'
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const total = await db.shopcaisseProductCache.count();
const withId = await db.shopcaisseProductCache.count({ where: { familyId: { not: null } } });
console.log("cache total:", total, "| with familyId:", withId);
await db.$disconnect();
EOF
node _verify-fam.mjs; rm -f _verify-fam.mjs
```

Expected: `with familyId` is close to `total`.

- [ ] **Step 4: Commit**

```bash
git add scripts/backfill-shopcaisse-family-ids.mjs
git commit -m "chore(shopcaisse): one-shot backfill of cache.familyId from rawJson"
```

---

## Task 7: Product publication repository (status actions)

**Files:**
- Create: `src/server/repositories/product-publication.repository.ts`
- Test: `src/server/repositories/product-publication.test.ts`

- [ ] **Step 1: Write the failing test (pure guard)**

Create `src/server/repositories/product-publication.test.ts`:

```ts
import test from "node:test";
import assert from "node:assert/strict";

const { isPublicationStatus } = (await import(
  new URL("./product-publication.repository.ts", import.meta.url).href
)) as typeof import("./product-publication.repository");

test("isPublicationStatus accepts only known statuses", () => {
  assert.equal(isPublicationStatus("draft"), true);
  assert.equal(isPublicationStatus("active"), true);
  assert.equal(isPublicationStatus("archived"), true);
  assert.equal(isPublicationStatus("published"), false);
  assert.equal(isPublicationStatus(""), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test src/server/repositories/product-publication.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `src/server/repositories/product-publication.repository.ts`:

```ts
import { db } from "@/server/db/client";

export const PUBLICATION_STATUSES = ["draft", "active", "archived"] as const;
export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

export function isPublicationStatus(value: string): value is PublicationStatus {
  return (PUBLICATION_STATUSES as readonly string[]).includes(value);
}

export async function setProductsStatus(ids: string[], status: PublicationStatus) {
  if (ids.length === 0) {
    return { count: 0 };
  }
  return db.product.updateMany({
    where: { id: { in: ids } },
    data: { status },
  });
}

export async function archiveProducts(ids: string[]) {
  return setProductsStatus(ids, "archived");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test src/server/repositories/product-publication.test.ts`
Expected: PASS — `# pass 1`.

- [ ] **Step 5: Commit**

```bash
git add src/server/repositories/product-publication.repository.ts src/server/repositories/product-publication.test.ts
git commit -m "feat(catalog): product publication status actions (activate/archive)"
```

---

## Task 8: Zod schema + activate/archive API routes

**Files:**
- Create: `src/schemas/api/product-publication.schema.ts`
- Create: `src/app/api/admin/shopcaisse/products/activate/route.ts`
- Create: `src/app/api/admin/shopcaisse/products/archive/route.ts`

- [ ] **Step 1: Create the Zod schema**

Create `src/schemas/api/product-publication.schema.ts`:

```ts
import { z } from "zod";

export const productIdsRequestSchema = z.object({
  productIds: z.array(z.string().min(1)).min(1).max(500),
});

export type ProductIdsRequest = z.infer<typeof productIdsRequestSchema>;
```

- [ ] **Step 2: Create the activate route**

Create `src/app/api/admin/shopcaisse/products/activate/route.ts`:

```ts
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/security/auth";
import { logger } from "@/lib/logger";
import { productIdsRequestSchema } from "@/schemas/api/product-publication.schema";
import { setProductsStatus } from "@/server/repositories/product-publication.repository";

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json().catch(() => null);
    const parsed = productIdsRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await setProductsStatus(parsed.data.productIds, "active");

    revalidatePath("/admin/products");
    revalidatePath("/admin/shopcaisse/catalogue");
    revalidatePath("/boutique");
    revalidatePath("/");

    await logger.integration("info", {
      provider: "shopcaisse",
      eventType: "catalog_activate_products",
      status: "success",
      message: "Shopcaisse curated products activated.",
      payload: { requested: parsed.data.productIds.length, updated: result.count },
    });

    return NextResponse.json({ success: true, updated: result.count });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    const message = error instanceof Error ? error.message : "Impossible d'activer les produits.";
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
```

- [ ] **Step 3: Create the archive route**

Create `src/app/api/admin/shopcaisse/products/archive/route.ts` — identical to activate, with these differences: import `archiveProducts` instead of `setProductsStatus`, call `await archiveProducts(parsed.data.productIds);`, and use `eventType: "catalog_archive_products"` / message `"Shopcaisse curated products archived."`:

```ts
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/security/auth";
import { logger } from "@/lib/logger";
import { productIdsRequestSchema } from "@/schemas/api/product-publication.schema";
import { archiveProducts } from "@/server/repositories/product-publication.repository";

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json().catch(() => null);
    const parsed = productIdsRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await archiveProducts(parsed.data.productIds);

    revalidatePath("/admin/products");
    revalidatePath("/admin/shopcaisse/catalogue");
    revalidatePath("/boutique");
    revalidatePath("/");

    await logger.integration("info", {
      provider: "shopcaisse",
      eventType: "catalog_archive_products",
      status: "success",
      message: "Shopcaisse curated products archived.",
      payload: { requested: parsed.data.productIds.length, updated: result.count },
    });

    return NextResponse.json({ success: true, updated: result.count });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    const message = error instanceof Error ? error.message : "Impossible d'archiver les produits.";
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
```

- [ ] **Step 4: Type check**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/schemas/api/product-publication.schema.ts "src/app/api/admin/shopcaisse/products/activate/route.ts" "src/app/api/admin/shopcaisse/products/archive/route.ts"
git commit -m "feat(api): admin routes to activate/archive curated products"
```

---

## Task 9: Curation listing query + publish-by-family helper

**Files:**
- Modify: `src/server/repositories/shopcaisse-catalog.repository.ts`

- [ ] **Step 1: Add `listCacheForCuration`**

In `shopcaisse-catalog.repository.ts`, add:

```ts
export async function listCacheForCuration(params: {
  familyId?: string | null;
  q?: string | null;
  page?: number;
  pageSize?: number;
}) {
  const pageSize = Math.min(Math.max(params.pageSize ?? 50, 1), 100);
  const requestedPage = Math.max(params.page ?? 1, 1);

  const where: Prisma.ShopcaisseProductCacheWhereInput = {};
  if (params.familyId) {
    where.familyId = params.familyId;
  }
  if (params.q && params.q.trim()) {
    const term = params.q.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { sku: { contains: term, mode: "insensitive" } },
      { barcode: { contains: term, mode: "insensitive" } },
    ];
  }

  const total = await db.shopcaisseProductCache.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);

  const rows = await db.shopcaisseProductCache.findMany({
    where,
    orderBy: { name: "asc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      shopcaisseProductId: true,
      name: true,
      sku: true,
      barcode: true,
      imageUrl: true,
      priceCents: true,
      stockQuantity: true,
      familyId: true,
      linkedProductId: true,
      linkedProduct: { select: { id: true, status: true } },
    },
  });

  return { rows, total, page, pageSize, totalPages };
}

export async function listCacheProductIdsByFamily(familyId: string): Promise<string[]> {
  const rows = await db.shopcaisseProductCache.findMany({
    where: { familyId },
    select: { shopcaisseProductId: true },
  });
  return Array.from(new Set(rows.map((row) => row.shopcaisseProductId)));
}
```

(`Prisma` is already imported at the top of this file.)

- [ ] **Step 2: Type check**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Verify against dev DB**

```bash
cat > _verify-curation.mjs <<'EOF'
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const sample = await db.category.findFirst({ where: { externalFamilyId: { not: null } }, select: { externalFamilyId: true, title: true } });
if (!sample) { console.log("no synced category yet — run a catalog sync first"); await db.$disconnect(); process.exit(0); }
const count = await db.shopcaisseProductCache.count({ where: { familyId: sample.externalFamilyId } });
console.log(`category "${sample.title}" -> ${count} cache rows`);
await db.$disconnect();
EOF
node _verify-curation.mjs; rm -f _verify-curation.mjs
```

Expected: prints a category and a plausible cache-row count for it.

- [ ] **Step 4: Commit**

```bash
git add src/server/repositories/shopcaisse-catalog.repository.ts
git commit -m "feat(shopcaisse): curation listing query by category + ids-by-family helper"
```

---

## Task 10: Publish-whole-category API route

**Files:**
- Create: `src/app/api/admin/shopcaisse/products/publish-family/route.ts`

- [ ] **Step 1: Create the route**

Create `src/app/api/admin/shopcaisse/products/publish-family/route.ts`. It resolves the cache product ids for a category, then reuses the existing import flow in `selected` mode (draft):

```ts
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/security/auth";
import { logger } from "@/lib/logger";
import { listCacheProductIdsByFamily } from "@/server/repositories/shopcaisse-catalog.repository";
import { importShopcaisseProductsToCatalog } from "@/server/repositories/shopcaisse-product-import.repository";

const publishFamilyRequestSchema = z.object({
  familyId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json().catch(() => null);
    const parsed = publishFamilyRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const productIds = await listCacheProductIdsByFamily(parsed.data.familyId);

    if (productIds.length === 0) {
      return NextResponse.json({ success: true, createdCount: 0, skippedCount: 0, linkedCount: 0 });
    }

    const result = await importShopcaisseProductsToCatalog({
      mode: "selected",
      shopcaisseProductIds: productIds,
      publishByDefault: false,
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin/shopcaisse/catalogue");

    await logger.integration("info", {
      provider: "shopcaisse",
      eventType: "catalog_publish_family",
      status: result.errors.length > 0 ? "partial" : "success",
      message: "Shopcaisse category published to draft catalog.",
      payload: {
        familyId: parsed.data.familyId,
        requested: productIds.length,
        createdCount: result.createdCount,
        linkedCount: result.linkedCount,
        errors: result.errors.length,
      },
    });

    return NextResponse.json({
      success: result.errors.length === 0,
      createdCount: result.createdCount,
      skippedCount: result.skippedCount,
      linkedCount: result.linkedCount,
    });
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500;
    const message = error instanceof Error ? error.message : "Impossible de publier la catégorie.";
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
```

- [ ] **Step 2: Type check**

Run: `npm run typecheck`
Expected: PASS. (`importShopcaisseProductsToCatalog` accepts `{ mode: "selected", shopcaisseProductIds, publishByDefault }` per `ShopcaisseImportProductsRequest`.)

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/admin/shopcaisse/products/publish-family/route.ts"
git commit -m "feat(api): publish a whole Shopcaisse category to draft catalog"
```

---

## Task 11: Admin curation page (by category + bulk actions)

**Files:**
- Create: `src/app/admin/(protected)/shopcaisse/catalogue/page.tsx`
- Create: `src/app/admin/(protected)/shopcaisse/catalogue/catalogue-curation.tsx`

- [ ] **Step 1: Create the server page**

Create `src/app/admin/(protected)/shopcaisse/catalogue/page.tsx`:

```tsx
import { listCacheForCuration } from "@/server/repositories/shopcaisse-catalog.repository";
import { db } from "@/server/db/client";
import { CatalogueCuration } from "./catalogue-curation";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ familyId?: string; q?: string; page?: string }>;

export default async function ShopcaisseCataloguePage({ searchParams }: { searchParams: SearchParams }) {
  const { familyId, q, page } = await searchParams;

  const categories = await db.category.findMany({
    where: { externalFamilyId: { not: null } },
    select: { externalFamilyId: true, title: true },
    orderBy: [{ position: "asc" }, { title: "asc" }],
  });

  const data = await listCacheForCuration({
    familyId: familyId ?? null,
    q: q ?? null,
    page: page ? Number(page) : 1,
    pageSize: 50,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-3xl">Catalogue Shopcaisse — curation</h1>
      <p className="mt-2 text-sm text-muted">
        Choisissez, par catégorie, les articles présents sur le site. Publier crée un brouillon ; activez-le pour le mettre en ligne.
      </p>
      <CatalogueCuration
        categories={categories.map((category) => ({
          familyId: category.externalFamilyId as string,
          title: category.title,
        }))}
        rows={data.rows.map((row) => ({
          id: row.id,
          shopcaisseProductId: row.shopcaisseProductId,
          name: row.name,
          sku: row.sku,
          priceCents: row.priceCents,
          stockQuantity: row.stockQuantity,
          hasImage: Boolean(row.imageUrl),
          linkedProductId: row.linkedProductId,
          status: row.linkedProduct?.status ?? null,
        }))}
        total={data.total}
        page={data.page}
        totalPages={data.totalPages}
        activeFamilyId={familyId ?? ""}
        query={q ?? ""}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create the client component**

Create `src/app/admin/(protected)/shopcaisse/catalogue/catalogue-curation.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Row = {
  id: string;
  shopcaisseProductId: string;
  name: string;
  sku: string | null;
  priceCents: number | null;
  stockQuantity: number | null;
  hasImage: boolean;
  linkedProductId: string | null;
  status: string | null;
};

type Props = {
  categories: Array<{ familyId: string; title: string }>;
  rows: Row[];
  total: number;
  page: number;
  totalPages: number;
  activeFamilyId: string;
  query: string;
};

function stateLabel(row: Row): string {
  if (!row.linkedProductId) return "non publié";
  return row.status ?? "—";
}

function euros(priceCents: number | null): string {
  return priceCents === null ? "—" : `${(priceCents / 100).toFixed(2)} €`;
}

export function CatalogueCuration(props: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  function toggle(shopcaisseProductId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(shopcaisseProductId)) {
        next.delete(shopcaisseProductId);
      } else {
        next.add(shopcaisseProductId);
      }
      return next;
    });
  }

  function navigate(params: { familyId?: string; q?: string; page?: number }) {
    const search = new URLSearchParams();
    const familyId = params.familyId ?? props.activeFamilyId;
    const q = params.q ?? props.query;
    if (familyId) search.set("familyId", familyId);
    if (q) search.set("q", q);
    if (params.page && params.page > 1) search.set("page", String(params.page));
    router.push(`/admin/shopcaisse/catalogue?${search.toString()}`);
  }

  async function post(url: string, payload: unknown) {
    setBusy(true);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(`Erreur: ${data?.error ?? response.status}`);
        return;
      }
      setSelected(new Set());
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const selectedProductIds = Array.from(selected);
  const selectedDbIds = props.rows
    .filter((row) => selected.has(row.shopcaisseProductId) && row.linkedProductId)
    .map((row) => row.linkedProductId as string);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          Catégorie
          <select
            className="ml-2 border border-line px-2 py-1"
            value={props.activeFamilyId}
            onChange={(event) => navigate({ familyId: event.target.value, page: 1 })}
          >
            <option value="">Toutes</option>
            {props.categories.map((category) => (
              <option key={category.familyId} value={category.familyId}>
                {category.title}
              </option>
            ))}
          </select>
        </label>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const value = new FormData(event.currentTarget).get("q");
            navigate({ q: typeof value === "string" ? value : "", page: 1 });
          }}
        >
          <input name="q" defaultValue={props.query} placeholder="Rechercher…" className="border border-line px-2 py-1" />
          <button type="submit" className="ml-2 border border-line px-3 py-1">Filtrer</button>
        </form>
        <span className="text-sm text-muted">{props.total} article(s)</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || selectedProductIds.length === 0}
          className="border border-line px-3 py-1 disabled:opacity-40"
          onClick={() =>
            post("/api/admin/shopcaisse/import-products", {
              mode: "selected",
              shopcaisseProductIds: selectedProductIds,
              publishByDefault: false,
            })
          }
        >
          Publier la sélection ({selectedProductIds.length})
        </button>
        <button
          type="button"
          disabled={busy || selectedDbIds.length === 0}
          className="border border-line px-3 py-1 disabled:opacity-40"
          onClick={() => post("/api/admin/shopcaisse/products/activate", { productIds: selectedDbIds })}
        >
          Activer ({selectedDbIds.length})
        </button>
        <button
          type="button"
          disabled={busy || selectedDbIds.length === 0}
          className="border border-line px-3 py-1 disabled:opacity-40"
          onClick={() => post("/api/admin/shopcaisse/products/archive", { productIds: selectedDbIds })}
        >
          Archiver ({selectedDbIds.length})
        </button>
        <button
          type="button"
          disabled={busy || !props.activeFamilyId}
          className="border border-line px-3 py-1 disabled:opacity-40"
          onClick={() => post("/api/admin/shopcaisse/products/publish-family", { familyId: props.activeFamilyId })}
        >
          Publier toute la catégorie
        </button>
      </div>

      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            <th className="py-2"></th>
            <th>Nom</th>
            <th>SKU</th>
            <th>Prix</th>
            <th>Stock</th>
            <th>Image</th>
            <th>État</th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row) => (
            <tr key={row.id} className="border-b border-line/50">
              <td className="py-2">
                <input
                  type="checkbox"
                  checked={selected.has(row.shopcaisseProductId)}
                  onChange={() => toggle(row.shopcaisseProductId)}
                />
              </td>
              <td>{row.name}</td>
              <td>{row.sku ?? "—"}</td>
              <td>{euros(row.priceCents)}</td>
              <td>{row.stockQuantity ?? "—"}</td>
              <td>{row.hasImage ? "✓" : "—"}</td>
              <td>{stateLabel(row)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          disabled={props.page <= 1}
          className="border border-line px-3 py-1 disabled:opacity-40"
          onClick={() => navigate({ page: props.page - 1 })}
        >
          Précédent
        </button>
        <span className="text-sm">Page {props.page} / {props.totalPages}</span>
        <button
          type="button"
          disabled={props.page >= props.totalPages}
          className="border border-line px-3 py-1 disabled:opacity-40"
          onClick={() => navigate({ page: props.page + 1 })}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Type check + lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 4: Manual smoke test (dev server)**

Start the dev server (`npm run dev`) and visit `/admin/shopcaisse/catalogue` while authenticated as admin.
Expected: category dropdown lists synced families; selecting a category filters rows; selecting rows + "Publier la sélection" creates draft products (state changes to `draft` after refresh); "Activer" flips to `active`; "Archiver" flips to `archived`.

Quick non-UI verification of one publish→activate cycle:

```bash
cat > _verify-cycle.mjs <<'EOF'
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const byStatus = await db.product.groupBy({ by: ["status"], _count: true });
console.log("Product by status:", JSON.stringify(byStatus));
await db.$disconnect();
EOF
node _verify-cycle.mjs; rm -f _verify-cycle.mjs
```

Expected: counts shift as you publish (more `draft`) and activate (more `active`).

- [ ] **Step 5: Commit**

```bash
git add "src/app/admin/(protected)/shopcaisse/catalogue/page.tsx" "src/app/admin/(protected)/shopcaisse/catalogue/catalogue-curation.tsx"
git commit -m "feat(admin): Shopcaisse catalog curation page by category with bulk actions"
```

---

## Final verification

- [ ] **Whole-project type check & lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Run the full unit test suite**

Run: `node --experimental-strip-types --import ./scripts/register-test-hooks.mjs --test src/server/services/shopcaisse/families.test.ts src/server/repositories/product-publication.test.ts`
Expected: all pass.

- [ ] **End-to-end editorial check**

After a catalog sync + backfill: confirm in `/admin/shopcaisse/catalogue` that (a) all non-technical families are filterable categories, (b) publishing puts items in `draft` (not on the storefront), (c) activating shows them on `/boutique` and in the sitemap, (d) archiving removes them from the storefront while keeping the `Product` row.

---

## Notes for the implementer

- **Do not** decrement Shopcaisse stock or touch checkout in this plan — out of scope.
- The existing `importShopcaisseProductsToCatalog` already links cache rows and syncs images; reuse it, do not duplicate that logic.
- `externalFamilyId` is the durable identity of a Shopcaisse-sourced category. Never key categories on the family name for matching.
- Always filter `"System family"` and `"Pas de famille"` (handled centrally in `shouldSyncFamily`).
- The 121 existing `Product` rows and 112 linked cache rows must remain intact; the backfill only sets `familyId` and the category sync only adopts/updates categories.
```
