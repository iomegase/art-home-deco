# Design — Pagination client du catalogue produits admin

Date : 2026-07-13
Statut : validé (design), en attente de relecture de la spécification

## Objectif

Limiter le tableau de `/admin/products` à 30 produits visibles par page, tout
en conservant la recherche globale et la sélection multiple type Gmail déjà
présentes. La solution doit rester fluide pour environ 500 produits.

## Décisions validées

- Pagination côté client, sans nouvelle requête serveur lors d'un changement de
  page.
- Taille fixe de 30 produits par page.
- La recherche s'applique à l'ensemble des produits chargés, avant pagination.
- Une modification de la recherche ramène à la page 1.
- La checkbox globale sélectionne uniquement les produits visibles sur la page
  courante, soit au maximum 30 produits.
- Les produits déjà cochés restent sélectionnés lors d'un changement de page ou
  de recherche.
- Le compteur de sélection reste global et inclut les sélections des autres
  pages.
- Après une suppression ou une modification du nombre de résultats, la page
  courante est ramenée vers la dernière page existante si nécessaire.

## Architecture

La page serveur continue de charger la liste admin complète avec
`listAdminProducts()`. Pour 500 produits, ce volume reste raisonnable et
permet une recherche instantanée sans aller-retour réseau.

Dans `ProductsTable`, le flux devient :

```text
products → recherche → filteredProducts → pagination → visibleProducts
```

Les helpers de sélection reçoivent les identifiants de `visibleProducts`, et
non plus tous ceux de `filteredProducts`. Ainsi, l'état coché ou indéterminé
de la case d'en-tête reflète exclusivement la page courante.

## Calcul de pagination

Une logique pure et testable expose :

- `getPaginationState(totalItems, requestedPage, pageSize)` ;
- `totalPages` vaut au minimum 1, même sans résultat ;
- `currentPage` est bornée entre 1 et `totalPages` ;
- `startIndex = (currentPage - 1) * pageSize` ;
- `endIndex = min(startIndex + pageSize, totalItems)` ;
- `visibleProducts = filtered.slice(startIndex, endIndex)`.

La taille de page est une constante `ADMIN_PRODUCTS_PAGE_SIZE = 30`.

## Interface

Sous le tableau, une barre de pagination affiche :

- « 1–30 sur 271 produits » ou la plage correspondant aux résultats filtrés ;
- un bouton « Précédent » ;
- les numéros de pages ;
- un bouton « Suivant ».

Les boutons précédent/suivant sont désactivés aux limites. La page active porte
`aria-current="page"`. Tous les contrôles sont des boutons natifs avec des
libellés accessibles.

Pour éviter une rangée trop longue si le catalogue grandit, les numéros
affichés se limitent à la première page, la dernière page, la page courante et
ses voisines immédiates, avec des ellipses non interactives entre les groupes.
Pour 500 produits à 30 par page, cela représente 17 pages.

L'index visuel de la colonne « # » reste global : la première ligne de la page
2 porte le numéro 31, et non 1.

## Recherche et changement de page

- Saisir une recherche appelle explicitement `setCurrentPage(1)`.
- Changer de page conserve la recherche et la sélection.
- Changer de page replace le début du tableau dans le viewport si nécessaire,
  sans perturber le focus clavier.
- Si une suppression réduit le nombre total de pages, le rendu utilise
  immédiatement la page bornée calculée. L'état est ensuite aligné sur cette
  page valide afin que les contrôles restent cohérents.

## Sélection

- La checkbox d'en-tête utilise uniquement les ids de `visibleProducts`.
- « Tout sélectionner » ajoute les 30 ids courants au `Set` global.
- « Tout désélectionner » dans l'en-tête retire uniquement les ids de la page
  courante.
- Le bouton général « Tout désélectionner » vide toujours toute la sélection,
  toutes pages confondues.
- La barre de suppression transmet tous les produits sélectionnés, y compris
  ceux cochés sur d'autres pages.

## Tests

Tests unitaires `node:test` sur la logique pure :

- 271 éléments et une taille de 30 donnent 10 pages ;
- page 1 produit la plage 0–30 ;
- page 10 produit la plage 270–271 ;
- une page demandée trop grande est bornée à la dernière page ;
- zéro résultat donne une page logique et une plage vide ;
- génération des numéros compacts avec ellipses ;
- la sélection globale continue de ne modifier que la liste d'ids fournie, ici
  les ids de la page courante.

Vérifications complémentaires :

- lint et typecheck ;
- build production ;
- rendu local : exactement 31 checkboxes sur une page pleine (30 lignes +
  en-tête) ;
- recherche ramenant à la page 1 ;
- navigation, états disabled et `aria-current` ;
- conservation de la sélection entre deux pages ;
- aucune suppression réelle pendant la vérification.

## Fichiers prévus

- `src/features/product/admin-product-pagination.ts` (nouveau)
- `src/features/product/admin-product-pagination.test.ts` (nouveau)
- `src/app/admin/(protected)/products/products-table.tsx` (modifié)

Aucune migration Prisma et aucune modification du repository produit.

## Hors périmètre

- Pagination serveur.
- Choix dynamique du nombre de lignes par page.
- Persistance de la page dans l'URL.
- Sélection automatique de toutes les pages.
- Virtualisation du tableau.

## Points de vigilance

- Le nombre affiché près de la recherche reste le nombre total de résultats
  filtrés, pas le nombre de lignes de la page.
- Les sélections hors page ne doivent pas influencer l'état de la checkbox
  globale de la page courante.
- Les modifications locales préexistantes sans rapport restent exclues des
  commits.
