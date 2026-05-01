# Plan.md — Site e-commerce scalable

## Vision
Créer un site e-commerce premium pour une boutique de décoration : catalogue, panier, Stripe, retrait boutique, Colissimo, admin, blog SEO, IA, et synchronisation Shopcaisse.

## Pages publiques
```txt
/
/boutique
/boutique/[slug]
/categorie/[slug]
/blog
/blog/[slug]
/contact
/panier
/checkout
/commande/success
/commande/cancel
/mentions-legales
/cgv
/livraison-retours
/politique-confidentialite
```

## Pages admin
```txt
/admin
/admin/products
/admin/products/new
/admin/products/[id]/edit
/admin/categories
/admin/orders
/admin/orders/[id]
/admin/blog
/admin/blog/new
/admin/settings
/admin/settings/shopcaisse
/admin/sync/shopcaisse
```

## Roadmap
### Phase 1 — Fondation
Next.js, TypeScript, Tailwind, DB, auth admin, layouts, `.env.example`.

### Phase 2 — Catalogue
Produits, catégories, images, stock, SKU, barcode, externalStockId, fiches produits.

### Phase 3 — Panier et Stripe
Panier, checkout, revérification stock, Stripe Checkout, webhook, emails.

### Phase 4 — Commandes et livraison
Commandes, statuts, retrait boutique, Colissimo par classes, tracking manuel.

### Phase 5 — Blog, SEO et IA
Blog, metadata, sitemap, robots, JSON-LD, génération IA en brouillon.

### Phase 6 — Intégrations et scale
Shopcaisse avancé, export commandes, préparation API Colissimo, logs, monitoring, performance.
