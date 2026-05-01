# Règles métier

## Produits
- Produit actif requis pour achat.
- Produit archivé non achetable.
- Produit `pickupOnly` non expédiable.
- SKU obligatoire.
- `barcode` ou `externalStockId` recommandé pour Shopcaisse.

## Prix
- Prix en centimes.
- Recalcul serveur obligatoire.
- Le frontend ne décide jamais du prix.

## Stock
- Shopcaisse est la source de référence si activé.
- Cache local côté site.
- Vérification stock avant paiement.
- Décrément uniquement après webhook Stripe confirmé.
- Si sync Shopcaisse échoue, garder la commande avec statut `pending` ou `failed`.

## Livraison
Retrait gratuit. Colissimo par classes. Produit `PICKUP_ONLY` bloque la livraison.
