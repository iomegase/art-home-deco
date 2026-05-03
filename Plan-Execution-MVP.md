# Plan-Execution-MVP.md — Art Home Déco

## Objectif
Passer du pack de planification et du socle déjà présent à un MVP e-commerce testable de bout en bout : catalogue, panier, checkout Stripe, webhook, emails, commandes, livraison simple, Shopcaisse préparé, admin minimal, SEO et déploiement.

## Audit rapide du dépôt existant

### État actuel constaté
- Le dépôt est déjà structuré comme un projet Next.js App Router en TypeScript.
- La stack déclarée inclut Next.js 16, React 19, Tailwind CSS 4, Prisma, Stripe, Resend et Zod.
- Les fichiers de pilotage Codex existent déjà : `README.md`, `AGENTS.md`, `Plan.md`, `docs/architecture.md`, `docs/data-models.md`, `docs/business-rules.md`, `docs/shopcaisse-api.md`.
- La partie catalogue existe déjà en partie : homepage, page boutique, page produit, récupération produits actifs, catégories, JSON-LD Product.
- Le modèle Prisma existe avec `Product`, `ProductImage`, `Category`, `Order`, `OrderItem`, `BlogPost`, `IntegrationEvent`.
- Le panier existe en localStorage avec recalcul serveur via `/api/cart/quote`.
- Le checkout Stripe est amorcé : création d’une commande `pending`, création de session Stripe, redirection vers Stripe Checkout.
- Le webhook Stripe existe : traitement de `checkout.session.completed`, passage commande en `paid`, décrément du stock, tentative de mouvement Shopcaisse, email transactionnel client.
- Le service email est basé sur Resend.
- Le fichier `next.config.ts` autorise déjà les images Unsplash.

### Points à stabiliser avant MVP
- Créer ou compléter `.env.example`.
- Vérifier la présence réelle des pages admin et les créer si absentes.
- Confirmer le choix de base de données de production. SQLite convient au développement, mais le MVP scalable devrait viser une base distante type PostgreSQL managée.
- Ajouter l’email boutique/admin lors d’une commande payée.
- Ajouter une page success qui vide le panier côté client après paiement confirmé.
- Ajouter une page cancel claire.
- Ajouter des tests de webhook Stripe via Stripe CLI.
- Finaliser la logique Shopcaisse sans inventer d’endpoints.
- Ajouter les commandes admin et les statuts de préparation/livraison.
- Ajouter les pages légales minimales : CGV, livraison/retours, confidentialité, mentions légales.
- Vérifier le build complet avant toute nouvelle fonctionnalité.

## Règle principale
Ne pas repartir de zéro. Le repo contient déjà un socle fonctionnel. Codex doit auditer, renforcer et compléter l’existant.

---

# Milestone M0 — Stabilisation immédiate du repo

## Objectif
Obtenir une base locale fiable avant d’ajouter de nouvelles fonctionnalités.

## Tâches
1. Installer les dépendances.
2. Lancer Prisma generate.
3. Lancer ou créer la base locale.
4. Exécuter le seed.
5. Vérifier que la homepage, `/boutique`, `/boutique/[slug]`, `/panier`, `/checkout` fonctionnent.
6. Vérifier `npm run lint`.
7. Vérifier `npm run build`.

## Commandes
```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run lint
npm run build
npm run dev
```

## Critères de validation
- Le projet démarre en local.
- Le catalogue affiche les produits seedés.
- Le panier calcule les prix côté serveur.
- Aucun secret n’est exposé côté client.
- Le build Next.js passe.

---

# Milestone M1 — Variables d’environnement et configuration

## Objectif
Rendre la configuration claire pour local, Vercel et production.

## Fichiers à créer ou compléter
```txt
.env.example
src/server/env/schema.ts
README.md
```

## Variables minimales
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=file:./dev.db

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

RESEND_API_KEY=
EMAIL_FROM=
EMAIL_REPLY_TO=
ADMIN_ORDER_EMAIL=

ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=

SHOPCAISSE_API_URL=
SHOPCAISSE_API_KEY=
SHOPCAISSE_STORE_ID=
SHOPCAISSE_API_TIMEOUT_MS=8000
SHOPCAISSE_STOCK_SYNC_URL=
SHOPCAISSE_STOCK_VERIFY_URL=
SHOPCAISSE_MOVEMENT_URL=

OPENAI_API_KEY=
```

## Tâches
1. Créer `.env.example`.
2. Ajouter `ADMIN_ORDER_EMAIL` au schéma d’environnement.
3. Documenter Stripe CLI dans le README.
4. Documenter les variables Resend.
5. Documenter les variables Shopcaisse comme optionnelles tant que l’API n’est pas confirmée.

## Critères de validation
- Un développeur peut configurer le projet sans deviner les variables.
- Le projet fonctionne sans Stripe ni Resend configurés, mais renvoie des messages explicites.

---

# Milestone M2 — Checkout Stripe complet en test réel

## Objectif
Valider une commande réelle en mode test Stripe.

## Fichiers concernés
```txt
src/app/api/checkout/route.ts
src/server/use-cases/create-checkout-session.use-case.ts
src/app/api/stripe/webhook/route.ts
src/server/use-cases/handle-stripe-webhook.use-case.ts
src/app/(public)/commande/success/page.tsx
src/app/(public)/commande/cancel/page.tsx
```

## Tâches
1. Vérifier que le serveur recalcule bien le panier avant Stripe.
2. Vérifier que la commande créée avant Stripe reste `pending`.
3. Vérifier que le webhook seul passe la commande en `paid`.
4. Vérifier que le stock est décrémenté une seule fois.
5. Ajouter ou vérifier l’idempotence via `stockDecrementedAt` et `paymentStatus`.
6. Créer une page `/commande/success` propre.
7. Créer une page `/commande/cancel` propre.

## Stripe CLI
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copier ensuite le secret retourné :

```env
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Test carte Stripe
```txt
4242 4242 4242 4242
Date future
CVC quelconque
```

## Critères de validation
- Stripe Checkout s’ouvre.
- Après paiement test, le webhook est reçu.
- La commande passe en `paid`.
- Le stock baisse.
- Un second webhook identique ne redécrémente pas le stock.

---

# Milestone M3 — Emails transactionnels

## Objectif
Envoyer les bons emails au bon moment.

## Fichiers concernés
```txt
src/server/services/email.service.ts
src/emails/templates/order-confirmation.ts
src/emails/templates/admin-new-order.ts
src/server/use-cases/handle-stripe-webhook.use-case.ts
src/server/env/schema.ts
```

## Emails à gérer
1. Email client : confirmation de commande.
2. Email boutique : nouvelle commande reçue.
3. Plus tard : commande prête à retirer.
4. Plus tard : commande expédiée avec tracking.

## Tâches
1. Garder Resend comme provider principal.
2. Ajouter `ADMIN_ORDER_EMAIL`.
3. Créer un template admin clair.
4. Envoyer l’email admin après paiement confirmé.
5. Logger les erreurs email sans casser la commande payée.

## Critères de validation
- Le client reçoit un email après paiement confirmé.
- La boutique reçoit un email après paiement confirmé.
- Une panne email ne remet pas la commande en échec.

---

# Milestone M4 — Panier et UX post-paiement

## Objectif
Rendre l’expérience panier/checkout propre.

## Fichiers concernés
```txt
src/features/cart/storage.ts
src/components/cart/cart-view.tsx
src/components/checkout/checkout-form.tsx
src/app/(public)/commande/success/page.tsx
src/app/(public)/commande/cancel/page.tsx
```

## Tâches
1. Ajouter une fonction de suppression ligne panier.
2. Ajouter un bouton “vider le panier”.
3. Empêcher quantité supérieure au stock connu.
4. Vider le panier après succès Stripe.
5. Afficher un résumé de commande sur la page success à partir du `session_id` ou de l’order.
6. Clarifier les modes de livraison.

## Critères de validation
- Le panier est modifiable proprement.
- Le panier est vide après commande payée.
- L’utilisateur comprend si le paiement est annulé.

---

# Milestone M5 — Admin MVP

## Objectif
Créer un back-office simple pour gérer produits, commandes et blog.

## Routes minimales
```txt
/admin
/admin/login
/admin/products
/admin/products/new
/admin/products/[id]/edit
/admin/orders
/admin/orders/[id]
/admin/blog
/admin/blog/new
/admin/settings
```

## Tâches
1. Créer une authentification admin simple.
2. Protéger toutes les routes `/admin`.
3. Lister les commandes.
4. Voir le détail d’une commande.
5. Modifier le statut d’une commande.
6. Lister les produits.
7. Créer/modifier produit.
8. Créer/modifier article blog.
9. Afficher les statuts Shopcaisse.

## Critères de validation
- Aucune page admin n’est accessible sans session.
- Une commande payée est visible dans l’admin.
- Un produit peut être activé/désactivé.
- Un article blog peut être publié en brouillon ou publié.

---

# Milestone M6 — Livraison MVP

## Objectif
Gérer retrait boutique et livraison Colissimo simple sans API complexe.

## Règles MVP
```txt
Retrait boutique = gratuit
Colissimo domicile = prix selon classe logistique
Colissimo point retrait = prix selon classe logistique
PICKUP_ONLY = retrait obligatoire
```

## Tâches
1. Vérifier `features/shipping/rates`.
2. Bloquer Colissimo si un produit est `pickupOnly`.
3. Ajouter les textes explicatifs dans panier et checkout.
4. Ajouter tracking manuel dans l’admin commande.
5. Ajouter email futur “commande expédiée”.

## Critères de validation
- Un produit `PICKUP_ONLY` bloque l’expédition.
- Le retrait boutique reste gratuit.
- Le coût livraison est recalculé côté serveur.

---

# Milestone M7 — Shopcaisse MVP préparé

## Objectif
Préparer l’intégration sans inventer l’API.

## Fichiers concernés
```txt
src/server/services/shopcaisse/client.ts
src/server/services/shopcaisse/stock.ts
src/server/services/shopcaisse/movements.ts
src/server/services/shopcaisse/mapper.ts
src/server/services/shopcaisse/errors.ts
src/app/api/admin/shopcaisse/sync/route.ts
```

## Tâches
1. Garder les endpoints configurables par variables.
2. Prévoir un mode `not_configured` propre.
3. Vérifier stock avant checkout si endpoint disponible.
4. Envoyer mouvement stock après paiement confirmé si endpoint disponible.
5. Stocker les erreurs dans `IntegrationEvent`.
6. Ajouter une relance manuelle depuis admin.

## Critères de validation
- Le site fonctionne sans Shopcaisse configuré.
- Si Shopcaisse est configuré, le stock peut être vérifié avant Stripe.
- Si le mouvement échoue, la commande reste payée avec statut sync `failed` ou `pending`.

---

# Milestone M8 — Blog et SEO

## Objectif
Avoir un socle SEO propre pour le MVP.

## Routes
```txt
/blog
/blog/[slug]
/categorie/[slug]
/mentions-legales
/cgv
/livraison-retours
/politique-confidentialite
```

## Tâches
1. Finaliser la page blog.
2. Finaliser la page article.
3. Ajouter metadata dynamiques.
4. Ajouter sitemap.
5. Ajouter robots.txt.
6. Ajouter JSON-LD LocalBusiness.
7. Vérifier JSON-LD Product.
8. Ajouter Open Graph par page importante.

## Critères de validation
- Les pages publiques ont un title et une description.
- Le sitemap contient produits, catégories, blog et pages statiques.
- Le JSON-LD Product est valide.

---

# Milestone M9 — Import/optimisation création produits

## Objectif
Réduire le temps de création des nombreuses petites références.

## Tâches
1. Préparer un import CSV produits.
2. Mapper SKU, barcode, externalStockId.
3. Importer prix, stock, catégorie, shippingClass.
4. Ajouter génération IA en brouillon pour description courte, description longue, SEO title, SEO description, alt image.
5. Forcer validation humaine avant publication.

## Critères de validation
- Un CSV peut créer ou mettre à jour des produits.
- L’IA ne publie jamais automatiquement.
- Les produits restent liés à Shopcaisse via SKU/barcode/externalStockId.

---

# Milestone M10 — Préproduction Vercel

## Objectif
Déployer un MVP testable en ligne.

## Tâches
1. Configurer les variables Vercel.
2. Choisir et configurer la base production.
3. Configurer Stripe en mode test sur URL Vercel.
4. Configurer webhook Stripe vers Vercel.
5. Configurer Resend.
6. Tester une commande complète.
7. Vérifier mobile.
8. Vérifier SEO de base.

## Critères de validation
- Le site est accessible en preview Vercel.
- Un paiement test complet fonctionne en ligne.
- Le webhook Vercel fonctionne.
- Les emails sont reçus.

---

# Milestone M11 — Recette MVP

## Objectif
Valider le parcours complet avant production.

## Scénarios à tester
1. Produit disponible + retrait boutique.
2. Produit disponible + Colissimo domicile.
3. Produit `PICKUP_ONLY` + tentative livraison.
4. Stock insuffisant.
5. Paiement annulé.
6. Paiement réussi.
7. Webhook rejoué.
8. Email client.
9. Email boutique.
10. Commande visible admin.
11. Statut commande modifiable.
12. Blog publié.
13. Sitemap accessible.

## Critères de validation
- Tous les scénarios critiques passent.
- Aucun paiement ne crée une commande payée sans webhook.
- Aucun stock n’est décrémenté deux fois.

---

# Milestone M12 — Passage production

## Objectif
Ouvrir le site en conditions réelles.

## Tâches
1. Passer Stripe en clés live.
2. Configurer webhook live.
3. Configurer domaine.
4. Configurer emails réels.
5. Vérifier CGV/livraison/retours/confidentialité.
6. Tester une commande réelle faible montant.
7. Vérifier remboursement Stripe.
8. Mettre monitoring minimal.
9. Sauvegarder la base.

## Critères de validation
- Une commande réelle fonctionne.
- La boutique reçoit la notification.
- Le client reçoit la confirmation.
- La commande est visible dans l’admin.
- Le stock est cohérent.

---

# Priorité d’exécution recommandée

```txt
M0 — Stabilisation repo
M1 — .env.example + configuration
M2 — Stripe réel test + webhook CLI
M3 — Emails client + boutique
M4 — UX panier/success/cancel
M5 — Admin MVP
M6 — Livraison MVP
M7 — Shopcaisse préparé
M8 — Blog + SEO
M9 — Import produits + IA brouillon
M10 — Préproduction Vercel
M11 — Recette MVP
M12 — Production
```

# Prompt Codex recommandé

```md
Tu travailles dans le repo Art Home Déco.

Lis d’abord :
- AGENTS.md
- Plan.md
- Plan-Execution-MVP.md
- docs/architecture.md
- docs/data-models.md
- docs/business-rules.md
- docs/shopcaisse-api.md

Objectif : exécuter le milestone courant sans repartir de zéro.

Contraintes :
- Conserver l’architecture existante.
- Utiliser TypeScript strict.
- Ne jamais exposer de secrets.
- Ne jamais inventer d’endpoints Shopcaisse.
- Le frontend ne décide jamais du prix final.
- Stripe webhook reste source de vérité paiement.
- Stock décrémenté uniquement après paiement confirmé.
- Ajouter ou modifier uniquement les fichiers nécessaires.

Avant de coder :
1. Auditer les fichiers existants concernés par le milestone.
2. Lister les fichiers à modifier.
3. Exécuter l’implémentation.
4. Lancer lint/build si possible.
5. Répondre avec :
   - Résumé
   - Fichiers modifiés
   - Tests effectués
   - Points de vigilance
   - Prochaine étape recommandée
```
