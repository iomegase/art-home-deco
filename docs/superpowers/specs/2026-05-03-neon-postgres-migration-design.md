# Neon Postgres Migration Design

## Goal
Migrer le projet `art-home-deco` de SQLite vers Neon Postgres avec Prisma, en utilisant Neon comme base unique pour le développement local et les environnements distants, sans changer le modèle métier ni casser les flux MVP validés localement.

## Scope
Inclus :
- bascule Prisma de `sqlite` vers `postgresql`
- durcissement de la variable `DATABASE_URL`
- export des données SQLite existantes
- import ordonné dans Neon
- revalidation locale complète sur Neon

Exclus :
- déploiement Vercel
- optimisation perf avancée
- refonte du modèle Prisma
- ajout de nouvelles fonctionnalités métier

## Recommended Approach
Approche retenue : bascule directe vers Postgres avec Neon utilisé partout.

Raisons :
- une seule vérité de données
- suppression de la divergence local/prod
- alignement avec Prisma et Vercel
- coût de maintenance inférieur à une transition hybride

Approches écartées :
- hybride SQLite local / Postgres distant : trop de divergence
- reset complet sans migration de données : perte d’historique local inutile

## Current State
Le schéma Prisma utilise actuellement :
- `provider = "sqlite"`
- `DATABASE_URL=file:./dev.db`

Les entités à préserver sont :
- `Category`
- `Product`
- `ProductImage`
- `ProductCategory`
- `BlogPost`
- `Order`
- `OrderItem`
- `IntegrationEvent`

Le projet dépend déjà de Prisma et ses ids `cuid()` sont compatibles avec une migration de données vers Postgres.

## Target State
### Database
- Prisma passe à `provider = "postgresql"`
- `DATABASE_URL` pointe vers Neon dans tous les environnements
- le local ne s’appuie plus sur `file:./dev.db`

### Environment Handling
- `DATABASE_URL` devient obligatoire
- plus de valeur par défaut SQLite dans le schéma d’environnement
- les docs/examples doivent refléter Neon/Postgres

### Data Migration Strategy
Migration applicative pragmatique, pas migration SQL manuelle.

Étapes :
1. exporter les tables SQLite en JSON
2. créer le schéma Postgres via Prisma
3. importer les données dans l’ordre relationnel
4. vérifier les volumes et quelques enregistrements critiques
5. relancer la recette locale sur Neon

Ordre d’import :
1. `Category`
2. `Product`
3. `ProductImage`
4. `ProductCategory`
5. `BlogPost`
6. `Order`
7. `OrderItem`
8. `IntegrationEvent`

## Implementation Units
### 1. Prisma and env configuration
Responsabilité : rendre le projet compatible Postgres/Neon sans fallback SQLite.

Fichiers principaux :
- `prisma/schema.prisma`
- `src/server/env/schema.ts`
- `package.json`
- `.env.example` si versionné dans le repo plus tard

### 2. Data export/import tooling
Responsabilité : transférer proprement les données SQLite existantes vers Neon.

Fichiers prévus :
- script d’export SQLite -> JSON
- script d’import JSON -> Postgres via Prisma
- dossier temporaire de snapshots de migration si nécessaire

### 3. Verification and local recipe
Responsabilité : prouver que le projet continue de fonctionner sur Neon.

Points à vérifier :
- `typecheck`
- `lint`
- `build`
- `db:push`
- `db:seed` si utile
- parcours locaux déjà validés : blog/admin/checkout/webhooks

## Error Handling and Safety
- ne jamais supprimer `dev.db` au début de la migration
- conserver un export JSON des données avant import
- exécuter l’import dans un ordre relationnel strict
- rendre les scripts idempotents ou explicitement destructifs seulement sur base cible vide
- préférer `prisma db push` pour initialiser la cible avant import

## Testing Strategy
### Technical validation
- `npm run db:generate`
- `npx prisma db push`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

### Functional validation
- login admin
- liste blog/admin
- génération brouillon blog
- checkout Stripe local
- webhook EasyShop local
- lecture catalogue/public

## Risks
- mauvaise `DATABASE_URL` Neon
- import hors ordre relationnel
- écarts de comportement SQLite/Postgres sur contraintes et unicité
- scripts d’import non idempotents

## Mitigations
- base Neon dédiée à la migration
- export JSON conservé localement
- vérification des comptes de lignes avant/après
- validation locale complète avant toute reprise de Vercel

## Success Criteria
La migration est considérée comme terminée si :
- le schéma Prisma cible Postgres
- la base Neon contient les données métier attendues
- le repo passe `typecheck`, `lint`, `build`
- les flux MVP locaux critiques restent opérationnels sur Neon
- SQLite n’est plus nécessaire pour le fonctionnement courant du projet
