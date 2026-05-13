import { defaultLegalSettings, type LegalSettings } from "@/features/admin-home/types";

export type LegalBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      items: string[];
    }
  | {
      type: "table";
      headers: string[];
      rows: string[][];
    };

export type LegalSection = {
  title: string;
  blocks: LegalBlock[];
};

export type LegalPageContent = {
  slug: string;
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
};

function readLegalEnv(key: string, fallback: string) {
  const value = process.env[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

export const legalSettingsFromEnv: LegalSettings = {
  commercialName: readLegalEnv("NEXT_PUBLIC_LEGAL_COMMERCIAL_NAME", "Art Home Déco"),
  legalName: readLegalEnv("NEXT_PUBLIC_LEGAL_NAME", "[DENOMINATION_SOCIALE]"),
  legalForm: readLegalEnv("NEXT_PUBLIC_LEGAL_FORM", "[FORME_JURIDIQUE]"),
  capital: readLegalEnv("NEXT_PUBLIC_LEGAL_CAPITAL", "[CAPITAL_SOCIAL]"),
  address: readLegalEnv("NEXT_PUBLIC_LEGAL_ADDRESS", "[ADRESSE_SIEGE]"),
  siren: readLegalEnv("NEXT_PUBLIC_LEGAL_SIREN", "[SIREN]"),
  rcs: readLegalEnv("NEXT_PUBLIC_LEGAL_RCS", "[RCS_VILLE]"),
  vat: readLegalEnv("NEXT_PUBLIC_LEGAL_VAT", "[NUMERO_TVA]"),
  email: readLegalEnv("NEXT_PUBLIC_LEGAL_EMAIL", "[EMAIL_CONTACT]"),
  phone: readLegalEnv("NEXT_PUBLIC_LEGAL_PHONE", "[TELEPHONE]"),
  publisher: readLegalEnv("NEXT_PUBLIC_LEGAL_PUBLISHER", "[DIRECTEUR_PUBLICATION]"),
  domain: readLegalEnv(
    "NEXT_PUBLIC_LEGAL_DOMAIN",
    readLegalEnv("NEXT_PUBLIC_SITE_URL", "[DOMAINE]"),
  ),
  hostName: readLegalEnv("NEXT_PUBLIC_LEGAL_HOST_NAME", "[HEBERGEUR_NOM]"),
  hostAddress: readLegalEnv("NEXT_PUBLIC_LEGAL_HOST_ADDRESS", "[HEBERGEUR_ADRESSE]"),
  hostPhone: readLegalEnv("NEXT_PUBLIC_LEGAL_HOST_PHONE", "[HEBERGEUR_TELEPHONE]"),
  mediatorName: readLegalEnv("NEXT_PUBLIC_LEGAL_MEDIATOR_NAME", "[MEDIATEUR_NOM]"),
  mediatorAddress: readLegalEnv("NEXT_PUBLIC_LEGAL_MEDIATOR_ADDRESS", "[MEDIATEUR_ADRESSE]"),
  mediatorWebsite: readLegalEnv("NEXT_PUBLIC_LEGAL_MEDIATOR_WEBSITE", "[MEDIATEUR_SITE]"),
  returnAddress: readLegalEnv("NEXT_PUBLIC_LEGAL_RETURN_ADDRESS", "[ADRESSE_RETOUR]"),
  lastUpdated: readLegalEnv("NEXT_PUBLIC_LEGAL_LAST_UPDATED", "[DATE_DERNIERE_MAJ]"),
};

export const legalCompany = legalSettingsFromEnv;

export function createLegalPages(legal: LegalSettings = defaultLegalSettings): Record<string, LegalPageContent> {
  const legalLastUpdated = legal.lastUpdated;
  const legalCompany = legal;

  return {
  "mentions-legales": {
    slug: "mentions-legales",
    title: "Mentions légales",
    description:
      "Informations légales relatives à l’éditeur, l’hébergeur et l’utilisation du site Art Home Déco.",
    lastUpdated: legalLastUpdated,
    sections: [
      {
        title: "Éditeur du site",
        blocks: [
          {
            type: "paragraph",
            text: `Le site ${legalCompany.domain} est édité par ${legalCompany.commercialName}.`,
          },
          {
            type: "list",
            items: [
              `Nom commercial : ${legalCompany.commercialName}`,
              `Dénomination sociale : ${legalCompany.legalName}`,
              `Forme juridique : ${legalCompany.legalForm}`,
              `Capital social : ${legalCompany.capital}`,
              `Siège social : ${legalCompany.address}`,
              `SIREN / SIRET : ${legalCompany.siren}`,
              `RCS : ${legalCompany.rcs}`,
              `TVA intracommunautaire : ${legalCompany.vat}`,
              `Email : ${legalCompany.email}`,
              `Téléphone : ${legalCompany.phone}`,
            ],
          },
        ],
      },
      {
        title: "Directeur de la publication",
        blocks: [
          {
            type: "paragraph",
            text: `Le directeur de la publication est ${legalCompany.publisher}.`,
          },
        ],
      },
      {
        title: "Hébergement",
        blocks: [
          {
            type: "list",
            items: [
              `Hébergeur : ${legalCompany.hostName}`,
              `Adresse : ${legalCompany.hostAddress}`,
              `Téléphone : ${legalCompany.hostPhone}`,
            ],
          },
        ],
      },
      {
        title: "Activité du site",
        blocks: [
          {
            type: "paragraph",
            text: `${legalCompany.commercialName} propose la vente en ligne de produits de décoration, mobilier, luminaires, textiles, accessoires et objets destinés à l’aménagement intérieur.`,
          },
        ],
      },
      {
        title: "Propriété intellectuelle",
        blocks: [
          {
            type: "paragraph",
            text: "L’ensemble des éléments présents sur le site, notamment les textes, photographies, visuels, logos, icônes, éléments graphiques, structure, design, code source et contenus éditoriaux, sont protégés par le droit de la propriété intellectuelle.",
          },
          {
            type: "paragraph",
            text: `Toute reproduction, représentation, modification, adaptation, extraction ou réutilisation, totale ou partielle, sans autorisation préalable écrite de ${legalCompany.legalName}, est interdite.`,
          },
        ],
      },
      {
        title: "Responsabilité",
        blocks: [
          {
            type: "paragraph",
            text: "L’éditeur s’efforce d’assurer l’exactitude et la mise à jour des informations diffusées sur le site. Toutefois, des erreurs, omissions ou indisponibilités temporaires peuvent survenir.",
          },
          {
            type: "paragraph",
            text: `${legalCompany.commercialName} ne peut être tenue responsable du contenu, du fonctionnement ou des pratiques des sites tiers accessibles via des liens externes.`,
          },
        ],
      },
      {
        title: "Données personnelles et cookies",
        blocks: [
          {
            type: "paragraph",
            text: `Les traitements de données personnelles sont décrits dans la politique de confidentialité accessible à l’adresse ${legalCompany.domain}/politique-de-confidentialite.`,
          },
          {
            type: "paragraph",
            text: `Les modalités de gestion des cookies sont décrites sur la page ${legalCompany.domain}/cookies.`,
          },
        ],
      },
    ],
  },

  "politique-de-confidentialite": {
    slug: "politique-de-confidentialite",
    title: "Politique de confidentialité",
    description:
      "Informations relatives à la collecte, l’utilisation, la conservation et la protection des données personnelles.",
    lastUpdated: legalLastUpdated,
    sections: [
      {
        title: "Responsable du traitement",
        blocks: [
          {
            type: "paragraph",
            text: `Le responsable du traitement des données personnelles est ${legalCompany.legalName}, exploitant le site ${legalCompany.commercialName}.`,
          },
          {
            type: "list",
            items: [
              `Adresse : ${legalCompany.address}`,
              `Email : ${legalCompany.email}`,
              `Téléphone : ${legalCompany.phone}`,
            ],
          },
        ],
      },
      {
        title: "Données personnelles collectées",
        blocks: [
          {
            type: "list",
            items: [
              "nom et prénom",
              "adresse email",
              "numéro de téléphone",
              "adresse de livraison",
              "adresse de facturation",
              "historique de commande",
              "contenu des messages envoyés au service client",
              "statut de paiement",
              "données techniques de navigation : adresse IP, navigateur, logs, cookies",
              "consentements marketing et WhatsApp lorsque ces options sont proposées",
            ],
          },
        ],
      },
      {
        title: "Finalités et bases légales",
        blocks: [
          {
            type: "table",
            headers: ["Finalité", "Base légale"],
            rows: [
              ["Gestion des commandes", "Exécution du contrat"],
              ["Paiement des commandes", "Exécution du contrat"],
              ["Livraison des produits", "Exécution du contrat"],
              ["Service client", "Exécution du contrat ou intérêt légitime"],
              ["Facturation et comptabilité", "Obligation légale"],
              ["Sécurité du site et prévention de la fraude", "Intérêt légitime"],
              ["Notifications liées à une commande par email ou WhatsApp", "Exécution du contrat ou consentement"],
              ["Offres commerciales", "Consentement ou intérêt légitime selon le cadre applicable"],
              ["Mesure d’audience", "Consentement ou intérêt légitime selon la configuration"],
              ["Publicité personnalisée", "Consentement"],
            ],
          },
        ],
      },
      {
        title: "Paiement",
        blocks: [
          {
            type: "paragraph",
            text: "Les paiements sont traités par Stripe. Le site ne conserve pas les numéros complets de carte bancaire.",
          },
          {
            type: "paragraph",
            text: "Certaines informations techniques liées au paiement peuvent être conservées afin de gérer la commande, la preuve de transaction, la facturation, la fraude et le service client.",
          },
        ],
      },
      {
        title: "Utilisation de WhatsApp",
        blocks: [
          {
            type: "paragraph",
            text: `${legalCompany.commercialName} peut utiliser WhatsApp pour envoyer des notifications liées aux commandes ou répondre aux demandes clients.`,
          },
          {
            type: "list",
            items: [
              "confirmation de commande",
              "suivi de préparation",
              "information de livraison",
              "réponse à une demande client",
              "suivi de retour ou remboursement",
            ],
          },
          {
            type: "paragraph",
            text: "Les communications commerciales par WhatsApp font l’objet d’un consentement distinct lorsque cette option est proposée.",
          },
          {
            type: "paragraph",
            text: "L’utilisateur peut demander à ne plus recevoir de messages non essentiels en répondant STOP, ARRET ou DÉSINSCRIPTION.",
          },
        ],
      },
      {
        title: "Destinataires des données",
        blocks: [
          {
            type: "list",
            items: [
              `personnel habilité de ${legalCompany.legalName}`,
              "prestataire de paiement Stripe",
              "prestataires de livraison",
              "prestataires d’hébergement",
              "prestataires techniques",
              "prestataires email",
              "Meta / WhatsApp lorsque WhatsApp Business Platform est utilisé",
              "outils de mesure d’audience si activés",
              "outils publicitaires si activés avec consentement",
              "expert-comptable",
              "autorités administratives ou judiciaires lorsque la loi l’exige",
            ],
          },
        ],
      },
      {
        title: "Durées de conservation",
        blocks: [
          {
            type: "table",
            headers: ["Données", "Durée indicative"],
            rows: [
              ["Compte client", "Jusqu’à suppression du compte ou inactivité prolongée"],
              ["Commandes", "Durée nécessaire à l’exécution puis archivage légal"],
              ["Factures et pièces comptables", "10 ans"],
              ["Données de paiement", "Durée nécessaire au paiement et à la preuve de transaction"],
              ["Messages de contact", "Durée nécessaire au traitement de la demande"],
              ["Prospection", "Jusqu’au retrait du consentement ou 3 ans après le dernier contact actif"],
              ["Cookies soumis à consentement", "Selon la durée indiquée dans le gestionnaire de cookies"],
              ["Preuves de consentement", "Durée nécessaire à la démonstration du consentement"],
            ],
          },
        ],
      },
      {
        title: "Droits des utilisateurs",
        blocks: [
          {
            type: "list",
            items: [
              "droit d’accès",
              "droit de rectification",
              "droit d’effacement",
              "droit d’opposition",
              "droit à la limitation du traitement",
              "droit à la portabilité",
              "droit de retirer son consentement",
              "droit de définir des directives post-mortem",
            ],
          },
          {
            type: "paragraph",
            text: `Pour exercer ces droits, l’utilisateur peut contacter ${legalCompany.commercialName} à l’adresse ${legalCompany.email}.`,
          },
        ],
      },
      {
        title: "Réclamation auprès de la CNIL",
        blocks: [
          {
            type: "paragraph",
            text: "Si l’utilisateur estime que ses droits ne sont pas respectés, il peut introduire une réclamation auprès de la CNIL : https://www.cnil.fr.",
          },
        ],
      },
    ],
  },

  cookies: {
    slug: "cookies",
    title: "Politique cookies",
    description:
      "Informations relatives aux cookies et traceurs utilisés sur le site.",
    lastUpdated: legalLastUpdated,
    sections: [
      {
        title: "Qu’est-ce qu’un cookie ?",
        blocks: [
          {
            type: "paragraph",
            text: "Un cookie est un petit fichier déposé ou lu sur le terminal de l’utilisateur lors de la consultation d’un site internet.",
          },
        ],
      },
      {
        title: "Cookies strictement nécessaires",
        blocks: [
          {
            type: "paragraph",
            text: "Ces cookies sont indispensables au fonctionnement du site et ne nécessitent pas le consentement préalable de l’utilisateur.",
          },
          {
            type: "list",
            items: [
              "affichage du site",
              "gestion du panier",
              "sécurisation du paiement",
              "conservation de la session utilisateur",
              "mémorisation du choix relatif aux cookies",
              "protection contre la fraude ou les abus",
            ],
          },
        ],
      },
      {
        title: "Cookies de mesure d’audience",
        blocks: [
          {
            type: "paragraph",
            text: "Ces cookies permettent de comprendre comment les visiteurs utilisent le site. Selon leur configuration, ils peuvent être soumis au consentement préalable.",
          },
        ],
      },
      {
        title: "Cookies marketing et publicitaires",
        blocks: [
          {
            type: "paragraph",
            text: "Ces cookies permettent de mesurer l’efficacité des campagnes publicitaires ou de proposer des contenus personnalisés. Ils ne sont déposés qu’avec le consentement de l’utilisateur.",
          },
        ],
      },
      {
        title: "Gestion du consentement",
        blocks: [
          {
            type: "paragraph",
            text: "Lors de sa première visite, l’utilisateur peut accepter, refuser ou paramétrer les cookies non essentiels. Le refus doit être aussi simple que l’acceptation.",
          },
          {
            type: "paragraph",
            text: "L’utilisateur peut modifier ses choix à tout moment via le lien de gestion des cookies présent dans le footer du site.",
          },
        ],
      },
      {
        title: "Liste des cookies",
        blocks: [
          {
            type: "table",
            headers: ["Nom", "Fournisseur", "Finalité", "Durée", "Consentement"],
            rows: [
              ["[cookie_session]", legalCompany.commercialName, "Session / panier", "[durée]", "Non"],
              ["[cookie_consent]", legalCompany.commercialName, "Mémorisation du choix cookies", "[durée]", "Non"],
              ["[stripe_cookie]", "Stripe", "Paiement sécurisé / fraude", "[durée]", "Selon configuration"],
              ["[analytics_cookie]", "[outil analytics]", "Mesure d’audience", "[durée]", "Oui ou non selon configuration"],
              ["[meta_pixel]", "Meta", "Publicité / mesure marketing", "[durée]", "Oui"],
            ],
          },
        ],
      },
    ],
  },

  cgv: {
    slug: "cgv",
    title: "Conditions générales de vente",
    description:
      "Conditions applicables aux commandes passées sur le site Art Home Déco.",
    lastUpdated: legalLastUpdated,
    sections: [
      {
        title: "Vendeur",
        blocks: [
          {
            type: "list",
            items: [
              `Nom commercial : ${legalCompany.commercialName}`,
              `Dénomination sociale : ${legalCompany.legalName}`,
              `Forme juridique : ${legalCompany.legalForm}`,
              `Siège social : ${legalCompany.address}`,
              `SIREN / SIRET : ${legalCompany.siren}`,
              `RCS : ${legalCompany.rcs}`,
              `TVA intracommunautaire : ${legalCompany.vat}`,
              `Email : ${legalCompany.email}`,
              `Téléphone : ${legalCompany.phone}`,
            ],
          },
        ],
      },
      {
        title: "Produits",
        blocks: [
          {
            type: "paragraph",
            text: `${legalCompany.commercialName} propose à la vente des produits de décoration, mobilier, luminaires, textiles, accessoires et objets destinés à l’aménagement intérieur.`,
          },
          {
            type: "paragraph",
            text: "Les photographies sont présentées à titre illustratif. De légères variations peuvent exister selon les écrans, les séries de fabrication ou les caractéristiques artisanales de certains produits.",
          },
        ],
      },
      {
        title: "Prix",
        blocks: [
          {
            type: "paragraph",
            text: "Les prix sont indiqués en euros, toutes taxes comprises, hors frais de livraison sauf mention contraire.",
          },
          {
            type: "paragraph",
            text: "Les frais de livraison sont indiqués avant la validation définitive de la commande.",
          },
        ],
      },
      {
        title: "Commande",
        blocks: [
          {
            type: "paragraph",
            text: "La commande devient définitive après validation du panier, acceptation des CGV et paiement effectif de la commande.",
          },
          {
            type: "paragraph",
            text: "Un email de confirmation est envoyé au client à l’adresse indiquée lors de la commande.",
          },
        ],
      },
      {
        title: "Paiement",
        blocks: [
          {
            type: "paragraph",
            text: "Le paiement est exigible au moment de la commande. Le site utilise Stripe pour sécuriser les transactions.",
          },
          {
            type: "paragraph",
            text: `${legalCompany.commercialName} ne conserve pas les numéros complets de carte bancaire.`,
          },
        ],
      },
      {
        title: "Livraison",
        blocks: [
          {
            type: "paragraph",
            text: "Les produits sont livrés à l’adresse indiquée par le client lors de la commande.",
          },
          {
            type: "paragraph",
            text: "Le client doit vérifier l’état du colis lors de la livraison et informer le service client en cas d’anomalie, idéalement avec photographies à l’appui.",
          },
        ],
      },
      {
        title: "Droit de rétractation",
        blocks: [
          {
            type: "paragraph",
            text: "Le client consommateur dispose d’un délai de 14 jours pour exercer son droit de rétractation, sans avoir à justifier sa décision.",
          },
          {
            type: "paragraph",
            text: "Le délai court à compter du lendemain de la réception du produit par le client ou par un tiers désigné par lui.",
          },
          {
            type: "paragraph",
            text: `Pour exercer son droit de rétractation, le client peut contacter ${legalCompany.commercialName} à l’adresse ${legalCompany.email}.`,
          },
        ],
      },
      {
        title: "Exceptions au droit de rétractation",
        blocks: [
          {
            type: "list",
            items: [
              "produits confectionnés selon les spécifications du client ou nettement personnalisés",
              "produits susceptibles de se détériorer ou de se périmer rapidement",
              "produits descellés ne pouvant être renvoyés pour des raisons d’hygiène ou de protection de la santé",
              "produits indissociablement mélangés avec d’autres articles après livraison",
            ],
          },
        ],
      },
      {
        title: "Retours et remboursements",
        blocks: [
          {
            type: "paragraph",
            text: "En cas de rétractation, le client doit retourner les produits dans un délai de 14 jours suivant la communication de sa décision.",
          },
          {
            type: "paragraph",
            text: `Les produits doivent être retournés à l’adresse suivante : ${legalCompany.returnAddress}.`,
          },
          {
            type: "paragraph",
            text: "Le remboursement est effectué via le même moyen de paiement que celui utilisé lors de la commande, sauf accord contraire.",
          },
        ],
      },
      {
        title: "Garanties légales",
        blocks: [
          {
            type: "paragraph",
            text: "Le client bénéficie des garanties légales applicables, notamment la garantie légale de conformité et la garantie contre les vices cachés.",
          },
        ],
      },
      {
        title: "Médiation de la consommation",
        blocks: [
          {
            type: "paragraph",
            text: "En cas de litige, le client doit d’abord contacter le service client afin de rechercher une solution amiable.",
          },
          {
            type: "list",
            items: [
              `Médiateur : ${legalCompany.mediatorName}`,
              `Adresse : ${legalCompany.mediatorAddress}`,
              `Site internet : ${legalCompany.mediatorWebsite}`,
            ],
          },
        ],
      },
    ],
  },

  cgu: {
    slug: "cgu",
    title: "Conditions générales d’utilisation",
    description:
      "Conditions d’accès et d’utilisation du site Art Home Déco.",
    lastUpdated: legalLastUpdated,
    sections: [
      {
        title: "Objet du site",
        blocks: [
          {
            type: "paragraph",
            text: `Le site ${legalCompany.commercialName} permet de consulter des produits de décoration, de passer commande en ligne, de contacter le service client et de consulter des contenus éditoriaux.`,
          },
        ],
      },
      {
        title: "Accès au site",
        blocks: [
          {
            type: "paragraph",
            text: "Le site est accessible gratuitement à tout utilisateur disposant d’un accès internet.",
          },
          {
            type: "paragraph",
            text: "Certains services peuvent nécessiter la création d’un compte client ou la communication d’informations personnelles.",
          },
        ],
      },
      {
        title: "Compte utilisateur",
        blocks: [
          {
            type: "paragraph",
            text: "Lorsque le site propose un espace client, l’utilisateur s’engage à fournir des informations exactes, complètes et à jour.",
          },
          {
            type: "paragraph",
            text: "L’utilisateur est responsable de la confidentialité de ses identifiants et de toute activité réalisée depuis son compte.",
          },
        ],
      },
      {
        title: "Comportements interdits",
        blocks: [
          {
            type: "list",
            items: [
              "utiliser le site à des fins frauduleuses",
              "perturber le fonctionnement du site",
              "tenter d’accéder sans autorisation à un espace réservé",
              "extraire massivement des données",
              "copier ou réutiliser les contenus du site sans autorisation",
              "transmettre des contenus illicites ou portant atteinte aux droits de tiers",
              "usurper l’identité d’un tiers",
              "utiliser le site pour envoyer des messages non sollicités",
            ],
          },
        ],
      },
      {
        title: "Propriété intellectuelle",
        blocks: [
          {
            type: "paragraph",
            text: "Les contenus du site, notamment textes, photographies, vidéos, logos, marques, graphismes, icônes, structure, design et code, sont protégés par les droits de propriété intellectuelle.",
          },
        ],
      },
      {
        title: "Responsabilité",
        blocks: [
          {
            type: "paragraph",
            text: `${legalCompany.commercialName} ne peut être tenue responsable des dommages indirects, pertes de données, pertes de chance ou préjudices résultant d’une utilisation inappropriée du site.`,
          },
        ],
      },
      {
        title: "Données personnelles et cookies",
        blocks: [
          {
            type: "paragraph",
            text: `Les traitements de données personnelles sont décrits dans la politique de confidentialité : ${legalCompany.domain}/politique-de-confidentialite.`,
          },
          {
            type: "paragraph",
            text: `Les modalités de gestion des cookies sont décrites ici : ${legalCompany.domain}/cookies.`,
          },
        ],
      },
    ],
  },

  "donnees-personnelles": {
    slug: "donnees-personnelles",
    title: "Données personnelles et demandes de suppression",
    description:
      "Page dédiée à l’exercice des droits RGPD et aux demandes de suppression des données.",
    lastUpdated: legalLastUpdated,
    sections: [
      {
        title: "Exercer vos droits",
        blocks: [
          {
            type: "list",
            items: [
              "accès à vos données",
              "rectification de données inexactes",
              "suppression de vos données",
              "opposition à certains traitements",
              "limitation du traitement",
              "portabilité des données",
              "retrait de votre consentement",
              "désinscription des communications commerciales",
            ],
          },
        ],
      },
      {
        title: "Demander la suppression de vos données",
        blocks: [
          {
            type: "paragraph",
            text: `Pour demander la suppression de vos données personnelles, contactez ${legalCompany.commercialName} à l’adresse ${legalCompany.email}.`,
          },
          {
            type: "paragraph",
            text: "Objet conseillé : Suppression de mes données personnelles.",
          },
          {
            type: "list",
            items: [
              "votre nom",
              "votre prénom",
              "votre adresse email",
              "votre numéro de téléphone si vous avez utilisé WhatsApp ou passé commande",
              "votre numéro de commande si votre demande concerne une commande",
              "le type de données concernées par votre demande",
            ],
          },
        ],
      },
      {
        title: "Données pouvant être supprimées",
        blocks: [
          {
            type: "list",
            items: [
              "compte client",
              "préférences marketing",
              "messages de contact",
              "données de prospection",
              "consentements WhatsApp marketing",
              "certaines données techniques associées au profil",
            ],
          },
        ],
      },
      {
        title: "Données pouvant être conservées",
        blocks: [
          {
            type: "paragraph",
            text: "Certaines données peuvent être conservées lorsque la loi l’exige ou lorsque leur conservation est nécessaire.",
          },
          {
            type: "list",
            items: [
              "obligations comptables et fiscales",
              "conservation des factures",
              "gestion d’une commande en cours",
              "service après-vente",
              "retour, garantie ou litige",
              "prévention de la fraude",
              "établissement, exercice ou défense de droits en justice",
            ],
          },
        ],
      },
      {
        title: "Suppression des données liées à WhatsApp / Meta",
        blocks: [
          {
            type: "paragraph",
            text: `Si vous avez échangé avec ${legalCompany.commercialName} via WhatsApp ou une fonctionnalité liée à Meta, vous pouvez demander la suppression des données associées à l’adresse ${legalCompany.email}.`,
          },
          {
            type: "paragraph",
            text: "Objet conseillé : Suppression de mes données Meta / WhatsApp.",
          },
        ],
      },
      {
        title: "Désinscription WhatsApp",
        blocks: [
          {
            type: "paragraph",
            text: "Pour ne plus recevoir de messages non essentiels via WhatsApp, vous pouvez répondre directement STOP, ARRET ou DÉSINSCRIPTION.",
          },
        ],
      },
      {
        title: "Réclamation",
        blocks: [
          {
            type: "paragraph",
            text: "Si vous estimez que vos droits ne sont pas respectés, vous pouvez contacter la CNIL : https://www.cnil.fr.",
          },
        ],
      },
    ],
  },
  };
}

export const legalPages: Record<string, LegalPageContent> = createLegalPages(legalSettingsFromEnv);
