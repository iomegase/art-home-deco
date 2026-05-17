import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import HeroGraphic from "@/components/home/hero-graphic";
import { defaultHomeContent } from "@/features/admin-home/types";
import { isDatabaseUnavailableError } from "@/server/db/client";
import { getSiteSettings } from "@/server/repositories/site-settings.repository";

// 1. Métadonnées optimisées pour le SEO
export async function generateMetadata(): Promise<Metadata> {
  let homeContent = defaultHomeContent;

  try {
    const settings = await getSiteSettings();
    homeContent = settings.homeContent;
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }
  }

  return {
    title: "Boutique de décoration à Saint-Gervais-les-Bains | Art Home Déco",
    description:
      "Art Home Déco est votre boutique de décoration à Saint-Gervais-les-Bains (74). Découvrez notre sélection de mobilier, luminaires, senteurs, textiles et idées cadeaux.",
    alternates: {
      canonical: "https://www.arthomedeco.fr/boutique-decoration-saint-gervais-les-bains",
    },
    openGraph: {
      title: "Boutique de décoration à Saint-Gervais-les-Bains | Art Home Déco",
      description: "Mobilier, luminaires, senteurs et objets déco au pied du Mont-Blanc.",
      url: "https://www.arthomedeco.fr/boutique-decoration-saint-gervais-les-bains",
      locale: "fr_FR",
      type: "website",
      images: [
        {
          url: homeContent.heroImageUrl,
          alt: homeContent.heroImageAlt,
        },
      ],
    },
  };
}

// 2. Extraction des données FAQ pour un code plus propre
const FAQ_ITEMS = [
  {
    question: "Où acheter de la décoration à Saint-Gervais-les-Bains ?",
    answer: "Art Home Déco propose une sélection pointue de produits pour la maison au 96 rue du Mont-Blanc, 74170 Saint-Gervais-les-Bains, en plein centre-ville.",
  },
  {
    question: "Peut-on acheter en ligne ?",
    answer: "Oui, une grande partie de notre sélection (objets déco, senteurs, petit mobilier) est disponible sur notre boutique en ligne, avec expédition ou retrait en magasin (Click & Collect).",
  },
  {
    question: "Quels produits trouve-t-on en boutique ?",
    answer: "Notre concept store propose du mobilier de créateurs, des luminaires design, du linge de maison, des bougies et senteurs, de la vaisselle ainsi que de nombreuses idées cadeaux originales.",
  },
];

export default async function LocalSeoLandingPage() {
  let homeContent = defaultHomeContent;

  try {
    const settings = await getSiteSettings();
    homeContent = settings.homeContent;
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    console.error("Local SEO page fallback: database unavailable", error);
  }

  // 3. Données structurées Schema.org pour le SEO Local (Google Business)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HomeGoodsStore",
    "name": "Art Home Déco",
    "description": "Boutique de décoration et aménagement d'intérieur à Saint-Gervais-les-Bains.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "96 rue du Mont-Blanc",
      "addressLocality": "Saint-Gervais-les-Bains",
      "postalCode": "74170",
      "addressRegion": "Haute-Savoie",
      "addressCountry": "FR"
    },
    "url": "https://www.arthomedeco.fr"
  };

  return (
    <>
      {/* Injection du JSON-LD pour Google */}
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen overflow-hidden bg-white">
        {/* EN-TÊTE / HERO SECTION */}
        <section className="container mt-10  md:mt-6 mx-auto px-6 pb-24 pt-20 md:px-16 md:pt-24 lg:px-8 xl:max-w-6xl">
          <header className="relative grid items-center gap-8 lg:min-h-155 lg:grid-cols-[minmax(0,1fr)_620px] lg:gap-6">
            <div className="order-1 w-full max-w-130 justify-self-center lg:order-2 lg:w-155 lg:max-w-none lg:justify-self-end">
              <HeroGraphic
                imageUrl={homeContent.heroImageUrl}
                imageAlt={homeContent.heroImageAlt}
              />
            </div>

            <div className="order-2 max-w-2xl lg:order-1 mt-8">
              <span className="mb-6 inline-block text-xs font-mono uppercase tracking-widest text-[#b0a99a]">
                Saint-Gervais-les-Bains (74)
              </span>

              {/* H1 : Mot-clé principal */}
              <h1 className="text-4xl font-light! leading-tight tracking-tight text-neutral-900">
                Art Home Déco
                <br />
                <span className="text-[#b0a99a] font-thin! text-2xl tracking-wide ">à Saint-Gervais-les-Bains</span>
              </h1>

              <p className="mt-8 text-sm leading-7 italic text-slate-600 md:hidden">
                Art Home Déco sélectionne mobilier, luminaires et objets décoratifs à Saint-Gervais-les-Bains, au pied du Mont-Blanc.
              </p>
              <p className="mt-8 hidden text-sm leading-7 italic text-slate-600 md:block">
                Art Home Déco sélectionne avec soin du mobilier, des luminaires, des bougies, du linge de maison et des objets décoratifs uniques pour créer des intérieurs chaleureux. Inspirée par l&apos;art de vivre alpin, notre boutique située au cœur de <strong>Saint-Gervais-les-Bains</strong>, au pied du Mont-Blanc, vous accompagne dans vos projets d&apos;aménagement.
              </p>
              <Link
                href="/boutique"
                className="group my-6 max-w-54 flex h-14 items-center justify-center  bg-neutral-900 px-8 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-stone-500 hover:shadow-lg"
              >
                Voir la boutique
              </Link>
            </div>
          </header>
        </section>

        {/* SECTION CONTENU & FAQ */}
        <section className=" bg-white">
          <div className="container mx-auto grid gap-16 px-6 py-10 md:py-20 md:px-16 lg:grid-cols-2 lg:gap-24 lg:px-8 xl:max-w-6xl">
            
            {/* Colonne 1 : Présentation (H2) */}
            <article>
              <h2 className="font-sans italic text-2xl font-light! leading-7 tracking-[-0.02em] text-neutral-900/80">
                Une adresse déco en Haute-Savoie
              </h2>
              <div className="mt-8 space-y-6 text-sm leading-7 text-slate-600/80">
                <p>
                  Notre concept store accueille les habitants de Saint-Gervais, les propriétaires de chalets, les visiteurs du pays du Mont-Blanc ainsi que tous les amateurs d’intérieurs apaisants et de design.
                </p>
                <p>
                  Vous y trouverez une sélection rigoureuse de pièces pour aménager votre maison : luminaires élégants, petit mobilier d&apos;appoint, parfums d&apos;ambiance, linge de lit, vaisselle raffinée et idées cadeaux, choisis pour leur caractère intemporel et leur qualité de fabrication.
                </p>
              </div>
            </article>

            {/* Colonne 2 : FAQ (H2 et H3) */}
            <aside>
              <h2 className="text-3xl font-light tracking-tight text-neutral-900 ">
                Questions fréquentes
              </h2>
              <div className="mt-8 space-y-8">
                {FAQ_ITEMS.map((item, index) => (
                  <article key={index} className="group">
                    {/* H3 : Questions secondaires pour la longue traîne */}
                    <h3 className="text-md font-bold! text-neutral-900">
                      {item.question}
                    </h3>
                    <p className="mt-3 text-sm leading-5  text-slate-600">
                      {item.answer}
                    </p>
                  </article>
                ))}
              </div>
            </aside>
            
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className=" bg-[#b0a99a]/10 py-20">
          <div className="container mx-auto flex flex-col gap-8 px-6 md:px-16 lg:flex-row lg:items-center lg:justify-between lg:px-8 xl:max-w-6xl">
            <h2 className="max-w-md text-3xl font-light tracking-tight text-neutral-900 md:text-4xl">
              La sélection Art Home Déco
            </h2>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/boutique"
                className="group flex h-14 items-center justify-center  bg-neutral-900 px-8 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-stone-500 hover:shadow-lg"
              >
                Voir la boutique
              </Link>
              <Link
                href="/contact"
                className="flex h-14 items-center justify-center border border-neutral-300 bg-transparent px-8 text-xs font-bold uppercase tracking-widest text-neutral-900 transition-all hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
