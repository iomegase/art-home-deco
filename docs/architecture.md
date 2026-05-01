# Architecture technique

## Structure recommandée
```txt
app/(public)/
app/admin/
app/api/
components/
features/
lib/
server/
models/ ou prisma/
schemas/
services/
emails/
types/
```

## Domaines
```txt
features/product
features/cart
features/order
features/shipping
features/payment
features/blog
features/admin
features/ai
features/shopcaisse
```

## Services
```txt
services/stripe
services/email
services/storage
services/ai
services/shipping
services/shopcaisse
services/stock-provider
```

## Flux commande
```txt
Panier → recalcul serveur → vérif stock local → vérif Shopcaisse → Stripe Checkout → webhook confirmé → commande → décrément local → mouvement Shopcaisse si possible → emails
```
