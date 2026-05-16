import type { Metadata } from "next";
import Image from "next/image";
import { HomeJournalSpotlight } from "@/components/home/home-journal-spotlight";
import { HomeProductSpotlight } from "@/components/home/home-product-spotlight";
import { defaultHomeContent } from "@/features/admin-home/types";
import {
  buildLocalBusinessJsonLd,
  stringifyJsonLd,
} from "@/lib/seo/local-business";
import { getSiteSettings } from "@/server/repositories/site-settings.repository";
import { listPublishedBlogPosts } from "@/server/repositories/blog.repository";
import { listActiveProducts } from "@/server/repositories/catalog.repository";
import { isDatabaseUnavailableError } from "@/server/db/client";

export const metadata: Metadata = {
  title: "Boutique de decoration a Saint-Gervais-les-Bains",
  description:
    "Art Home Déco selectionne mobilier, luminaires, senteurs, textiles et objets deco pour des interieurs chaleureux inspires des Alpes.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Art Home Déco | Boutique de decoration a Saint-Gervais-les-Bains",
    description:
      "Mobilier, luminaires, senteurs, textiles et objets deco selectionnes au pied du Mont-Blanc.",
    url: "/",
  },
};

export default async function Home() {
  let homeContent = defaultHomeContent;
  let blogPosts: Awaited<ReturnType<typeof listPublishedBlogPosts>> = [];
  let products: Awaited<ReturnType<typeof listActiveProducts>> = [];
  let legal = null;
  let storeStatus = null;

  try {
    const result = await Promise.all([
      getSiteSettings(),
      listPublishedBlogPosts(),
      listActiveProducts(),
    ]);
    homeContent = result[0].homeContent;
    legal = result[0].legal;
    storeStatus = result[0].storeStatus;
    blogPosts = result[1];
    products = result[2];
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    console.error("Home page fallback: database unavailable", error);
  }

  const galleryProducts = products
    .filter((product) => product.images[0])
    .slice(0, 6);
  const journalPosts = blogPosts.slice(0, 3);
  const localBusinessJsonLd = legal && storeStatus ? buildLocalBusinessJsonLd(legal, storeStatus) : null;

  return (
    <>
      {localBusinessJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: stringifyJsonLd(localBusinessJsonLd) }}
        />
      ) : null}
      <div
        className="overflow-hidden"
        style={{ backgroundColor: homeContent.homeBackgroundColor }}
      >
        <header className="relative mx-auto  grid h-[calc(100svh-72px)] min-h-[620px] max-w-[1240px] grid-cols-1 items-center px-6 py-10 md:min-h-[780px] md:px-16 md:py-16 lg:grid-cols-[430px_1fr] lg:px-0 lg:py-20">
          <div className="relative z-10 flex flex-col pl-10 pt-10 md:items-start md:pt-0 md:text-left md:pl-20 lg:pl-24">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b0a99a]">
              Art Home Déco
            </p>
            <h1 className="max-w-[520px] text-[42px] font-thin leading-[0.96] tracking-[-0.05em] text-[#171717] md:text-[64px]">
              Boutique de decoration
              <br />
              <span className="text-[#b0a99a]">a Saint-Gervais-les-Bains</span>
            </h1>

            <p className="mt-8 max-w-[420px] text-[14px] leading-relaxed text-[#8d8d8d] md:block">
              Art Home Déco selectionne mobilier, luminaires, senteurs, textiles et objets deco pour creer des
              interieurs chaleureux inspires des Alpes et du Mont-Blanc.
            </p>
          </div>

          <div className="relative -mt-8 min-h-[360px] md:mt-12 md:min-h-[460px] lg:mt-0">
            <div className="absolute left-[2%] top-[90px] h-[250px] w-[250px] rounded-full bg-[#f1f1f0] md:left-[14%] md:top-[150px] md:h-[390px] md:w-[390px]" />
            <div className="absolute right-[0%] top-[170px] h-[180px] w-[180px] rounded-full bg-[#f1f1f0] md:right-[3%] md:top-[260px] md:h-[265px] md:w-[265px]" />
            <div className="absolute left-[50%] top-0 h-[300px] w-[180px] rounded-[48%] bg-[#f1f1f0] md:left-[54%] md:h-[420px] md:w-[255px]" />
            <div className="absolute left-[8%] top-[70px] z-10 h-[280px] w-[280px] rounded-full bg-white/45 backdrop-blur-[1px] md:left-[24%] md:top-[110px] md:h-[430px] md:w-[430px]" />

            <figure className="absolute left-1/2 top-[-8px] z-20 h-[340px] w-[230px] -translate-x-1/2 overflow-hidden rounded-[48%] bg-white/10 shadow-[0_45px_90px_rgba(0,0,0,0.08)] md:left-[38%] md:top-[48px] md:h-[520px] md:w-[360px] md:translate-x-0">
              <Image
                src={homeContent.heroImageUrl}
                alt={homeContent.heroImageAlt}
                fill
                priority
                sizes="(max-width: 768px) 230px, 360px"
                className="flowerpot-img scale-[1.18] opacity-[0.82] saturate-[0.85] contrast-[1.08]"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/45 via-white/10 to-white/55 mix-blend-screen" />
              <div className="lamp-glow-breathe pointer-events-none absolute left-[44%] top-[70%] z-30 h-[34%] w-[36%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f4e4b7]/60 blur-2xl" />
              <div className="lamp-glow-flicker pointer-events-none absolute left-[44%] top-[58%] z-30 h-[34%] w-[36%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f9edd0]/55 blur-[34px]" />
              <div className="absolute inset-y-0 left-0 w-1/3 bg-white/35 blur-2xl" />
            </figure>
          </div>
        </header>
        {/* ── Section intro — Galerie produits ── */}
     

        <HomeProductSpotlight products={galleryProducts} />

        

        <HomeJournalSpotlight
          posts={journalPosts}
          fallbackImageUrl={homeContent.blogCardImageUrl}
        />

        <section className="mx-auto max-w-[1240px] px-6 pb-24 pt-6 md:px-16 lg:px-0">
          <div className="max-w-[760px]">
            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b0a99a]">
              FAQ locale
            </p>
            <h2 className="text-[34px] font-[300] leading-[1.05] tracking-[-0.03em] text-[#171717] md:text-[44px]">
              Ou trouver une boutique de decoration a Saint-Gervais-les-Bains ?
            </h2>
            <div className="mt-8 space-y-5 text-[14px] leading-7 text-slate-600">
              <p>
                <strong className="text-[#171717]">Ou se trouve Art Home Déco ?</strong>
                <br />
                Art Home Déco est une boutique de decoration situee au 96 rue du Mont-Blanc, 74170
                Saint-Gervais-les-Bains.
              </p>
              <p>
                <strong className="text-[#171717]">Quels produits trouve-t-on chez Art Home Déco ?</strong>
                <br />
                La boutique propose une selection de mobilier, luminaires, linge de maison, vaisselle, senteurs
                et objets de decoration.
              </p>
              <p>
                <strong className="text-[#171717]">Peut-on acheter en ligne ?</strong>
                <br />
                Oui, une partie de la selection est disponible sur arthomedeco.fr selon les stocks disponibles.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
