# Customer Tracking and Admin Clients Design

## Goal
Ajouter un suivi client simple via lien privé envoyé par email, créer un onglet admin `Clients` exploitable pour le SAV/litiges, et préparer le workflow Colissimo avec étiquette prête à imprimer sans impression automatique.

## Scope
Inclus :
- entité `Customer` persistée en base
- rattachement des commandes à un client
- lien privé de suivi invité par token
- page client de suivi de commande
- nouvel onglet admin `Clients`
- page détail client avec historique précis des commandes
- nouveaux statuts liés à validation/étiquette/expédition
- bouton admin `Imprimer l’étiquette`
- email après paiement confirmé avec lien de suivi
- message de confirmation côté site indiquant qu’un email a été envoyé

Exclus :
- authentification client
- espace “Mon compte” complet
- impression automatique de l’étiquette
- intégration Colissimo complète tant que l’API n’est pas branchée

## Recommended Approach
Approche retenue : créer dès maintenant une vraie entité `Customer`, tout en gardant un parcours client sans compte via un lien privé envoyé par email.

Raisons :
- répond au besoin immédiat de suivi et SAV
- évite de reconstruire les clients depuis les seules commandes à chaque requête
- prépare proprement une future auth client
- reste beaucoup plus simple qu’un vrai compte utilisateur dès maintenant

## User Flows
### 1. Paiement confirmé
1. Stripe webhook confirme le paiement
2. la commande passe en `paid`
3. un `Customer` est créé ou réutilisé via l’email
4. la commande est rattachée à ce `Customer`
5. un token de suivi privé est créé
6. un email client est envoyé avec :
   - confirmation de paiement
   - numéro de commande
   - lien privé de suivi
7. la page succès affiche :
   - paiement validé
   - email de confirmation envoyé

### 2. Suivi client invité
1. le client clique le lien reçu par email
2. il arrive sur une page de suivi dédiée
3. il voit :
   - numéro de commande
   - statut commande
   - statut livraison
   - articles
   - total
   - adresse de livraison
   - numéro de suivi si disponible
   - message contextuel selon le statut

### 3. Traitement admin
1. l’admin voit la commande payée
2. il la passe en `validated` quand elle est préparée et acceptée
3. quand l’étiquette est générée, la commande passe en `label_ready`
4. l’admin peut cliquer `Imprimer l’étiquette`
5. une fois le colis réellement remis au transporteur, la commande passe en `shipped`
6. le client voit l’évolution du statut sur son lien privé

## Status Model
## Internal order statuses
- `pending` : commande créée mais non payée
- `paid` : paiement Stripe confirmé
- `validated` : commande acceptée et prête en préparation logistique
- `label_ready` : étiquette générée et prête à imprimer
- `shipped` : colis remis au transporteur
- `delivered` : livré
- `cancelled` : annulé

## Client-facing statuses
- `En attente`
- `Paiement confirmé`
- `Commande validée`
- `Étiquette prête`
- `Expédiée`
- `Livrée`
- `Annulée`

## Important rule
`label_ready` ne doit pas être assimilé à `shipped`.
La commande n’est `expédiée` que lorsque le colis est effectivement remis au transporteur.

## Data Model Changes
### Customer
Créer une entité `Customer` persistée :
- `id`
- `email` unique
- `firstName`
- `lastName`
- `phone`
- `createdAt`
- `updatedAt`

Rôle :
- servir de base stable pour l’admin `Clients`
- préparer une future auth client

### Order
Ajouter ou structurer sur `Order` :
- `customerId`
- `shippingStatus` ou réutiliser `orderStatus` avec les nouveaux états retenus
- `trackingToken` unique
- `trackingTokenExpiresAt` optionnel si on veut une expiration plus tard
- `shippingAddressLine1`
- `shippingAddressLine2`
- `shippingPostalCode`
- `shippingCity`
- `shippingCountry`
- `carrier`
- `labelUrl`
- `labelGeneratedAt`
- `shippedAt`
- `deliveredAt`

### Why keep address snapshot on Order
L’adresse doit rester figée sur la commande pour les litiges et la conformité historique, même si les infos client évoluent plus tard.

## Routes and Pages
### Client-facing
- `/commande/suivi/[token]`
  - page invitée, sans login
  - cherche la commande par `trackingToken`
  - affiche un état lisible et le détail complet utile au client

### Admin
- `/admin/clients`
  - liste clients
  - colonnes : nom, prénom, email, téléphone, nb de commandes, total cumulé, dernière commande
- `/admin/clients/[id]`
  - détail client
  - coordonnées
  - historique précis des commandes
  - lignes de commande
  - montants
  - statuts
  - tracking

### Existing admin orders
- conserver `/admin/orders`
- enrichir le détail commande avec :
  - bouton `Imprimer l’étiquette`
  - lien suivi client
  - statut logistique plus explicite

## Email Design
### After payment confirmed
Email envoyé après webhook Stripe confirmé, avec :
- message de confirmation
- numéro de commande
- résumé simple
- lien privé de suivi

### On success page
Le message côté site doit être explicite :
- `Votre paiement a été validé. Un email de confirmation vous a été envoyé.`

### Later emails
Prévoir ensuite, mais pas nécessairement dans la première implémentation complète :
- email `commande validée`
- email `étiquette prête` seulement si utile métier
- email `commande expédiée`

## Colissimo Preparation
### Phase now
Sans impression automatique :
- stocker `labelUrl` ou ressource équivalente
- afficher un bouton admin `Imprimer l’étiquette`
- ce bouton ouvre ou télécharge le PDF d’étiquette

### Phase later
Quand l’API Colissimo sera branchée :
- génération automatique de l’étiquette à partir d’une commande `validated`
- mise à jour de `labelUrl`, `labelGeneratedAt`
- passage à `label_ready`

## Security
### Tracking token
Le lien client doit utiliser un token opaque, non prédictible.
Exigences :
- longueur suffisante
- généré côté serveur
- unique par commande
- non dérivé directement de l’id ou du numéro de commande

### Customer privacy
La page `/commande/suivi/[token]` ne doit exposer que les données nécessaires à cette commande, jamais l’historique global du client.

## Admin Clients Behavior
### Client identity
Le client admin est identifié principalement par l’email.
Lorsqu’une nouvelle commande arrive :
- si email existant : rattacher au `Customer` existant
- sinon : créer un nouveau `Customer`

### Litige/SAV value
Le détail client doit permettre de voir rapidement :
- fréquence d’achat
- montants cumulés
- commandes passées
- articles commandés
- statut de chaque commande
- tracking éventuel
- adresse utilisée pour chaque commande

## Error Handling
- token invalide : page client 404 ou message neutre `Commande introuvable`
- token valide mais commande annulée : statut explicite
- étiquette absente : bouton admin désactivé ou message `Étiquette non disponible`
- email non envoyé : ne jamais bloquer la confirmation de paiement, mais logger l’erreur

## Testing Strategy
### Technical
- migration Prisma `Customer` + champs `Order`
- génération du token de suivi
- rattachement `Customer` sur webhook Stripe
- rendering `/commande/suivi/[token]`
- agrégation admin `Clients`

### Functional
- paiement Stripe confirmé -> email envoyé -> lien suivi utilisable
- page succès affiche le message email envoyé
- un même client avec plusieurs commandes apparaît une seule fois dans `/admin/clients`
- détail client montre l’historique complet
- bouton `Imprimer l’étiquette` visible seulement si `labelUrl` existe

## Success Criteria
Le chantier est terminé si :
- chaque commande payée est rattachée à un `Customer`
- un lien privé de suivi est disponible et envoyé par email
- le client voit l’état de sa commande sans compte
- l’admin dispose d’un onglet `Clients` exploitable pour le SAV
- les statuts `validated`, `label_ready`, `shipped` sont distincts
- l’interface admin peut ouvrir/imprimer une étiquette dès qu’elle existe
