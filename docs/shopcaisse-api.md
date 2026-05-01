# Shopcaisse API — Intégration stock

## Objectif
Shopcaisse est la source de référence du stock. Le site conserve un cache local pour l’affichage rapide.

## Variables
```env
SHOPCAISSE_API_BASE_URL=
SHOPCAISSE_API_KEY=
SHOPCAISSE_STORE_ID=
SHOPCAISSE_API_TIMEOUT_MS=
```

## Service recommandé
```txt
services/shopcaisse/client.ts
services/shopcaisse/products.ts
services/shopcaisse/stock.ts
services/shopcaisse/movements.ts
services/shopcaisse/mapper.ts
services/shopcaisse/errors.ts
```

## Fonctions attendues
```ts
syncShopcaisseProducts()
syncShopcaisseStock()
verifyShopcaisseStockBeforeCheckout()
pushShopcaisseStockMovement()
```

## Règles critiques
- Ne jamais inventer les endpoints.
- Ne jamais décrémenter deux fois.
- Webhook Stripe idempotent.
- Prévoir relance manuelle si échec sync.
