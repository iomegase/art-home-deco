# Design — Sécurisation de l'import Shopcaisse par sélection

Date : 2026-07-14
Statut : validé

## Objectif

Garantir que lorsqu'un administrateur coche une ou plusieurs lignes dans la
prévisualisation Shopcaisse, seules ces lignes peuvent être importées après
confirmation.

## Incident confirmé

Le 14 juillet 2026, une ligne nommée `david` était cochée, mais le mode
d'import est resté sur `families`. La requête a donc transmis zéro identifiant
sélectionné et une famille complète. Le journal de production confirme la
création de 82 produits.

La recherche et les cases à cocher filtrent ou sélectionnent la
prévisualisation, mais ne modifient actuellement pas le mode d'import choisi à
l'étape précédente. Cette séparation rend l'écran trompeur.

## Approches examinées

### 1. Bascule automatique vers le mode sélectionné — retenue

Dès qu'une ligne est cochée, le mode devient `selected`. Le résumé affiche le
nombre exact d'identifiants qui seront envoyés. Cette approche correspond à
l'intention explicite créée par la case à cocher et évite une action
supplémentaire.

### 2. Avertissement sans changement de mode — écartée

Afficher un avertissement lorsque la sélection locale et le mode diffèrent
laisserait encore à l'administrateur la responsabilité de corriger une
configuration interne peu visible.

### 3. Supprimer tous les modes globaux — écartée

Forcer toutes les importations à passer par des cases à cocher serait sûr mais
supprimerait les imports par famille et en stock, qui restent utiles pour les
lots volontaires.

## Comportement retenu

- Cocher une ligne ajoute son identifiant et bascule immédiatement le mode sur
  `selected`.
- Décocher la dernière ligne laisse le mode `selected`, mais empêche de passer
  la confirmation tant qu'aucune nouvelle ligne n'est cochée ou qu'un autre
  mode n'est explicitement choisi.
- Le bouton de passage à la confirmation est désactivé lorsque le mode
  `selected` ne contient aucun identifiant.
- Le résumé de confirmation affiche clairement `N produit(s) sélectionné(s)`.
- Le bouton final indique le même nombre et l'API reçoit exactement ces
  identifiants.
- Choisir ensuite explicitement `families`, `all` ou `in_stock_only` reste
  possible et constitue une intention volontaire d'import global.

## Défense côté serveur

Le schéma API exige déjà au moins un identifiant en mode `selected`. Il reste
inchangé. Le correctif porte sur la dérivation du mode côté interface et sur la
confirmation du périmètre ; le backend continue à filtrer par
`shopcaisseProductIds` lorsque le mode reçu vaut `selected`.

## Architecture et tests

La décision de mode est extraite dans une fonction pure du domaine produit :

- entrée : identifiants sélectionnés et identifiant cliqué ;
- sortie : nouvelle sélection et mode effectif ;
- règle principale : une sélection non vide implique `selected`.

Les tests couvrent :

- cocher une ligne depuis le mode `families` bascule vers `selected` ;
- ajouter puis retirer des identifiants conserve une sélection exacte ;
- le périmètre de confirmation en mode `selected` correspond au nombre réel
  d'identifiants ;
- une sélection vide bloque la confirmation dans ce mode.

## Hors périmètre

- Modification ou suppression du produit `david` actuellement présent.
- Suppression du cache Shopcaisse.
- Changement du fonctionnement volontaire des imports par famille, de tout le
  cache ou des produits en stock.
