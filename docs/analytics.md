# Analytics implementation

## 1. Outils installes
- Google Tag Manager (chargement conditionnel)
- GA4 via dataLayer/GTM
- Consentement cookies (necessaires, analytics, marketing)
- Evenements e-commerce et contact/local
- Base optionnelle Meta Pixel (desactivee)
- Base optionnelle Microsoft Clarity (desactivee)

## 2. Variables d'environnement
- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_GA4_ID`
- `NEXT_PUBLIC_ENABLE_ANALYTICS`
- `NEXT_PUBLIC_META_PIXEL_ID`
- `NEXT_PUBLIC_CLARITY_ID`
- `NEXT_PUBLIC_SITE_URL`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_ANALYTICS_PROPERTY_ID`
- `GOOGLE_SEARCH_CONSOLE_SITE_URL`

## 3. Evenements suivis
- Ecommerce: `view_item`, `view_item_list`, `select_item`, `add_to_cart`, `remove_from_cart`, `begin_checkout`, `add_shipping_info`, `purchase`
- Contact/local: `phone_click`, `whatsapp_click`, `email_click`, `contact_form_submit`, `newsletter_signup`, `site_search`, `product_filter`

## 4. Convention de nommage
- Snake case, prefixe metier explicite
- Payload e-commerce au format GA4 (`currency`, `value`, `items`)

## 5. UTM Google Business Profile
Utiliser pour le lien principal:
`https://arthomedeco.fr/?utm_source=google&utm_medium=organic&utm_campaign=google_business_profile`

## 6. Procedure test GTM
1. Ouvrir GTM preview mode
2. Naviguer sur produit/panier/checkout
3. Verifier les evenements dataLayer
4. Verifier `purchase` uniquement apres commande payee

## 7. Procedure test GA4 DebugView
1. Activer DebugView dans GA4
2. Accepter cookies analytics
3. Refaire parcours produit -> panier -> checkout -> achat
4. Confirmer mapping `items` et `value`

## 8. Consentement cookies
- Le bandeau apparait au premier chargement
- `Accepter`, `Refuser`, `Personnaliser`
- Sans consentement analytics: pas d'evenement analytics
- Sans consentement marketing: pas de Meta

## 9. Outils optionnels non actives
- Meta Pixel et Conversions API: preparation seulement
- Microsoft Clarity: preparation seulement

## 10. Checklist pre-production
- Configurer conteneur GTM et balises GA4
- Configurer GA4 event mapping
- Configurer Search Console proprietes + sitemap
- Configurer URL UTM dans Google Business Profile
- Verifier pages legales, livraison, retours, CGV
- Valider consentement RGPD et politique cookies

## Notes importantes
- Source de verite achat: webhook Stripe
- En MVP, pas d'envoi serveur GA4 Measurement Protocol
- `purchase` est relaye via page success avec dedup serveur (`analyticsPurchaseTrackedAt`)
- L'onglet admin `Analytics` peut afficher les metriques live GA4 + Search Console si le service account Google a acces a la propriete GA4 et a la property Search Console
- TODO: connecter `site_search` quand une barre de recherche sera exposee en public
