# EasyShop API — Integration stock

## Objectif
EasyShop / ShopCaisse reste la source de reference du stock. Le site conserve un cache local Prisma pour l'affichage rapide et le checkout.

## Variables
```env
SHOPCAISSE_API_URL=https://api.shop-caisse.com
SHOPCAISSE_API_KEY=
SHOPCAISSE_STORE_ID=
SHOPCAISSE_API_TIMEOUT_MS=10000
SHOPCAISSE_WEBHOOK_SECRET=
SHOPCAISSE_WEBHOOK_SIGNATURE_HEADER=x-server-authorization-hmac-sha256
```

## Modele d'integration
- Sortant: le site appelle l'API EasyShop avec `Authorization: Bearer <token>`.
- Entrant: EasyShop appelle notre webhook officiel en `POST`.
- Le webhook est signe HMAC via le header `x-server-authorization-hmac-sha256`.
- Le webhook Stripe reste la source de verite pour le paiement confirme.

## Webhook attendu
```json
{
  "event": "company.items",
  "resource": {
    "id": "bd5c91b3-8da8-47c5-aa2d-1ff4cac7c05a",
    "type": "company"
  },
  "content": []
}
```

## Route webhook site
```txt
POST /api/shopcaisse/webhook
```

## Règles critiques
- Ne jamais inventer un endpoint sortant EasyShop non documente.
- Verifier la signature HMAC sur le body brut.
- Logger les evenements recus, refuses, ignores et appliques.
- Assurer une idempotence minimale sur l'empreinte du payload webhook.
- Ne jamais decremeter deux fois le stock commande.
- Le stock commande reste decremente uniquement apres webhook Stripe confirme.
