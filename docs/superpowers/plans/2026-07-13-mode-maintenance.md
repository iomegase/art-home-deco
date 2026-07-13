# Mode maintenance — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre à l'admin d'activer/désactiver depuis le dashboard un mode maintenance qui remplace tout le site public par une page « Site en maintenance — De retour bientôt », tout en laissant l'admin connecté voir le vrai site.

**Architecture:** Un drapeau booléen `maintenance.enabled` est stocké dans `homeContentJson` de `SiteSetting` (comme `legal`/`storeStatus`, donc sans migration). Le `(public)/layout.tsx` — qui charge déjà les réglages — affiche une page maintenance si le drapeau est actif et que le visiteur n'a pas de session admin. Le bouton d'activation est dans la carte « Onglet Home » du CMS.

**Tech Stack:** Next.js App Router (server components + server actions), TypeScript, Prisma/Postgres (Neon), tests via `node:test` exécutés avec `npx tsx --test`.

## Global Constraints

- **Aucune migration Prisma** : le drapeau est stocké dans le JSON existant.
- **Tests** : style `node:test` + `node:assert/strict`, **imports statiques uniquement** (pas de top-level await), modules purs **sans alias `@/`**. Commande : `npx --yes tsx --test <fichier>`.
- **Copie exacte** : titre `Site en maintenance`, sous-titre `De retour bientôt`.
- **Bypass admin** via `getAdminSession()` (retourne `{ userId, role } | null`) de `@/server/security/auth`.
- **Périmètre** : tout `(public)/*`. Hors périmètre : message éditable, date de retour, blocage `/api`, réponse HTTP 503.
- Suivre les patterns existants (formulaires + server actions, classes Tailwind inline du dashboard).

---

## File Structure

- `src/features/admin-home/types.ts` — **Modifier** : ajout du type `MaintenanceSettings` + `defaultMaintenanceSettings`.
- `src/features/admin-home/maintenance.ts` — **Créer** : logique pure (`shouldShowMaintenance`, `parseMaintenanceSettings`).
- `src/features/admin-home/maintenance.test.ts` — **Créer** : tests unitaires de la logique pure.
- `src/server/repositories/site-settings.repository.ts` — **Modifier** : persistance du drapeau.
- `src/features/admin-home/actions.ts` — **Modifier** : `setMaintenanceModeAction`.
- `src/components/layout/maintenance-screen.tsx` — **Créer** : page maintenance (présentation).
- `src/features/admin-home/components/confirm-submit-button.tsx` — **Créer** : bouton client avec `confirm()`.
- `src/app/(public)/layout.tsx` — **Modifier** : gate.
- `src/app/admin/(protected)/home/page.tsx` — **Modifier** : bandeau + boutons dans la carte « Onglet Home ».

---

## Task 1: Logique pure du mode maintenance (types + helpers + tests)

**Files:**
- Modify: `src/features/admin-home/types.ts` (après le bloc `StoreStatusSettings`, l.116 ; défaut après `defaultStoreStatusSettings`, l.173)
- Create: `src/features/admin-home/maintenance.ts`
- Test: `src/features/admin-home/maintenance.test.ts`

**Interfaces:**
- Produces:
  - `type MaintenanceSettings = { enabled: boolean }` (dans `types.ts`)
  - `const defaultMaintenanceSettings: MaintenanceSettings` (dans `types.ts`)
  - `shouldShowMaintenance(enabled: boolean, isAdmin: boolean): boolean` (dans `maintenance.ts`)
  - `parseMaintenanceSettings(value: unknown): MaintenanceSettings` (dans `maintenance.ts`)

- [ ] **Step 1: Ajouter le type et le défaut dans `types.ts`**

Ajouter le type juste après la fermeture de `StoreStatusSettings` (après la ligne `};` à la l.116) :

```ts
export type MaintenanceSettings = {
  enabled: boolean;
};
```

Ajouter le défaut juste après le bloc `defaultStoreStatusSettings` (après son `};` à la l.173) :

```ts
export const defaultMaintenanceSettings: MaintenanceSettings = {
  enabled: false,
};
```

- [ ] **Step 2: Écrire le module pur `maintenance.ts`**

Create `src/features/admin-home/maintenance.ts` :

```ts
import { defaultMaintenanceSettings, type MaintenanceSettings } from "./types";

/**
 * Le site public affiche la page maintenance uniquement pour les visiteurs
 * non-admin quand le mode est activé. Un admin connecté voit toujours le site.
 */
export function shouldShowMaintenance(enabled: boolean, isAdmin: boolean): boolean {
  return enabled && !isAdmin;
}

/** Lit un réglage maintenance depuis une valeur JSON inconnue, avec repli sur le défaut. */
export function parseMaintenanceSettings(value: unknown): MaintenanceSettings {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const source = value as Partial<MaintenanceSettings>;
    return { enabled: source.enabled === true };
  }

  return { ...defaultMaintenanceSettings };
}
```

- [ ] **Step 3: Écrire le test qui échoue**

Create `src/features/admin-home/maintenance.test.ts` :

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { shouldShowMaintenance, parseMaintenanceSettings } from "./maintenance.ts";

test("shouldShowMaintenance: page maintenance seulement pour non-admin quand activé", () => {
  assert.equal(shouldShowMaintenance(true, false), true);
  assert.equal(shouldShowMaintenance(true, true), false);
  assert.equal(shouldShowMaintenance(false, false), false);
  assert.equal(shouldShowMaintenance(false, true), false);
});

test("parseMaintenanceSettings: lit enabled et retombe sur le défaut", () => {
  assert.deepEqual(parseMaintenanceSettings({ enabled: true }), { enabled: true });
  assert.deepEqual(parseMaintenanceSettings({ enabled: false }), { enabled: false });
  assert.deepEqual(parseMaintenanceSettings({ enabled: "yes" }), { enabled: false });
  assert.deepEqual(parseMaintenanceSettings(undefined), { enabled: false });
  assert.deepEqual(parseMaintenanceSettings(null), { enabled: false });
  assert.deepEqual(parseMaintenanceSettings("nope"), { enabled: false });
  assert.deepEqual(parseMaintenanceSettings([1, 2]), { enabled: false });
});
```

- [ ] **Step 4: Lancer le test — vérifier qu'il passe**

Run: `npx --yes tsx --test src/features/admin-home/maintenance.test.ts`
Expected: `# pass 2` / `# fail 0`

(Note : le module et le test sont écrits ensemble ; si tu veux voir l'échec d'abord, lance le test avant de créer `maintenance.ts` — il échoue sur module introuvable.)

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: aucune erreur.

- [ ] **Step 6: Commit**

```bash
git add src/features/admin-home/types.ts src/features/admin-home/maintenance.ts src/features/admin-home/maintenance.test.ts
git commit -m "feat(maintenance): logique pure + reglages du mode maintenance"
```

---

## Task 2: Persistance du drapeau (repository)

**Files:**
- Modify: `src/server/repositories/site-settings.repository.ts`

**Interfaces:**
- Consumes: `parseMaintenanceSettings`, `defaultMaintenanceSettings`, `type MaintenanceSettings` (Task 1)
- Produces:
  - `getSiteSettings()` retourne en plus `maintenance: MaintenanceSettings`
  - `upsertSiteSettings()` accepte `maintenance?: MaintenanceSettings`

- [ ] **Step 1: Mettre à jour les imports**

Dans le bloc d'import depuis `@/features/admin-home/types` (l.5-13), ajouter `defaultMaintenanceSettings` et `type MaintenanceSettings` :

```ts
import {
  defaultHomeContent,
  defaultMaintenanceSettings,
  defaultStoreStatusSettings,
  defaultThemeSettings,
  type HomeContent,
  type LegalSettings,
  type MaintenanceSettings,
  type StoreStatusSettings,
  type ThemeSettings,
} from "@/features/admin-home/types";
```

Ajouter l'import de la fonction pure en tête (après la ligne d'import `legalSettingsFromEnv`, l.2) :

```ts
import { parseMaintenanceSettings } from "@/features/admin-home/maintenance";
```

- [ ] **Step 2: Ajouter la clé de stockage et l'extraction**

Après `const STORE_STATUS_STORAGE_KEY = "_storeStatusSettings";` (l.17), ajouter :

```ts
const MAINTENANCE_STORAGE_KEY = "_maintenanceSettings";
```

Dans `asHomeContent`, après `delete homeSource[STORE_STATUS_STORAGE_KEY];` (l.31), ajouter :

```ts
  delete homeSource[MAINTENANCE_STORAGE_KEY];
```

Ajouter une fonction d'extraction juste après `extractStoreStatusSettings` (fonction qui se termine vers la l.83) :

```ts
function extractMaintenanceSettings(homeContentJson: Prisma.JsonValue): MaintenanceSettings {
  const source = asJsonObject(homeContentJson);
  return parseMaintenanceSettings(source[MAINTENANCE_STORAGE_KEY]);
}
```

- [ ] **Step 3: Retourner `maintenance` dans les 3 chemins de `getSiteSettings`**

Dans `getSiteSettings()`, ajouter `maintenance: defaultMaintenanceSettings,` dans les DEUX retours de repli (celui du `catch` DB indisponible et celui du `if (!settings)`), à côté de `storeStatus: defaultStoreStatusSettings,`.

Dans le retour final (settings présents), ajouter après `storeStatus: extractStoreStatusSettings(settings.homeContentJson),` :

```ts
    maintenance: extractMaintenanceSettings(settings.homeContentJson),
```

- [ ] **Step 4: Écrire le drapeau dans `upsertSiteSettings`**

Dans la signature de `upsertSiteSettings` (objet `input`), ajouter le champ optionnel :

```ts
export async function upsertSiteSettings(input: {
  homeContent: HomeContent;
  theme: ThemeSettings;
  legal?: LegalSettings;
  storeStatus?: StoreStatusSettings;
  maintenance?: MaintenanceSettings;
}) {
```

Juste après `const storeStatus = input.storeStatus ?? existing.storeStatus;`, ajouter :

```ts
  const maintenance = input.maintenance ?? existing.maintenance;
```

Dans l'objet `homeContentJson`, ajouter la clé maintenance à côté des autres :

```ts
  const homeContentJson = {
    ...input.homeContent,
    [LEGAL_STORAGE_KEY]: legal,
    [STORE_STATUS_STORAGE_KEY]: storeStatus,
    [MAINTENANCE_STORAGE_KEY]: maintenance,
  };
```

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: aucune erreur. (Confirme que `existing.maintenance` est bien typé, donc que les 3 retours de `getSiteSettings` incluent `maintenance`.)

- [ ] **Step 6: Commit**

```bash
git add src/server/repositories/site-settings.repository.ts
git commit -m "feat(maintenance): persistance du drapeau dans SiteSetting (sans migration)"
```

---

## Task 3: Server action de bascule

**Files:**
- Modify: `src/features/admin-home/actions.ts`

**Interfaces:**
- Consumes: `getSiteSettings`, `upsertSiteSettings` (déjà importés dans ce fichier), `requireAdmin`, `revalidatePath` (déjà importés)
- Produces: `setMaintenanceModeAction(formData: FormData): Promise<void>`

- [ ] **Step 1: Ajouter l'action en fin de fichier**

Ajouter à la fin de `src/features/admin-home/actions.ts` :

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

  revalidatePath("/", "layout");
  revalidatePath("/admin/home");
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add src/features/admin-home/actions.ts
git commit -m "feat(maintenance): action serveur de bascule du mode maintenance"
```

---

## Task 4: Page « Site en maintenance »

**Files:**
- Create: `src/components/layout/maintenance-screen.tsx`

**Interfaces:**
- Consumes: `type LegalSettings` de `@/features/admin-home/types`
- Produces: `export function MaintenanceScreen({ legal }: { legal: LegalSettings }): JSX.Element`

- [ ] **Step 1: Créer le composant**

Create `src/components/layout/maintenance-screen.tsx` :

```tsx
import type { LegalSettings } from "@/features/admin-home/types";

export function MaintenanceScreen({ legal }: { legal: LegalSettings }) {
  const email = legal.email && !legal.email.startsWith("[") ? legal.email : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#faf8f5] px-6 text-center">
      <meta name="robots" content="noindex" />
      <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#bd6745]">
        {legal.commercialName}
      </p>
      <h1 className="mt-6 text-[34px] font-semibold leading-tight tracking-[-0.02em] text-[#181713] md:text-[44px]">
        Site en maintenance
      </h1>
      <p className="mt-4 max-w-md text-[15px] text-[#6f6a5d]">
        De retour bientôt.
      </p>
      {email ? (
        <a
          href={`mailto:${email}`}
          className="mt-8 inline-flex items-center rounded-full border border-[#181713] px-5 py-2.5 text-[13px] font-semibold text-[#181713] transition hover:bg-[#181713] hover:text-white"
        >
          Nous contacter
        </a>
      ) : null}
    </main>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/maintenance-screen.tsx
git commit -m "feat(maintenance): page publique Site en maintenance"
```

---

## Task 5: Gate dans le layout public

**Files:**
- Modify: `src/app/(public)/layout.tsx`

**Interfaces:**
- Consumes: `getSiteSettings` (déjà importé), `getAdminSession` de `@/server/security/auth`, `shouldShowMaintenance` de `@/features/admin-home/maintenance`, `MaintenanceScreen` de `@/components/layout/maintenance-screen`

- [ ] **Step 1: Ajouter les imports**

En tête de `src/app/(public)/layout.tsx`, ajouter :

```ts
import { MaintenanceScreen } from "@/components/layout/maintenance-screen";
import { shouldShowMaintenance } from "@/features/admin-home/maintenance";
import { getAdminSession } from "@/server/security/auth";
```

- [ ] **Step 2: Lire `maintenance` + session et court-circuiter**

Remplacer la ligne :

```ts
  const { legal, storeStatus } = await getSiteSettings();
```

par :

```ts
  const { legal, storeStatus, maintenance } = await getSiteSettings();
  const adminSession = await getAdminSession();

  if (shouldShowMaintenance(maintenance.enabled, Boolean(adminSession))) {
    return <MaintenanceScreen legal={legal} />;
  }
```

(Le reste du layout — nav, `{children}`, footer, popup — reste inchangé et n'est rendu que si la maintenance est inactive ou si l'utilisateur est admin.)

- [ ] **Step 3: Typecheck + build**

Run: `npm run typecheck`
Expected: aucune erreur.

Run: `npm run build`
Expected: build réussi ; les routes `(public)` compilent (elles deviennent dynamiques car le layout lit désormais les cookies via `getAdminSession` — attendu).

- [ ] **Step 4: Commit**

```bash
git add "src/app/(public)/layout.tsx"
git commit -m "feat(maintenance): gate du site public avec bypass admin"
```

---

## Task 6: UI admin — bandeau + boutons dans la carte « Onglet Home »

**Files:**
- Create: `src/features/admin-home/components/confirm-submit-button.tsx`
- Modify: `src/app/admin/(protected)/home/page.tsx`

**Interfaces:**
- Consumes: `setMaintenanceModeAction` (Task 3), `getSiteSettings` (déjà utilisé dans la page)
- Produces: `ConfirmSubmitButton` (client component)

- [ ] **Step 1: Créer le bouton client avec confirmation**

Create `src/features/admin-home/components/confirm-submit-button.tsx` :

```tsx
"use client";

import type { ReactNode } from "react";

export function ConfirmSubmitButton({
  children,
  className,
  confirmMessage,
}: {
  children: ReactNode;
  className?: string;
  confirmMessage?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Importer l'action, le bouton et lire `maintenance` dans la page home**

Dans `src/app/admin/(protected)/home/page.tsx`, mettre à jour l'import des actions (l.1) pour inclure `setMaintenanceModeAction` :

```ts
import { setMaintenanceModeAction, updateHomeContentAction, uploadHomeImageAction } from "@/features/admin-home/actions";
```

Ajouter l'import du bouton client :

```ts
import { ConfirmSubmitButton } from "@/features/admin-home/components/confirm-submit-button";
```

Remplacer la ligne `const { homeContent } = await getSiteSettings();` par :

```ts
  const { homeContent, maintenance } = await getSiteSettings();
```

- [ ] **Step 3: Insérer le bandeau + boutons dans la carte « Onglet Home »**

Dans la carte d'en-tête (entre le `<p>` de description terminant l.60 et la fermeture `</div>` de la l.61), insérer :

```tsx
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-[#f0e6da] bg-[#fbf7f2] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-[#0f1115]">Mode maintenance</p>
            <p className="mt-1 text-[11px] text-slate-500">
              {maintenance.enabled
                ? "⚠ Activé — les visiteurs voient la page « Site en maintenance ». Vous (admin) voyez le vrai site."
                : "Désactivé — le site public est visible par tous."}
            </p>
          </div>
          {maintenance.enabled ? (
            <form action={setMaintenanceModeAction}>
              <input type="hidden" name="enabled" value="false" />
              <ConfirmSubmitButton className="inline-flex shrink-0 items-center rounded-lg bg-[#181713] px-4 py-2 text-[12px] font-semibold text-white transition hover:opacity-90">
                Désactiver la maintenance
              </ConfirmSubmitButton>
            </form>
          ) : (
            <form action={setMaintenanceModeAction}>
              <input type="hidden" name="enabled" value="true" />
              <ConfirmSubmitButton
                confirmMessage="Activer le mode maintenance ? Les visiteurs verront la page « Site en maintenance »."
                className="inline-flex shrink-0 items-center rounded-lg border border-[#e3b23c] bg-[#fdf6e3] px-4 py-2 text-[12px] font-semibold text-[#8a6d1a] transition hover:bg-[#fbeecb]"
              >
                Activer le mode maintenance
              </ConfirmSubmitButton>
            </form>
          )}
        </div>
```

- [ ] **Step 4: Typecheck + build**

Run: `npm run typecheck`
Expected: aucune erreur.

Run: `npm run build`
Expected: build réussi.

- [ ] **Step 5: Commit**

```bash
git add "src/app/admin/(protected)/home/page.tsx" src/features/admin-home/components/confirm-submit-button.tsx
git commit -m "feat(maintenance): bouton de bascule dans la carte Onglet Home"
```

---

## Task 7: Vérification bout-en-bout (manuelle)

**But :** confirmer le comportement réel avant de conclure.

- [ ] **Step 1: Lancer l'app**

Run: `npm run dev`

- [ ] **Step 2: Activer depuis le dashboard**

Se connecter à l'admin, ouvrir `/admin/home`, cliquer « Activer le mode maintenance », confirmer.

- [ ] **Step 3: Vérifier le bypass admin**

Dans le même navigateur (session admin active), ouvrir `/` : le **vrai site** s'affiche (bypass admin OK). Le bandeau `/admin/home` indique « Activé ».

- [ ] **Step 4: Vérifier la vue visiteur**

Ouvrir `/` en navigation privée (sans cookie `admin_session`) : la page **« Site en maintenance — De retour bientôt »** s'affiche, sans nav ni footer. Vérifier aussi une autre route publique (ex. `/boutique`) → même page maintenance.

- [ ] **Step 5: Désactiver**

Revenir sur `/admin/home`, cliquer « Désactiver la maintenance ». Recharger `/` en navigation privée → le site public est de nouveau visible.

- [ ] **Step 6: Tests + commit final si correctifs**

Run: `npx --yes tsx --test src/features/admin-home/maintenance.test.ts`
Expected: `# pass 2` / `# fail 0`

Si des correctifs ont été nécessaires, les committer.

---

## Self-Review (rempli par l'auteur du plan)

- **Couverture du spec** : portée site public (Task 5) ✓ ; bypass admin (Task 5) ✓ ; texte fixe (Task 4) ✓ ; bouton dans carte Onglet Home (Task 6) ✓ ; stockage JSON sans migration (Task 2) ✓ ; action + revalidation (Task 3) ✓ ; helper testable (Task 1) ✓.
- **Écart assumé** : le spec évoquait un test « round-trip repository ». Le projet n'a **pas** d'infra de mock DB (tous les tests existants portent sur des fonctions pures). On teste donc `parseMaintenanceSettings` (logique pure d'extraction), plus fidèle aux patterns existants ; la persistance est couverte par le typecheck + la vérif manuelle (Task 7).
- **Placeholders** : aucun — chaque étape contient le code complet.
- **Cohérence des types** : `MaintenanceSettings`/`defaultMaintenanceSettings` (Task 1) utilisés tels quels en Tasks 2/3 ; `getSiteSettings().maintenance` (Task 2) consommé en Tasks 3/5/6 ; `shouldShowMaintenance` (Task 1) consommé en Task 5 ; `setMaintenanceModeAction` (Task 3) consommé en Task 6.
