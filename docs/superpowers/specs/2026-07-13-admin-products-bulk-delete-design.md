# Design — Sélection et suppression groupée des produits admin

Date : 2026-07-13
Statut : validé (design), en attente de relecture de la spécification

## Objectif

Permettre à l'administrateur de sélectionner un ou plusieurs produits dans
`/admin/products`, puis de les supprimer définitivement en une seule action,
avec une interaction inspirée de Gmail. Le catalogue contient actuellement
environ 271 produits et reste chargé en une seule liste, sans pagination.

## Décisions validées

- Chaque ligne du tableau reçoit une case à cocher.
- La case de l'en-tête sélectionne ou désélectionne tous les produits
  actuellement affichés.
- Quand une recherche est active, « tout sélectionner » ne concerne que les
  résultats filtrés.
- Les produits sélectionnés hors du filtre courant restent sélectionnés. Le
  compteur indique toujours le nombre total réellement sélectionné.
- L'administrateur peut supprimer un seul produit ou toute sélection en une
  action groupée.
- La suppression est définitive et nécessite une confirmation explicite.
- Les commandes existantes restent intactes. Grâce à la relation Prisma
  `OrderItem.product` en `onDelete: SetNull`, leur libellé, SKU, quantité et prix
  historique sont conservés tandis que la référence au produit devient nulle.
- Un produit Shopcaisse supprimé localement peut être recréé par une future
  synchronisation si Shopcaisse le fournit encore. Cet avertissement apparaît
  dans la confirmation lorsqu'une sélection contient un produit Shopcaisse.

## Approche retenue

La sélection est gérée dans le composant client existant
`products-table.tsx`, tandis que la mutation destructive est assurée par une
Server Action protégée, validée et déléguée au repository produit.

Alternatives écartées :

- Soumettre 271 suppressions unitaires : trop lent et susceptible de produire
  un état partiellement supprimé.
- Ajouter une action « vider le catalogue » indépendante de la sélection :
  trop risqué et incompatible avec le besoin de contrôle ligne par ligne.
- Envoyer le texte de recherche au serveur pour supprimer ce qui correspond :
  la requête pourrait ne plus représenter exactement ce que l'administrateur
  avait vu et sélectionné.

## Interface et comportement de sélection

`ProductsTable` conserve un `Set<string>` d'identifiants sélectionnés.

- La checkbox d'une ligne ajoute ou retire son identifiant.
- La checkbox d'en-tête est cochée lorsque tous les produits filtrés sont
  sélectionnés, décochée lorsqu'aucun ne l'est, et visuellement indéterminée
  lorsqu'une partie seulement l'est.
- Cliquer sur la checkbox d'en-tête cochée retire de la sélection tous les
  résultats actuellement affichés, sans toucher aux sélections hors filtre.
- Cliquer sur la checkbox d'en-tête non cochée ajoute tous les résultats
  affichés à la sélection.
- Un changement de recherche ne réinitialise pas la sélection.
- Si la liste de produits reçue après revalidation ne contient plus certains
  identifiants, ceux-ci sont retirés de la sélection.

Dès qu'au moins un produit est coché, une barre d'actions affiche :

- « N produit(s) sélectionné(s) » ;
- « Tout désélectionner » ;
- « Supprimer définitivement ».

Le bouton ouvre une modale de confirmation. Elle rappelle le nombre de
produits, le caractère irréversible de l'action, la conservation de
l'historique des commandes et, si nécessaire, le risque de réapparition via
Shopcaisse. Le bouton de confirmation est désactivé pendant la mutation afin
d'éviter les doubles soumissions.

En cas de succès, la sélection est vidée et `router.refresh()` recharge la
liste. En cas d'échec, la modale reste exploitable, les lignes restent
sélectionnées et un message d'erreur compréhensible est affiché.

## Flux serveur et sécurité

Une nouvelle action `deleteProductsPermanentlyForAdminAction` :

1. appelle `requireAdmin()` avant toute lecture ou mutation ;
2. extrait tous les champs `ids` du `FormData` ;
3. valide avec Zod un tableau de chaînes non vides, dédupliqué, contenant au
   moins un identifiant et au maximum le nombre raisonnable de produits du
   catalogue (limite fixée à 1 000) ;
4. charge les produits correspondants et leurs clés d'images stockées ;
5. supprime les objets d'images R2 gérés par l'application, par lots S3 ; les
   images externes sans `storageKey` ne nécessitent aucune suppression ;
6. supprime tous les produits correspondants avec une opération Prisma
   `deleteMany` ; les images et associations de catégories sont supprimées en
   cascade, les caches Shopcaisse et lignes de commande sont détachés par
   `SetNull` ;
7. revalide les pages admin et publiques concernées ;
8. retourne le nombre effectivement supprimé au client.

Si un identifiant n'existe plus entre l'affichage et la confirmation, il est
ignoré et le résultat reflète le nombre réellement supprimé. Si aucune ligne
ne correspond, l'action retourne une erreur fonctionnelle. Une erreur R2
interrompt la suppression en base afin de ne pas créer volontairement
d'objets de stockage orphelins.

## Unités de code

- `products-table.tsx` : état de sélection, cases à cocher, barre d'action et
  branchement de la modale.
- `bulk-delete-products-dialog.tsx` : confirmation, état en cours et erreur.
- `product-bulk-delete.schema.ts` : validation/déduplication des identifiants.
- `features/product/actions.ts` : contrôle admin, orchestration et
  revalidation.
- `admin-product.repository.ts` : chargement des produits sélectionnés et
  suppression `deleteMany`.
- Service de stockage produit : suppression groupée des `storageKey` R2.

Chaque unité garde une responsabilité unique : l'UI ne décide jamais quels
produits le serveur est autorisé à supprimer, et le repository ne gère ni
l'authentification ni la présentation des erreurs.

## Tests

Le changement suit le cycle test-first du projet avec `node:test` :

- validation : rejette une liste vide et plus de 1 000 identifiants ; accepte
  et déduplique une sélection valide ;
- logique pure de sélection : sélectionner/désélectionner une ligne,
  sélectionner tous les résultats filtrés, ne pas perdre les sélections hors
  filtre, calculer l'état coché/indéterminé de l'en-tête ;
- repository : transmet une liste dédupliquée à `deleteMany` et renvoie le
  nombre supprimé ;
- action/service : ne supprime rien sans session admin valide et traite les
  clés R2 avant la suppression en base ;
- régression : typecheck, lint, build et vérification navigateur du tableau,
  de la recherche, de la modale et de l'état après suppression.

La vérification navigateur ne supprimera pas de produits de production. Elle
sera réalisée sur un environnement local avec données de test ou en annulant
la modale avant la confirmation destructive.

## Fichiers prévus

- `src/app/admin/(protected)/products/products-table.tsx`
- `src/app/admin/(protected)/products/bulk-delete-products-dialog.tsx`
- `src/schemas/forms/product-bulk-delete.schema.ts`
- `src/features/product/actions.ts`
- `src/server/repositories/admin-product.repository.ts`
- service de stockage R2 produit existant ou nouveau module ciblé
- tests unitaires correspondants

## Hors périmètre

- Pagination ou chargement progressif du catalogue.
- Suppression automatique dans Shopcaisse.
- Corbeille ou restauration après suppression définitive.
- Suppression des catégories devenues vides.
- Action destructive sans sélection explicite.

## Points de vigilance

- La suppression groupée est irréversible et ne doit jamais être déclenchée
  par la seule case « tout sélectionner ».
- Le nombre de la modale doit provenir de la sélection réelle, pas du nombre
  de résultats de recherche.
- Les mutations restent exclusivement côté serveur et protégées par
  `requireAdmin()`.
- Les modifications déjà présentes dans le worktree, sans rapport avec cette
  fonctionnalité, doivent être conservées et exclues des commits associés.
