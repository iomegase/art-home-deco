# Design — Nettoyage des produits archivés et cohérence des images manquantes

Date : 2026-07-13
Statut : validé

## Objectif

Rendre le catalogue réellement vide après la suppression générale demandée et
éviter que `/admin/products/missing-images` affiche des produits que la liste
principale masque parce qu'ils sont archivés.

## Diagnostic validé

- La base de production contient encore 12 produits, tous au statut `archived`.
- Dix de ces produits n'ont aucune image et sont donc retournés par la requête
  de la page « Images manquantes ».
- La liste principale exclut déjà `archived`, tandis que la requête des images
  manquantes n'applique pas cette règle.
- L'action de suppression définitive ne revalide pas explicitement la route
  `/admin/products/missing-images`.

## Solution retenue

1. Ajouter à la requête `listProductsMissingImages` la contrainte
   `status: { not: "archived" }`, en complément des filtres demandés par
   l'administrateur.
2. Revalider `/admin/products/missing-images` après une suppression définitive
   groupée.
3. Supprimer définitivement les 12 lignes `Product` archivées actuellement
   présentes dans la base de production, après avoir contrôlé que la sélection
   correspond toujours exactement à ce périmètre.

Le cache Shopcaisse est conservé : il n'alimente pas directement cette page et
reste utile à l'intégration. Une future importation Shopcaisse pourra recréer
des produits si elle est déclenchée ; ce comportement reste hors périmètre.

## Sécurité et ordre des opérations

- Écrire et exécuter un test de régression avant la modification de production.
- Appliquer la correction de requête et l'invalidation ciblée.
- Exécuter les tests, le lint, le typecheck et le build.
- Avant la suppression, relire en base le nombre et le statut des produits.
- N'effacer que les identifiants encore au statut `archived` ; aucune ligne du
  cache Shopcaisse n'est supprimée.
- Contrôler ensuite que `Product.count()` et le nombre de produits sans image
  valent zéro.

## Tests

- Test unitaire de la construction du filtre « Images manquantes » : le statut
  `archived` est toujours exclu, avec ou sans filtre de statut explicite.
- Test structurel de l'action : la route des images manquantes est revalidée
  après suppression.
- Vérifications globales : tests Node existants, ESLint, TypeScript et build
  Next.js.

## Hors périmètre

- Suppression du cache Shopcaisse.
- Désactivation de l'import ou de la synchronisation Shopcaisse.
- Modification des règles de publication du catalogue public.
