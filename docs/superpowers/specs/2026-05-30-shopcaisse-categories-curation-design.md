# Design — Récupération des catégories Shopcaisse & curation du catalogue

- **Date** : 2026-05-30
- **Statut** : Validé (design approuvé, prêt pour plan d'implémentation)
- **Auteur** : agent + David Devillers

## 1. Contexte et état actuel (vérifié)

Le site dispose d'une intégration Shopcaisse avec une architecture à deux tables :

| Table | Rôle | Compte réel (2026-05-30) |
|---|---|---|
| `ShopcaisseProductCache` | Staging : tout le catalogue Shopcaisse (données brutes + normalisées, `rawJson`) | **1998** lignes |
| └ liées (`linkedProductId != null`) | déjà promues vers le catalogue | 112 |
| └ non liées | jamais importées | 1886 |
| `Product` | Catalogue réel du site | **121** (3 `active`, 106 `draft`, 12 `archived`) |
| `Category` | Catégories du site | 5 |
| `ProductCategory` | liens produit↔catégorie | 118 |

Constats clés :
- Les 1998 produits sont **dans le cache, pas dans le catalogue**. Seuls 121 ont été promus en `Product`, dont 3 visibles (`active`).
- Les catégories sont créées **à la volée** lors d'un import (`ensureCategoryIdByFamilyName`), d'où seulement 5 catégories alors que Shopcaisse en expose 10+.
- Le cache ne stocke que `familyName` (texte) ; ni le cache ni `Category` ne connaissent l'`id` de famille Shopcaisse.

Vérifications API en direct (company de production) :
- `GET /v1/companies/{companyId}/items` → chaque item porte `family: { id, name, active }`.
- `GET /v1/companies/{companyId}/families` → **HTTP 200**, paginé (`items / hasNextPage / skipped`). Chaque famille : `{ id, name, company, organisation, position }`. **Pas de champ parent/parentId → familles plates.** Présence de familles techniques à filtrer : `"System family"`, `"Pas de famille"`.
- `GET .../family` et `.../categories` → 404 (le chemin correct est `/families`).

Le flux d'import existant `importShopcaisseProductsToCatalog` couvre déjà l'essentiel de la « publication » :
- modes `selected` (par `shopcaisseProductIds`), `families` (par `familyNames`), `in_stock_only` ;
- crée un `Product` avec `status: publishByDefault ? "active" : "draft"` ;
- lie la ligne de cache (`linkCacheRowsToProduct`), synchronise les images (`syncProductImages`), crée la catégorie (`ensureCategoryIdByFamilyName`).

## 2. Objectif

1. **Récupérer toutes les catégories** Shopcaisse en amont (indépendamment de ce qui est publié).
2. Permettre de **décider, par catégorie, quels articles sont présents ou non sur le site**, à l'échelle des ~1886 articles non publiés.

## 3. Décisions de conception (validées)

| Sujet | Décision |
|---|---|
| Modèle de curation | **A** — le cache reste la source ; seuls les articles curés deviennent des `Product`. Le catalogue `Product` reste léger. |
| Clé catégorie | **`familyId` Shopcaisse** (id stable), pas le nom. |
| État à la publication | **`draft`** puis **activation** manuelle (`active`). Étape de contrôle qualité. |
| Retrait du site | **`archived`** (réversible, éditorial conservé). |
| Curation à l'échelle | **Vue admin par catégorie + sélection multiple** (cases à cocher, actions groupées, pagination, recherche). |

## 4. Architecture détaillée

### 4.1 Modèle de données (Prisma) — ajouts non destructifs

`Category` :
- `externalFamilyId String? @unique` — id de la famille Shopcaisse (null pour les catégories créées manuellement).
- `position Int @default(0)` — ordre repris de Shopcaisse.
- `source String @default("local")` — `"shopcaisse"` ou `"local"`.

`ShopcaisseProductCache` :
- `familyId String?`
- `@@index([familyId])`

`Product` : **aucun changement**. Le champ `status` existant (`draft` / `active` / `archived`) porte l'état de publication. États fonctionnels dérivés :
- `non publié` : aucune ligne de cache liée (`linkedProductId == null`).
- `draft` : `Product` créé mais hors ligne (curation/contrôle).
- `active` : en ligne.
- `archived` : retiré volontairement, éditorial conservé.

### 4.2 Récupération de toutes les catégories

- **`listShopcaisseFamilies()`** dans `src/server/services/shopcaisse/client.ts` :
  - `GET /v1/companies/{companyId}/families`, paginé via `fetchPaginatedShopcaisse`.
  - Retourne `Array<{ id, name, position }>`.
- **Type** : nouveau `ShopcaisseFamilyRecord` dans `catalog.types.ts` ; ajout de `families` à `ShopcaisseCatalogSnapshot` ; ajout de `familyId?: string | null` à `ShopcaisseCatalogItem`.
- **`normalizeShopcaisseCatalogItems`** : renseigner `familyId` depuis `product.family?.id` (en plus de `familyName`).
- **`syncShopcaisseCategories(families)`** (nouveau, repository) :
  - `upsert` `Category` par `externalFamilyId` : `title = name`, `position`, `source = "shopcaisse"`, `slug = slugify(name)` (unicité gérée, voir 4.3).
  - **Filtre** : exclut les familles dont le nom normalisé vaut `"system family"` ou `"pas de famille"`.
  - Appelé dans la synchro catalogue existante (snapshot) afin que toutes les catégories arrivent d'un bloc.

### 4.3 Association article ↔ catégorie

- `ensureCategoryIdByFamilyName` (par nom) → remplacé par **`ensureCategoryByFamilyId({ familyId, familyName })`** : résout/`upsert` la `Category` par `externalFamilyId`, en utilisant `familyName` comme `title`/`slug` à la création.
- Conflit de `slug` possible si deux familles donnent le même slug : suffixer le slug (`-2`, `-3`) tout en gardant `externalFamilyId` comme clé d'identité.
- Le cache stockant `familyId`, on peut lister/filtrer les 1998 lignes par catégorie de façon fiable.

### 4.4 Publication / curation (réutilise l'existant)

- **Publier une sélection** : `importShopcaisseProductsToCatalog({ mode: "selected", shopcaisseProductIds, publishByDefault: false })` → `Product` en `draft`. *Déjà fonctionnel ; à brancher sur l'association par `familyId`.*
- **Publier toute une catégorie** : on résout côté serveur les `shopcaisseProductId` du cache rattachés au `familyId` de la catégorie, puis on réutilise le même `mode: "selected"`. Pas de nouveau mode : une seule voie de publication, alimentée soit par une sélection explicite, soit par tous les ids d'une catégorie.
- **Activer** : nouvelle fonction `setProductsStatus(ids: string[], status: "active")` + `revalidatePath` boutique/sitemap/catégories.
- **Re-publier** un archivé : `setProductsStatus(ids, "active")`.

### 4.5 Retrait du site

- **`archiveProducts(ids: string[])`** : `status = "archived"`, `revalidatePath("/boutique")`, `revalidatePath("/")`, catégories concernées. Non destructif ; le `Product`, ses images traitées et son SEO sont conservés.

### 4.6 Interface admin — curation à l'échelle

Nouvelle page **`/admin/shopcaisse/catalogue`** (protégée, comme les autres pages admin) :
- **Filtre par catégorie** (par `familyId` / `Category`), **recherche** (nom/sku/barcode), **pagination** (adapté à ~1886 lignes).
- Liste jointe `ShopcaisseProductCache` ↔ `linkedProduct.status`, une ligne par article, avec **cases à cocher**.
- Colonnes : nom, prix, stock, image (présence), **état** (`non publié` / `draft` / `active` / `archived`).
- **Actions groupées** : *Publier la sélection* (→ `draft`), *Activer*, *Archiver*, *Publier toute la catégorie*.
- Réutilise l'endpoint d'import existant (`POST /api/admin/shopcaisse/import-products`) ; **2 nouveaux endpoints** : activer et archiver une sélection (`POST /api/admin/shopcaisse/products/activate`, `.../archive`), validés par Zod, protégés par `requireAdmin`.

### 4.7 Migration / backfill (one-shot)

- Script de backfill :
  1. Peupler `ShopcaisseProductCache.familyId` depuis `rawJson.product.family.id` pour les 1998 lignes.
  2. Rattacher les 5 `Category` existantes à leur `externalFamilyId` par correspondance de nom (normalisé).
- Puis une synchro `/families` complète crée les catégories manquantes (Mobilier, Luminaire, Objets deco, Vaisselle, Senteurs, etc.).

## 5. Stratégie de test

- **Unitaire** : `syncShopcaisseCategories` (filtrage `System family`/`Pas de famille`, upsert par `externalFamilyId`, collision de slug) ; `ensureCategoryByFamilyId` ; `setProductsStatus` / `archiveProducts` (transitions d'état + revalidation).
- **Client** : `listShopcaisseFamilies` (pagination `hasNextPage`) avec `fetch` mocké.
- **Mapper** : `normalizeShopcaisseCatalogItems` renseigne `familyId`.
- **Intégration** (DB de test) : flux complet cache → publier (draft) → activer (active) → archiver, et vérification que la boutique/sitemap ne voient que les `active`.
- **Régression** : les 121 `Product` et 112 liens existants restent intacts après backfill.

## 6. Hors périmètre (YAGNI)

- Arborescence parent/enfant de catégories (Shopcaisse est plat).
- Job de synchronisation automatique cache→Product.
- Refonte de l'UI d'import Shopcaisse existante.
- Renvoi de mouvements de stock (déjà couvert ailleurs).

## 7. Points de vigilance

- Filtrer impérativement `"System family"` **et** `"Pas de famille"` lors de la synchro des catégories.
- Conserver `externalFamilyId` comme identité de catégorie même en cas de renommage côté Shopcaisse (évite doublons/orphelins).
- Le backfill doit être idempotent (rejouable sans effet de bord).
- Les actions groupées doivent rester performantes sur de grandes sélections (opérations par lots, `updateMany` quand possible).
