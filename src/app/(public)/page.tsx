import type { Metadata } from "next";
import HeroGraphic from "../../components/home/hero-graphic";
import Faq from "../../components/home/faq-accordion";
import { HomeCommitments } from "@/components/home/home-commitments";
import { HomeCategorySpotlight } from "@/components/home/home-category-spotlight";
import { HomeJournalSpotlight } from "@/components/home/home-journal-spotlight";
import { HomeProductSpotlight } from "@/components/home/home-product-spotlight";
import { HomeReassurance } from "@/components/home/home-reassurance";
import { defaultHomeContent } from "@/features/admin-home/types";
import {
  buildLocalBusinessJsonLd,
  stringifyJsonLd,
} from "@/lib/seo/local-business";
import { getSiteSettings } from "@/server/repositories/site-settings.repository";
import { listPublishedBlogPosts } from "@/server/repositories/blog.repository";
import {
  listActiveProducts,
  listHomeSpotlightCategories,
} from "@/server/repositories/catalog.repository";
import { isDatabaseUnavailableError } from "@/server/db/client";

export const metadata: Metadata = {
  title: "Boutique de decoration a Saint-Gervais-les-Bains",
  description:
    "Art Home Déco selectionne mobilier, luminaires, senteurs, textiles et objets deco pour des interieurs chaleureux inspires des Alpes.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Art Home Déco | Boutique de decoration à Saint-Gervais-les-Bains",
    description:
      "Mobilier, luminaires, senteurs, textiles et objets décos selectionnés au pied du Mont-Blanc.",
    url: "/",
  },
};

export default async function Home() {
  let homeContent = defaultHomeContent;
  let blogPosts: Awaited<ReturnType<typeof listPublishedBlogPosts>> = [];
  let products: Awaited<ReturnType<typeof listActiveProducts>> = [];
  let spotlightCategories: Awaited<
    ReturnType<typeof listHomeSpotlightCategories>
  > = [];
  let legal = null;
  let storeStatus = null;

  try {
    const result = await Promise.all([
      getSiteSettings(),
      listPublishedBlogPosts(),
      listActiveProducts(),
      listHomeSpotlightCategories(),
    ]);
    homeContent = result[0].homeContent;
    legal = result[0].legal;
    storeStatus = result[0].storeStatus;
    blogPosts = result[1];
    products = result[2];
    spotlightCategories = result[3];
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
  const localBusinessJsonLd =
    legal && storeStatus ? buildLocalBusinessJsonLd(legal, storeStatus) : null;

  return (
    <>
      {localBusinessJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: stringifyJsonLd(localBusinessJsonLd),
          }}
        />
      ) : null}
      <div
        className="overflow-hidden"
        style={{ backgroundColor: homeContent.homeBackgroundColor }}
      >
        <header className="relative mx-auto grid max-w-[1240px] grid-cols-1 px-6 py-10 md:h-[calc(100svh-72px)] md:min-h-[780px] md:items-center md:px-16 md:py-16 lg:grid-cols-[430px_1fr] lg:px-0 lg:py-20">
          <div className="relative z-50 flex flex-col pl-10 pt-10 md:items-start md:pt-0 md:text-left md:pl-20 lg:pl-24">
            <h1 className="max-w-[390px] mt-8 text-5xl font-thin! leading-[0.96] tracking-[-0.05em] text-[#171717] md:text-6xl">
              Art Home
            </h1>
            <span className="mb-4 text-5xl font-light!  tracking-[-0.05em] text-[#b0a99a]">
              Déco
            </span>

            <h2 className="max-w-[520px] mt-4 text-2xl font-thin! leading-7 tracking-[-0.03em] text-[#171717] md:text-3xl">
              Boutique de décoration
              <br />
              <span className="text-[#b0a99a] text-xl font-light! tracking-[-0.01em]  ">
                {" "}
                À Saint Gervais les Bains
              </span>
            </h2>

            <p className="hidden md:block mt-8 max-w-[420px] text-[14px] italic leading-relaxed text-[#8d8d8d]">
              Art Home Déco sélectionne du mobilier, des luminaires, des
              senteurs, des textiles et des objets de décoration pour créer des
              intérieurs chaleureux, inspirés des Alpes et du Mont-Blanc.
            </p>

            <p className="hidden md:block mt-8 max-w-[420px] text-[14px] italic leading-relaxed text-[#8d8d8d] ">
              Située au cœur de Saint-Gervais-les-Bains, Art Home Déco
              accompagne les habitants, propriétaires de résidences secondaires
              et amoureux du Pays du Mont-Blanc dans le choix d’objets
              décoratifs, textiles, luminaires et pièces de mobilier pour des
              intérieurs chaleureux et durables.
            </p>
          </div>
          <div >
            <HeroGraphic
              imageUrl={homeContent.heroImageUrl}
              imageAlt={homeContent.heroImageAlt}
            />
          </div>
        </header>
        <div className="hidden md:block">
          <HomeReassurance />
        </div>

        <HomeProductSpotlight products={galleryProducts} />

        <div className="hidden md:block">
          <HomeCategorySpotlight categories={spotlightCategories} />
        </div>

        <div className="hidden md:block">
          <HomeCommitments
            label={homeContent.commitmentsLabel}
            title={homeContent.commitmentsTitle}
            paragraph={homeContent.commitmentsParagraph}
            items={[
              {
                title: homeContent.commitmentOneTitle,
                text: homeContent.commitmentOneText,
              },
              {
                title: homeContent.commitmentTwoTitle,
                text: homeContent.commitmentTwoText,
              },
              {
                title: homeContent.commitmentThreeTitle,
                text: homeContent.commitmentThreeText,
              },
              {
                title: homeContent.commitmentFourTitle,
                text: homeContent.commitmentFourText,
              },
              {
                title: homeContent.commitmentFiveTitle,
                text: homeContent.commitmentFiveText,
              },
              {
                title: homeContent.commitmentSixTitle,
                text: homeContent.commitmentSixText,
              },
            ]}
          />
        </div>

        <HomeJournalSpotlight
          posts={journalPosts}
          fallbackImageUrl={homeContent.blogCardImageUrl}
        />

        <Faq />
      </div>
    </>
  );
}
