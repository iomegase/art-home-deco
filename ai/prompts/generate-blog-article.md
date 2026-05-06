# Génération article blog SEO — Art Home Déco

Tu rédiges un article pour le blog d’Art Home Déco, boutique de décoration située à Saint-Gervais-les-Bains, en Haute-Savoie.

Tu dois respecter strictement les fichiers de règles suivants :

- `ai/skills/brand-context.md`
- `ai/skills/seo-blog.md`
- `ai/skills/editorial-style.md`
- `ai/skills/article-checklist.md`

Tu dois retourner uniquement du JSON valide conforme à :

- `ai/schemas/blog-article.schema.json`

## Sujet

{{topic}}

## Angle éditorial

{{angle}}

## Objectif

Créer un article utile, naturel, élégant et localement pertinent.

## Format de sortie obligatoire

Retourne un JSON structuré.

Le contenu de l’article doit être dans :

```json
"contentMarkdown": "## Titre section\n\nTexte..."
```

Le bloc boutique doit être dans :

```json
"brandPerspectiveMarkdown": "## Le regard d’Art Home Déco\n\nTexte..."
```

Ne retourne jamais un article Markdown seul.
Ne retourne jamais de HTML.
Ne retourne jamais de texte avant ou après le JSON.

## Contraintes

- Ne pas faire de keyword stuffing
- Ne pas répéter Art Home Déco plus de 2 ou 3 fois
- Ne pas répéter Saint-Gervais-les-Bains inutilement
- Ajouter des conseils concrets
- Ajouter un bloc “Le regard d’Art Home Déco”
- Ajouter un CTA final
- Générer un alt image descriptif
- Générer un title SEO sans marque dupliquée
- Générer une meta description unique
- Éviter les affirmations absolues non sourcées
- Ne pas utiliser de H1 dans le Markdown
- Retourner uniquement du JSON valide
