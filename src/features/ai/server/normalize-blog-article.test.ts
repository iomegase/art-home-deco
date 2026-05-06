import assert from "node:assert/strict";
import test from "node:test";
import { assertSeoChecklist, normalizeGeneratedBlogArticle } from "./normalize-blog-article";

test("normalizeGeneratedBlogArticle forces slug, heading and CTA links", () => {
  const article = normalizeGeneratedBlogArticle({
    title: "Bougies parfumées et ambiance chalet",
    seoTitle: "Bougies parfumées | Art Home Deco",
    metaDescription:
      "Découvrez comment choisir des bougies parfumées pour créer une ambiance chaleureuse et élégante dans votre intérieur de montagne.",
    slug: "Bougies Parfumées",
    excerpt:
      "Des conseils concrets pour choisir des bougies parfumées et créer une atmosphère chaleureuse dans un intérieur soigné.",
    category: "Conseil déco",
    imageAlt: "Bougies parfumées artisanales dans un intérieur chaleureux",
    authorLabel: "",
    contentMarkdown:
      "## Choisir la bonne bougie\n\nUne bougie parfumee bien choisie apporte une lumiere douce et une atmosphere plus intime dans un salon de montagne.\n\n## Composer l'ambiance\n\nAssociez les matieres naturelles, la laine et le bois avec des senteurs subtiles pour eviter de surcharger la piece.\n\n### Notre conseil\n\nPreferez des notes boisees, florales ou epicees selon la saison.",
    brandPerspectiveMarkdown:
      "Nos objets decoratifs sont choisis pour accompagner la lumiere, les matieres naturelles et l'art de vivre alpin sans surcharger la piece.",
    cta: {
      title: "Envie d'aller plus loin ?",
      body: "Retrouvez notre selection deco et contactez la boutique pour un conseil personnalise.",
      primaryLabel: "Voir la selection",
      primaryLink: "/boutique",
      secondaryLabel: "Nous contacter",
      secondaryLink: "/contact",
    },
    seoChecklist: {
      hasLocalContext: true,
      hasBrandMention: true,
      hasNoKeywordStuffing: true,
      hasUsefulAdvice: true,
      hasImageAlt: false,
      hasCta: false,
      hasNoH1InMarkdown: false,
    },
  });

  assert.equal(article.slug, "bougies-parfumees");
  assert.match(article.brandPerspectiveMarkdown, /^## Le regard d'Art Home Déco/);
  assert.equal(article.cta.primaryLink, "/boutique");
  assert.equal(article.cta.secondaryLink, "/contact");
  assert.equal(article.seoTitle, "Bougies parfumées | Art Home Déco");
});

test("assertSeoChecklist rejects incomplete checklist", () => {
  const article = normalizeGeneratedBlogArticle({
    title: "Textiles naturels pour chalet",
    seoTitle: "Textiles naturels pour chalet",
    metaDescription:
      "Des idees de textiles naturels pour composer un interieur de montagne chaleureux, elegant et facile a vivre au quotidien.",
    slug: "textiles-naturels-pour-chalet",
    excerpt:
      "Comment choisir plaid, coussins et rideaux pour renforcer une ambiance douce et coherente dans un chalet ou un appartement de montagne.",
    category: "Conseil déco",
    imageAlt: "Textiles naturels dans un salon de chalet chaleureux",
    authorLabel: "Par l'equipe Art Home Déco",
    contentMarkdown:
      "## Choisir les matieres\n\nLe lin, la laine et le coton lavé permettent de composer une ambiance douce, souple et elegante sans surcharge visuelle.\n\n## Travailler les contrastes\n\nMisez sur des teintes naturelles, des motifs sobres et une repetition mesuree des textures pour garder une vraie coherence decorative.",
    brandPerspectiveMarkdown: "## Le regard d'Art Home Déco\n\nNous conseillons de superposer peu de matieres mais de les choisir avec soin.",
    cta: {
      title: "Voir la boutique",
      body: "Retrouvez notre selection maison pour composer un interieur chaleureux et demander un conseil a la boutique.",
      primaryLabel: "Boutique",
      primaryLink: "/boutique",
      secondaryLabel: "Contact",
      secondaryLink: "/contact",
    },
    seoChecklist: {
      hasLocalContext: true,
      hasBrandMention: false,
      hasNoKeywordStuffing: true,
      hasUsefulAdvice: true,
      hasImageAlt: true,
      hasCta: true,
      hasNoH1InMarkdown: true,
    },
  });

  assert.throws(() => assertSeoChecklist(article), /hasBrandMention/);
});
