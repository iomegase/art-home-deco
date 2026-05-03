# R2 Product Multi-Upload Design

## Goal
Ajouter un vrai multi-upload d’images produit via Cloudflare R2, avec gestion admin des visuels, stockage des métadonnées en base, définition d’une image principale, ordre d’affichage et suppression d’images.

## Scope
Inclus :
- upload d’images produit vers Cloudflare R2
- stockage des métadonnées en Prisma via `ProductImage`
- multi-upload sur les écrans admin produit
- aperçu des images
- ordre des images
- image principale basée sur `position = 0`
- suppression logique et suppression distante R2
- validation format/taille/nombre de fichiers

Exclus :
- crop/édition d’image
- drag-and-drop avancé si non nécessaire
- génération automatique de variantes multiples côté stockage
- transformation image avancée type Cloudinary
- migration de tout le catalogue image existant dès la première passe

## Recommended Approach
Approche retenue : utiliser Cloudflare R2 comme stockage objet, garder Prisma comme source de vérité des métadonnées image, et brancher l’upload sur l’admin produit existant.

Raisons :
- coût nettement plus maîtrisé que Cloudinary
- bon fit avec un catalogue de 1400 images WebP
- architecture simple : stockage binaire dans R2, métadonnées dans Prisma
- évite de réintroduire un CMS externe pour un besoin de média produit

## Existing Model Fit
Le modèle `ProductImage` existe déjà avec :
- `id`
- `productId`
- `url`
- `alt`
- `position`

Il faut l’enrichir légèrement pour une vraie gestion R2.

## Data Model Changes
### ProductImage
Ajouter :
- `storageProvider` : `r2`
- `storageKey` : clé objet R2
- `mimeType` optionnel
- `width` optionnel
- `height` optionnel
- `sizeBytes` optionnel
- `createdAt`
- `updatedAt`

### Why keep URL in DB
Le `url` final reste utile pour le rendu simple, mais `storageKey` est indispensable pour :
- suppression propre dans R2
- maintenance future
- éventuel renommage/régénération d’URL publique

## Environment Variables
Variables attendues :
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_BASE_URL`
- optionnellement `R2_REGION=auto`

## Storage Strategy
### Object key convention
Convention recommandée :
- `products/<productId>/<timestamp>-<sanitized-filename>.webp`

Exemple :
- `products/cmon3c55q0003vr3127empsym/1714856023000-vase-face.webp`

### Public URL
Construire l’URL publique à partir de :
- `R2_PUBLIC_BASE_URL`
- + `storageKey`

### Main image
L’image principale reste la plus petite `position`.
Donc :
- `position = 0` = image principale
- les autres suivent l’ordre croissant

## Admin User Flow
### Product new/edit page
Sur `/admin/products/new` et `/admin/products/[id]/edit` :
1. sélectionner 1 à 6 fichiers
2. upload vers R2 via une server action ou route admin sécurisée
3. persister les `ProductImage`
4. afficher les vignettes existantes
5. permettre :
   - modifier le `alt`
   - supprimer une image
   - réordonner les positions
6. refléter immédiatement l’image principale en UI

### Constraints
- formats autorisés : `jpg`, `jpeg`, `png`, `webp`
- taille max par fichier : `5 MB`
- nombre max par produit : `6`

## API / Server Design
### Upload endpoint
Ajouter un endpoint admin ou server action pour :
- valider la session admin
- recevoir des fichiers
- pousser vers R2
- enregistrer `ProductImage`

### Delete endpoint
Ajouter une action admin pour :
- retrouver le `ProductImage`
- supprimer l’objet R2 par `storageKey`
- supprimer l’enregistrement Prisma
- réindexer les `position`

### Reorder endpoint
Ajouter une action admin pour :
- recevoir une liste d’ids ordonnée
- réécrire les `position`

## Security
- upload uniquement côté admin authentifié
- ne jamais exposer les credentials R2 côté client
- toutes les écritures R2 passent par le serveur
- validation stricte du type MIME et de la taille

## Image Rendering
### Public product pages
Les pages produit utilisent `ProductImage.url` comme aujourd’hui.

### Performance
À ce stade, le stockage R2 suffit. L’optimisation image peut reposer sur :
- `next/image`
- et des tailles de rendu cohérentes

Une couche d’optimisation plus riche pourra être ajoutée plus tard si nécessaire.

## Error Handling
- upload invalide : message clair en UI
- échec R2 : ne pas créer de `ProductImage`
- échec DB après upload R2 : supprimer l’objet R2 pour éviter les orphelins
- suppression R2 échouée : ne pas supprimer la ligne DB sans journaliser explicitement

## Testing Strategy
### Technical
- validation des env R2
- upload réussi -> ligne Prisma créée
- suppression réussie -> objet R2 supprimé + DB nettoyée
- réordonnancement -> positions cohérentes

### Functional
- upload multiple sur produit existant
- image principale correcte
- suppression d’une image au milieu
- réindexation des positions
- affichage public correct sur fiche produit

## Success Criteria
Le chantier est terminé si :
- un admin peut uploader plusieurs images produit vers R2
- les métadonnées sont stockées proprement en DB
- une image principale est identifiable par `position`
- les images peuvent être supprimées et réordonnées
- les fiches produit publiques affichent correctement les images R2
