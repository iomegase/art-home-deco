# Neon Postgres Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrer `art-home-deco` de SQLite vers Neon Postgres avec Prisma sans casser les flux MVP déjà validés localement.

**Architecture:** Le schéma Prisma bascule vers `postgresql`, l’environnement exige une vraie `DATABASE_URL`, puis un export SQLite JSON est importé dans Neon dans un ordre relationnel strict. La validation finale se fait entièrement en local sur Neon, sans dépendre de Vercel.

**Tech Stack:** Next.js 16, Prisma 6, Neon Postgres, Node.js, TypeScript, zsh

---

### Task 1: Bascule Prisma et env vers Postgres

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/server/env/schema.ts`
- Test: validation via `npx prisma validate`, `npm run typecheck`

- [ ] **Step 1: Write the expected schema change**

Le datasource Prisma doit devenir :

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Et la variable d’environnement ne doit plus avoir de défaut SQLite dans `src/server/env/schema.ts` :

```ts
DATABASE_URL: z.string().min(1),
```

- [ ] **Step 2: Apply the schema and env changes**

Modifier `prisma/schema.prisma` et `src/server/env/schema.ts` pour retirer toute dépendance à `file:./dev.db`.

- [ ] **Step 3: Validate Prisma schema locally**

Run: `npx prisma validate`
Expected: `The schema at prisma/schema.prisma is valid`

- [ ] **Step 4: Run typecheck to catch env/type regressions**

Run: `npm run typecheck`
Expected: success, no TypeScript errors

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma src/server/env/schema.ts
git commit -m "refactor: switch prisma datasource to postgres"
```

### Task 2: Ajouter les scripts de migration de données

**Files:**
- Create: `scripts/migrate/export-sqlite-data.mjs`
- Create: `scripts/migrate/import-postgres-data.mjs`
- Create: `scripts/migrate/README.md`
- Modify: `package.json`
- Test: scripts run independently

- [ ] **Step 1: Write the export contract**

Le script d’export doit produire un JSON de cette forme :

```json
{
  "categories": [],
  "products": [],
  "productImages": [],
  "productCategories": [],
  "blogPosts": [],
  "orders": [],
  "orderItems": [],
  "integrationEvents": []
}
```

- [ ] **Step 2: Implement SQLite export script**

Créer `scripts/migrate/export-sqlite-data.mjs` avec une lecture Prisma SQLite et une écriture JSON dans `scripts/migrate/sqlite-export.json`.

Le cœur attendu :

```js
const snapshot = {
  categories: await sqlite.category.findMany(),
  products: await sqlite.product.findMany(),
  productImages: await sqlite.productImage.findMany(),
  productCategories: await sqlite.productCategory.findMany(),
  blogPosts: await sqlite.blogPost.findMany(),
  orders: await sqlite.order.findMany(),
  orderItems: await sqlite.orderItem.findMany(),
  integrationEvents: await sqlite.integrationEvent.findMany(),
};
```

- [ ] **Step 3: Implement Postgres import script**

Créer `scripts/migrate/import-postgres-data.mjs` avec import ordonné et `createMany` par table.

Ordre attendu :

```js
await postgres.category.createMany({ data: snapshot.categories });
await postgres.product.createMany({ data: snapshot.products });
await postgres.productImage.createMany({ data: snapshot.productImages });
await postgres.productCategory.createMany({ data: snapshot.productCategories });
await postgres.blogPost.createMany({ data: snapshot.blogPosts });
await postgres.order.createMany({ data: snapshot.orders });
await postgres.orderItem.createMany({ data: snapshot.orderItems });
await postgres.integrationEvent.createMany({ data: snapshot.integrationEvents });
```

- [ ] **Step 4: Wire the scripts in package.json**

Ajouter les scripts suivants :

```json
"db:export:sqlite": "node scripts/migrate/export-sqlite-data.mjs",
"db:import:postgres": "node scripts/migrate/import-postgres-data.mjs"
```

- [ ] **Step 5: Document the migration commands**

Créer `scripts/migrate/README.md` avec la séquence exacte : export -> db push -> import -> verify.

- [ ] **Step 6: Run the export script to verify output exists**

Run: `npm run db:export:sqlite`
Expected: `scripts/migrate/sqlite-export.json` created with table arrays

- [ ] **Step 7: Commit**

```bash
git add package.json scripts/migrate
git commit -m "feat: add sqlite to postgres migration scripts"
```

### Task 3: Initialiser Neon et importer les données

**Files:**
- Modify: `.env` locally
- Test: `npx prisma db push`, `npm run db:import:postgres`

- [ ] **Step 1: Set local DATABASE_URL to Neon**

Mettre dans `.env` une URL Postgres Neon réelle :

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
```

- [ ] **Step 2: Generate Prisma client against Postgres**

Run: `npm run db:generate`
Expected: Prisma client generated successfully

- [ ] **Step 3: Push schema to Neon**

Run: `npm run db:push`
Expected: Postgres schema created with all tables

- [ ] **Step 4: Import exported data into Neon**

Run: `npm run db:import:postgres`
Expected: import completes without relation errors

- [ ] **Step 5: Verify row counts on target**

Run a Node check that prints counts for:
- `Category`
- `Product`
- `ProductImage`
- `ProductCategory`
- `BlogPost`
- `Order`
- `OrderItem`
- `IntegrationEvent`

Expected: non-zero counts matching the export snapshot for populated tables

- [ ] **Step 6: Commit**

```bash
git add package-lock.json package.json
git commit -m "chore: migrate local database to neon"
```

### Task 4: Revalider le MVP local sur Neon

**Files:**
- No code changes expected unless regressions are found
- Test: app routes and existing local flows

- [ ] **Step 1: Run static validation**

Run:
```bash
npm run typecheck
npm run lint
npm run build
```
Expected: all pass

- [ ] **Step 2: Run the app locally on Neon**

Run: `npm run dev`
Expected: local server starts without Prisma connection errors

- [ ] **Step 3: Verify admin and content routes**

Check manually:
- `/`
- `/boutique`
- `/blog`
- `/admin`
- `/admin/blog`

Expected: pages load with Neon-backed data

- [ ] **Step 4: Verify Stripe and EasyShop flows still work**

Check manually:
- checkout flow still creates/updates orders
- EasyShop webhook still updates stock

Expected: no SQLite-specific regression

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "test: validate local mvp on neon"
```

### Task 5: Nettoyage final et documentation opérationnelle

**Files:**
- Modify: `Plan-Execution-MVP.md` if needed
- Modify: project docs that still mention SQLite
- Create/Modify: migration notes if needed

- [ ] **Step 1: Search remaining SQLite references**

Run: `rg -n "sqlite|file:\./dev.db|dev.db" . --glob '!node_modules' --glob '!.next'`
Expected: only intentional references in migration docs, or none

- [ ] **Step 2: Remove stale SQLite guidance**

Update any docs/scripts that still instruct `file:./dev.db` as the primary runtime database.

- [ ] **Step 3: Re-run build after doc/config cleanup**

Run: `npm run build`
Expected: pass unchanged

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "docs: finalize postgres migration guidance"
```
