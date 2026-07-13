# Design — Mode maintenance du site

Date : 2026-07-13
Statut : validé (design), en attente de relecture du spec

## Objectif

Permettre à l'administrateur d'activer/désactiver, depuis le dashboard, un
« mode maintenance » qui remplace tout le site public par une page sobre
« Site en maintenance — De retour bientôt ». L'admin connecté continue de voir
le vrai site. Le bouton d'activation est placé dans la carte « Onglet Home »
du CMS (`/admin/home`).

## Décisions de cadrage (validées)

- **Portée** : tout le site public (`(public)/*` — accueil, boutique, blog,
  contact, panier/checkout, etc.) est remplacé par la page maintenance.
- **Accès admin** : un admin connecté (cookie `admin_session` valide) voit le
  site normal ; les visiteurs voient la page maintenance.
- **Contenu de la page** : texte fixe simple (pas de message éditable, pas de
  date de retour). Titre « Site en maintenance », sous-titre « De retour
  bientôt », nom de la boutique, lien contact optionnel.
- **Emplacement du bouton** : dans le bandeau/carte « Onglet Home » en tête de
  `src/app/admin/(protected)/home/page.tsx`.

## Approche retenue

Drapeau booléen stocké en base dans le JSON de réglages existant + gate au
niveau du layout public + bypass via le cookie de session admin.

Alternatives écartées :
- **Middleware Next** : tourne sur l'Edge, ne peut pas lire Postgres/Prisma ;
  imposerait une var d'env (redéploiement, incompatible avec un toggle
  dashboard) ou un store Edge (infra en plus). Surdimensionné.
- **Colonne dédiée sur `SiteSetting`** : nécessiterait une migration Prisma en
  prod. Le stockage JSON l'évite.

## Architecture

### 1. Donnée / persistance (aucune migration)

`SiteSetting` (clé `default`) stocke déjà `legal` et `storeStatus` **dans**
`homeContentJson` sous des clés dédiées (`_legalSettings`,
`_storeStatusSettings`). On ajoute la maintenance de la même façon.

- `src/features/admin-home/types.ts` :
  - `export type MaintenanceSettings = { enabled: boolean };`
  - `export const defaultMaintenanceSettings: MaintenanceSettings = { enabled: false };`
- `src/server/repositories/site-settings.repository.ts` :
  - Nouvelle constante `const MAINTENANCE_STORAGE_KEY = "_maintenanceSettings";`
  - `asMaintenanceSettings(value)` + `extractMaintenanceSettings(homeContentJson)`
    sur le modèle des fonctions `asStoreStatusSettings` /
    `extractStoreStatusSettings`.
  - Retirer la clé `_maintenanceSettings` dans le nettoyage de `asHomeContent`
    (là où `_legalSettings` / `_storeStatusSettings` sont déjà `delete`).
  - `getSiteSettings()` retourne en plus `maintenance: MaintenanceSettings`
    (dans les 3 chemins de retour : succès, settings absents, DB indisponible →
    `defaultMaintenanceSettings`).
  - `upsertSiteSettings()` accepte `maintenance?: MaintenanceSettings`,
    conserve l'existant si absent, et l'écrit sous `MAINTENANCE_STORAGE_KEY`
    dans `homeContentJson`.

### 2. Action serveur

`src/features/admin-home/actions.ts` :

```ts
export async function setMaintenanceModeAction(formData: FormData) {
  await requireAdmin();
  const enabled = formData.get("enabled") === "true";
  const current = await getSiteSettings();
  await upsertSiteSettings({
    homeContent: current.homeContent,
    theme: current.theme,
    legal: current.legal,
    storeStatus: current.storeStatus,
    maintenance: { enabled },
  });
  revalidatePath("/", "layout"); // rafraîchit tout le site public
  revalidatePath("/admin/home");
}
```

Le champ caché `enabled` porte l'état **cible** (l'inverse de l'état courant),
fourni par le formulaire dans l'UI admin.

### 3. Gate (layout public)

`src/app/(public)/layout.tsx` charge déjà `getSiteSettings()`. On ajoute :

```ts
const { legal, storeStatus, maintenance } = await getSiteSettings();
const adminSession = await getAdminSession(); // non-bloquant, existe déjà
if (shouldShowMaintenance(maintenance.enabled, Boolean(adminSession))) {
  return <MaintenanceScreen legal={legal} />;
}
```

`getAdminSession()` (dans `src/server/security/auth.ts`) renvoie la session ou
`null` — bypass admin trivial.

Helper pur, testable :

```ts
// src/features/admin-home/maintenance.ts
export function shouldShowMaintenance(enabled: boolean, isAdmin: boolean): boolean {
  return enabled && !isAdmin;
}
```

Note SEO : le layout étant `dynamic` (lecture cookies via `getAdminSession`),
les pages publiques ne seront plus statiquement mises en cache tant que la
maintenance est un facteur. Acceptable pour une boutique de cette taille. La
page maintenance inclut `<meta name="robots" content="noindex" />`.

### 4. Page maintenance

`src/components/layout/maintenance-screen.tsx` (server component) :
- Plein écran, centré, sobre (cohérent avec le style du site).
- Nom de la boutique depuis `legal.commercialName`.
- Titre « Site en maintenance », sous-titre « De retour bientôt ».
- Lien « Nous contacter » optionnel : `mailto:legal.email` (et/ou `tel:legal.phone`)
  s'ils sont renseignés.
- Pas de `SiteNav` ni `SiteFooter`.
- `noindex`.

### 5. UI admin — bouton dans la carte « Onglet Home »

Dans le bandeau en tête de `src/app/admin/(protected)/home/page.tsx`
(`getSiteSettings()` y est déjà appelé, on récupère `maintenance`) :

- **OFF** → bouton discret « Activer le mode maintenance » (form → action avec
  `enabled=true`), protégé par une confirmation.
- **ON** → bandeau d'alerte visible « ⚠ Mode maintenance activé — les visiteurs
  voient la page maintenance » + bouton « Désactiver » (`enabled=false`).

La confirmation d'activation nécessite un petit composant client
`src/features/admin-home/components/maintenance-toggle.tsx` (`"use client"`)
qui enveloppe le bouton d'activation dans un `confirm()` avant submit. La
désactivation peut se faire sans confirmation.

## Découpage / unités

- **Réglage maintenance** (types + repository) : lecture/écriture du flag.
- **Helper `shouldShowMaintenance`** : logique de décision pure, isolée et
  testable.
- **`MaintenanceScreen`** : présentation seule, dépend de `legal`.
- **`setMaintenanceModeAction`** : mutation + revalidation.
- **`MaintenanceToggle`** : UI admin (confirmation).

## Tests

Dans le style des tests existants (vitest) :
- Unitaire `shouldShowMaintenance` : (true, admin=false)→true ;
  (true, admin=true)→false ; (false, *)→false.
- Round-trip repository : `upsertSiteSettings({ maintenance: { enabled: true } })`
  puis `getSiteSettings()` renvoie `maintenance.enabled === true`, sans écraser
  `homeContent` / `legal` / `storeStatus`.

## Fichiers touchés

- `src/features/admin-home/types.ts` (type + défaut)
- `src/server/repositories/site-settings.repository.ts` (clé, extract, retour, upsert)
- `src/features/admin-home/actions.ts` (nouvelle action)
- `src/features/admin-home/maintenance.ts` (helper, nouveau)
- `src/app/(public)/layout.tsx` (gate)
- `src/components/layout/maintenance-screen.tsx` (nouveau)
- `src/app/admin/(protected)/home/page.tsx` (bandeau + bouton)
- `src/features/admin-home/components/maintenance-toggle.tsx` (client, nouveau)
- tests correspondants

**Aucune migration Prisma.**

## Hors périmètre (YAGNI)

- Message / titre / date de retour éditables.
- Blocage des routes `/api`.
- Vraie réponse HTTP 503 (la page maintenance répond 200).
- Planification automatique (on/off manuel uniquement).
