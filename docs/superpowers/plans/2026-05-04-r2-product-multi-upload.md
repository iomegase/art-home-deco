# R2 Product Multi-Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un vrai multi-upload d’images produit via Cloudflare R2, avec persistance Prisma, suppression, réordonnancement et exploitation dans l’admin produit.

**Architecture:** Les binaires image sont stockés dans Cloudflare R2, tandis que Prisma reste la source de vérité des métadonnées via `ProductImage`. L’admin envoie les fichiers au serveur, qui écrit dans R2 puis persiste les métadonnées en base. Les pages produit continuent de rendre les images depuis `ProductImage.url`.

**Tech Stack:** Next.js 16 App Router, Prisma 6, Cloudflare R2 (S3-compatible), TypeScript, Neon Postgres

---

### Task 1: Étendre le modèle Prisma ProductImage pour R2

**Files:**
- Modify: `prisma/schema.prisma`
- Test: `npx prisma validate`, `npm run db:generate`, `npm run db:push`

- [ ] **Step 1: Add R2 metadata fields to ProductImage**

Ajouter à `ProductImage` :

```prisma
storageProvider String   @default("r2")
storageKey      String?
mimeType        String?
width           Int?
height          Int?
sizeBytes       Int?
createdAt       DateTime @default(now())
updatedAt       DateTime @updatedAt
```

- [ ] **Step 2: Validate Prisma schema**

Run: `npx prisma validate`
Expected: schema valid

- [ ] **Step 3: Generate Prisma client**

Run: `npm run db:generate`
Expected: Prisma client generated successfully

- [ ] **Step 4: Push schema to Neon**

Run: `npm run db:push`
Expected: `ProductImage` columns created successfully

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: extend product images for r2 storage"
```

### Task 2: Ajouter la config et le client R2

**Files:**
- Modify: `src/server/env/schema.ts`
- Create: `src/server/services/storage/r2.client.ts`
- Create: `src/server/services/storage/r2.keys.ts`
- Test: typecheck

- [ ] **Step 1: Add required env vars**

Ajouter au schéma d’environnement :
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_BASE_URL`
- `R2_REGION` optionnel

- [ ] **Step 2: Create key builder helper**

Créer `src/server/services/storage/r2.keys.ts` avec :

```ts
export function buildProductImageStorageKey(input: {
  productId: string;
  fileName: string;
}) {
  const safeName = input.fileName.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
  return `products/${input.productId}/${Date.now()}-${safeName}`;
}
```

- [ ] **Step 3: Create R2 client**

Créer `src/server/services/storage/r2.client.ts` avec un client S3-compatible utilisant AWS SDK v3.

Le client doit cibler :

```ts
endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
```

- [ ] **Step 4: Commit**

```bash
git add src/server/env/schema.ts src/server/services/storage
git commit -m "feat: add cloudflare r2 storage client"
```

### Task 3: Ajouter le service d’upload produit vers R2

**Files:**
- Create: `src/server/services/product-image/upload-product-images.ts`
- Create: `src/server/services/product-image/delete-product-image.ts`
- Create: `src/server/services/product-image/reorder-product-images.ts`
- Test: later through admin route/action

- [ ] **Step 1: Implement upload validation contract**

Le service doit refuser :
- type non autorisé
- fichier > `5 MB`
- plus de `6` images pour un produit

Types autorisés :
- `image/jpeg`
- `image/png`
- `image/webp`

- [ ] **Step 2: Implement upload service**

Créer `upload-product-images.ts`.

Responsabilités :
- lire les fichiers `File`
- générer `storageKey`
- `PutObject` dans R2
- créer les lignes `ProductImage`
- construire `url = ${R2_PUBLIC_BASE_URL}/${storageKey}`

- [ ] **Step 3: Implement delete service**

Créer `delete-product-image.ts`.

Responsabilités :
- supprimer l’objet R2 par `storageKey`
- supprimer la ligne DB
- réindexer les `position`

- [ ] **Step 4: Implement reorder service**

Créer `reorder-product-images.ts`.

Responsabilités :
- recevoir une liste ordonnée d’ids d’image
- réécrire les `position`

- [ ] **Step 5: Commit**

```bash
git add src/server/services/product-image
git commit -m "feat: add r2 product image services"
```

### Task 4: Exposer des actions admin pour upload/suppression/réordre

**Files:**
- Create: `src/features/product/image-actions.ts`
- Modify: any existing product admin actions if needed
- Test: typecheck

- [ ] **Step 1: Create server actions wrapper**

Créer `src/features/product/image-actions.ts` avec actions protégées admin :
- `uploadProductImagesAction`
- `deleteProductImageAction`
- `reorderProductImagesAction`

Chaque action doit commencer par :

```ts
await requireAdmin();
```

- [ ] **Step 2: Revalidate product admin and public routes**

Après mutation, revalider au minimum :
- `/admin/products`
- `/admin/products/[id]/edit`
- `/boutique/[slug]`

- [ ] **Step 3: Commit**

```bash
git add src/features/product/image-actions.ts
git commit -m "feat: add admin product image actions"
```

### Task 5: Ajouter l’UI multi-upload sur l’édition produit

**Files:**
- Modify: `src/app/admin/(protected)/products/[id]/edit/page.tsx`
- Optionally modify: `src/app/admin/(protected)/products/new/page.tsx`
- Create: `src/components/admin/product-image-manager.tsx`
- Test: manual local admin flow

- [ ] **Step 1: Create image manager component**

Créer `src/components/admin/product-image-manager.tsx`.

Fonctions UI minimales :
- input `type=file` multiple
- liste des images existantes
- aperçu miniature
- champ alt
- bouton suppression
- boutons simple `Monter` / `Descendre` pour l’ordre
- badge ou mention `Image principale` sur `position = 0`

- [ ] **Step 2: Wire upload action in edit page**

Dans `/admin/products/[id]/edit`, brancher le composant au produit réel.

- [ ] **Step 3: Keep create page sane**

Si `/admin/products/new` n’a pas encore un produit persistant au moment du form, afficher un message explicite :
- uploader les images après création du produit
ou
- ne proposer le multi-upload complet que sur la page edit

Recommandation : limiter la première version complète à la page edit.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/product-image-manager.tsx src/app/admin/(protected)/products/[id]/edit/page.tsx src/app/admin/(protected)/products/new/page.tsx
git commit -m "feat: add admin product multi-upload ui"
```

### Task 6: Vérifier l’affichage public produit

**Files:**
- Modify: `src/app/(public)/boutique/[slug]/page.tsx` if needed
- Modify: any product card/gallery component if needed
- Test: local public product page

- [ ] **Step 1: Ensure images are ordered by position**

Les requêtes produit doivent retourner les images triées par `position asc`.

- [ ] **Step 2: Ensure primary image is position 0**

La fiche produit doit utiliser l’image `position = 0` comme principale.

- [ ] **Step 3: Render multiple images if gallery exists**

Si la fiche produit n’affiche aujourd’hui qu’une image, l’étendre pour afficher la galerie produit de base.

- [ ] **Step 4: Commit**

```bash
git add src/app/(public)/boutique/[slug]/page.tsx
if needed commit -m "feat: render ordered product image gallery"
```

### Task 7: Revalidation complète

**Files:**
- No code changes expected unless regression appears
- Test: local admin/public flow

- [ ] **Step 1: Run static checks**

Run:
```bash
npm run typecheck
npm run lint
npm run build
```
Expected: all pass

- [ ] **Step 2: Verify admin upload flow**

Manual checks:
- open `/admin/products/[id]/edit`
- upload 2+ files
- check DB rows created
- check URLs saved

- [ ] **Step 3: Verify deletion and reorder**

Manual checks:
- delete one image
- reorder remaining images
- verify `position` updates in DB

- [ ] **Step 4: Verify public product rendering**

Manual checks:
- open `/boutique/[slug]`
- confirm R2-backed images render in correct order

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "test: validate r2 multi-upload product flow"
```
