# Pack Codex — Site e-commerce scalable pour boutique de décoration

Pack de pilotage pour Codex : Next.js App Router, TypeScript, Tailwind, Stripe, Colissimo, Shopcaisse, SEO, blog et IA.

## Principe d’architecture

```txt
Shopcaisse = source de référence du stock
Site e-commerce = catalogue enrichi + SEO + panier + Stripe + commandes web
Stripe = paiement
Webhook Stripe = validation paiement
Colissimo = livraison, manuel au MVP puis API plus tard
```

## Utilisation

1. Copier ce dossier à la racine du repo.
2. Lire `AGENTS.md` et `Plan.md`.
3. Lancer Codex avec les prompts dans `/prompts`.
4. Utiliser les skills dans `/skills` selon la tâche.
