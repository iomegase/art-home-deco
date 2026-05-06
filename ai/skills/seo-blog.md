# SEO Blog Rules — Art Home Déco

Chaque article doit respecter les règles suivantes.

## Objectif

Créer un contenu utile, naturel et éditorial, pensé d’abord pour les lecteurs, puis optimisé SEO.

L’article doit répondre à une vraie intention de recherche :

- s’informer
- choisir
- décorer
- comparer
- entretenir
- s’inspirer
- comprendre une tendance

## Structure obligatoire

Chaque article doit contenir :

- un titre éditorial clair
- un title SEO court
- une meta description unique
- un slug propre
- une introduction courte
- un contenu principal en Markdown
- plusieurs sections H2
- si utile, des sous-sections H3
- un bloc “Le regard d’Art Home Déco”
- une conclusion
- un CTA final vers la boutique et le contact
- un alt image descriptif

## Format attendu

Gemini doit retourner uniquement du JSON valide.

Le contenu éditorial principal doit être dans :

```json
"contentMarkdown": "## Titre section\n\nTexte..."
```

Le bloc boutique doit être dans :

```json
"brandPerspectiveMarkdown": "## Le regard d’Art Home Déco\n\nTexte..."
```

Ne pas retourner de HTML.
Ne pas retourner de Markdown seul hors JSON.

## Règles title SEO

- court, clair et lisible
- ne jamais doubler la marque
- utiliser : `Art Home Déco`
- éviter : `Art Home Deco`
- ne pas dépasser environ 60 à 70 caractères si possible

Exemple :

`Bougies parfumées : conseils pour une ambiance chalet | Art Home Déco`

## Règles meta description

La meta description doit :

- être unique
- donner envie de cliquer
- résumer clairement l’article
- rester naturelle
- éviter les listes de mots-clés
- contenir environ 140 à 160 caractères quand c’est possible

## Règles contenu

- ne pas écrire uniquement pour les moteurs
- apporter des conseils concrets
- citer la boutique naturellement
- relier le sujet à l’univers déco, montagne ou chalet si pertinent
- éviter les affirmations médicales, techniques ou écologiques non sourcées
- préférer les formulations prudentes
- ne pas répéter Art Home Déco plus de 2 ou 3 fois
- ne pas répéter Saint-Gervais-les-Bains inutilement

## Règles image

L’image doit avoir un alt descriptif.
Le alt doit décrire l’image ou l’intention visuelle, pas simplement recopier le titre.

Exemples :

- `Bougies parfumées artisanales dans un intérieur chaleureux`
- `Céramiques artisanales pour une décoration de chalet`
- `Textiles naturels pour une ambiance montagne élégante`

## Règles liens internes

Chaque article doit prévoir un CTA final avec :

- lien vers `/boutique`
- lien vers `/contact`

Si le contenu le justifie, le Markdown peut contenir des liens internes naturels.

Exemples :

```md
Découvrez notre [sélection déco](/boutique).
Contactez [l’équipe Art Home Déco](/contact).
```

## Règles JSON-LD

Chaque article doit permettre de générer un JSON-LD `BlogPosting` avec :

- `mainEntityOfPage`
- `headline`
- `description`
- `image`
- `datePublished`
- `dateModified`
- `author`
- `publisher`
- `publisher.logo`
- `publisher.address`
