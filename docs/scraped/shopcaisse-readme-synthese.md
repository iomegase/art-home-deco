# Shopcaisse ReadMe v1 - Synthese

Source: https://easyshop-v1.readme.io/reference/introduction
Generation: 2026-05-05T09:54:14.313Z

## Chiffres cles
- Pages reference detectees: 105
- Endpoints detectes (methode explicite): 66
- Repartition methodes: POST=11, DELETE=6, PUT=9, GET=40

## Domaines fonctionnels couverts
- Authentification et permissions (tokens JWT, access levels, app permissions).
- Applications (creation, rotation token, suppression, logo, detail).
- Ressources coeur (organisations, companies, stores, POS).
- Catalogue (items, familles, boards, menus, modificateurs).
- Prix (price lists, prix par item, TVA).
- Clients et fidelite.
- Commandes POS et commandes externes (creation, verification, paiement, annulation, statuts).
- Ventes, shifts caisse, plan de salle, stocks.
- Webhooks de notifications.

## Endpoints e-commerce prioritaires (MVP)
- Items: liste/lecture/mise a jour d'article, familles, prix, TVA.
- Stocks: lecture du stock magasin.
- Orders external: verification panier, creation commande, commande avec paiement, statuts.
- Customers: CRUD client + fidelite (si besoin).
- Stores opening hours / order slots pour click & collect.

## Limites du scraping
- Cette extraction s'appuie sur la navigation ReadMe publique et les labels des pages.
- Certains chemins exacts peuvent etre affiches dans le corps de page et non dans le titre/navigation.
- Pour une integration stricte, valider chaque endpoint cible avec schema request/response et permissions requises.

## Fichiers generes
- `docs/scraped/shopcaisse-readme-pages.json`
- `docs/scraped/shopcaisse-readme-pages.csv`
- `docs/scraped/shopcaisse-readme-synthese.md`