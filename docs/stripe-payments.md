# Paiement Stripe

## Flux
```txt
Checkout → recalcul serveur → vérif stock → session Stripe → webhook confirmé → commande payée → stock décrémenté → sync Shopcaisse si possible
```

## Variables
```env
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_SITE_URL=
```

## Règles
- Vérifier signature webhook.
- Webhook idempotent.
- Ne jamais décrémenter le stock hors paiement confirmé.
