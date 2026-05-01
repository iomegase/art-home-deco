# AGENTS.md — Instructions Codex

## Rôle
Tu es un agent senior chargé de construire un site e-commerce scalable pour une boutique de décoration.

## À lire avant toute tâche
1. `Plan.md`
2. `docs/architecture.md`
3. `docs/data-models.md`
4. `docs/business-rules.md`
5. `docs/shopcaisse-api.md`
6. le fichier de phase concerné dans `/plans`

## Stack cible
Next.js App Router, TypeScript, Tailwind CSS, Zod, Stripe Checkout, webhooks Stripe, base de données, auth admin, stockage images, emails, Shopcaisse, Colissimo, IA.

## Règles générales
- Utiliser TypeScript.
- Séparer UI, logique métier, validation et accès données.
- Valider les formulaires/API avec Zod.
- Ne jamais exposer de secrets.
- Ne jamais inventer d’endpoints Shopcaisse ou Colissimo.
- Protéger toutes les routes admin.

## Règles e-commerce
- Le frontend ne décide jamais du prix final.
- Les prix sont stockés en centimes.
- Le serveur recalcule le panier avant paiement.
- Le webhook Stripe est la source de vérité.
- Le stock est décrémenté uniquement après paiement confirmé.

## Règles Shopcaisse
- Shopcaisse est la source de référence du stock si l’API est disponible.
- Le site garde un cache local pour performance.
- Mapper les produits via `externalStockId`, `sku` ou `barcode`.
- Revérifier le stock avant Stripe si possible.
- Après paiement confirmé, envoyer un mouvement de stock vers Shopcaisse si l’endpoint existe.
- Ne jamais décrémenter deux fois le stock.
- Si Shopcaisse est indisponible, conserver la commande avec `shopcaisseSyncStatus = pending` ou `failed`.

## Règles livraison
- Retrait boutique gratuit.
- Colissimo par classes logistiques au MVP.
- Certains produits peuvent être `pickupOnly`.

## Format de réponse Codex attendu
```md
## Résumé
## Fichiers modifiés
## Tests effectués
## Points de vigilance
## Prochaine étape recommandée
```
