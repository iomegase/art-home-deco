# Plan — Module WhatsApp Live intégré (validation requise avant implémentation)

## Contexte
- Le bouton actuel de type `wa.me`/deep-link n'est pas acceptable.
- Objectif: permettre à l'utilisateur de converser **dans un module intégré au site**, sans quitter la page.

## Contrainte technique importante
- WhatsApp ne fournit pas de widget officiel "chat complet embarqué" type iframe.
- Une conversation in-site nécessite un module de chat custom connecté à l'API WhatsApp Business (Cloud API) côté serveur + webhooks.

## Proposition MVP (in-site réel)
1. Widget sticky bas de page avant footer (bouton + panel conversation).
2. UI chat locale (messages, saisie, état envoi).
3. API interne:
   - `POST /api/chat/whatsapp/start` (init session visiteur)
   - `POST /api/chat/whatsapp/send` (envoi message via Cloud API)
   - `GET /api/chat/whatsapp/messages` (polling initial MVP)
4. Webhook Meta:
   - `GET/POST /api/webhooks/whatsapp` (verification + réception messages entrants)
5. Persistance DB:
   - table conversation
   - table message
   - statut sync/erreur
6. Sécurité:
   - rate limit anti-spam
   - validation Zod
   - secrets uniquement serveur

## Hors MVP immédiat
- Temps réel websocket/SSE (possible phase 2, polling d'abord).
- Pièces jointes médias.
- Multi-agents backoffice.

## Critères d'acceptation
- Le visiteur ouvre le module sticky sans quitter la page.
- Le visiteur envoie un message et voit la réponse dans le module.
- Les messages entrants WhatsApp sont visibles côté site.
- Aucun secret Meta/WhatsApp exposé au client.

## Validation demandée
- Valider cette approche MVP avant implémentation.
