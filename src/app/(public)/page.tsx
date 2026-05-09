import Image from "next/image";
import { HomeJournalSpotlight } from "@/components/home/home-journal-spotlight";
import { HomeProductSpotlight } from "@/components/home/home-product-spotlight";
import { getSiteSettings } from "@/server/repositories/site-settings.repository";
import { listPublishedBlogPosts } from "@/server/repositories/blog.repository";
import { listActiveProducts } from "@/server/repositories/catalog.repository";

export default async function Home() {
  const { homeContent } = await getSiteSettings();
  const [blogPosts, products] = await Promise.all([
    listPublishedBlogPosts(),
    listActiveProducts(),
  ]);
  const galleryProducts = products
    .filter((product) => product.images[0])
    .slice(0, 6);
  const journalPosts = blogPosts.slice(0, 3);

  return (
    <>
      <style>{`
      .timeline::before {
        content: "";
        position: absolute;
        left: 50%;
        top: 32px;
        width: 1px;
        height: 92px;
        transform: translateX(-50%);
        background-image: linear-gradient(to bottom, #d8d8d8 35%, transparent 0%);
        background-size: 1px 12px;
      }

      .timeline-dot {
        box-shadow: inset 0 0 0 2px #bfbfbf;
      }

      .timeline-dot::after {
        content: "";
        position: absolute;
        inset: 6px;
        border-radius: 999px;
        background: #171717;
      }

      .arrow-line::before {
        content: "";
        position: absolute;
        left: 50%;
        top: 50%;
        width: 1px;
        height: 30px;
        background: #dedede;
        transform: translate(-50%, -50%);
      }

      .flowerpot-img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        mix-blend-mode: multiply;
      }
    `}</style>
      <div
        className="overflow-hidden"
        style={{ backgroundColor: homeContent.homeBackgroundColor }}
      >
        <header className="relative mx-auto mt-[76px] grid min-h-[620px] max-w-[1240px] grid-cols-1 px-6 pt-10 md:min-h-[780px] md:px-16 md:pt-24 lg:grid-cols-[430px_1fr] lg:px-0 lg:pt-32">
          <div className="relative z-10 pl-0 md:pl-20 lg:pl-24">
            <h1 className="mt-8 max-w-[390px] text-[48px] font-light leading-[0.96] tracking-[-0.05em] text-[#171717] md:mt-16 md:text-7xl">
              Art Home
              <br />
              Déco
            </h1>

            <p className="mt-12 max-w-[310px] text-[14px] leading-relaxed text-[#8d8d8d]">
              {homeContent.heroParagraph}
            </p>
          </div>

          <div className="relative mt-8 min-h-[360px] md:mt-16 md:min-h-[460px] lg:mt-0">
            <div className="absolute left-[2%] top-[90px] h-[250px] w-[250px] rounded-full bg-[#f1f1f0] md:left-[14%] md:top-[150px] md:h-[390px] md:w-[390px]" />
            <div className="absolute right-[0%] top-[170px] h-[180px] w-[180px] rounded-full bg-[#f1f1f0] md:right-[3%] md:top-[260px] md:h-[265px] md:w-[265px]" />
            <div className="absolute left-[50%] top-0 h-[300px] w-[180px] rounded-[48%] bg-[#f1f1f0] md:left-[54%] md:h-[420px] md:w-[255px]" />
            <div className="absolute left-[8%] top-[70px] z-10 h-[280px] w-[280px] rounded-full bg-white/45 backdrop-blur-[1px] md:left-[24%] md:top-[110px] md:h-[430px] md:w-[430px]" />

            <figure className="absolute left-[30%] top-[20px] z-20 h-[340px] w-[230px] overflow-hidden rounded-[48%] bg-white/10 shadow-[0_45px_90px_rgba(0,0,0,0.08)] md:left-[38%] md:top-[48px] md:h-[520px] md:w-[360px]">
              <Image
                src={homeContent.heroImageUrl}
                alt={homeContent.heroImageAlt}
                fill
                priority
                sizes="(max-width: 768px) 230px, 360px"
                className="flowerpot-img scale-[1.18] opacity-[0.82] saturate-[0.85] contrast-[1.08]"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/45 via-white/10 to-white/55 mix-blend-screen" />
              <div className="absolute inset-y-0 left-0 w-1/3 bg-white/35 blur-2xl" />
            </figure>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-5 pt-20 md:px-8 md:pt-28">
          <p className="max-w-2xl text-[15px] leading-8 text-[#171717]/65 md:text-[16px]">
            Côté journal, retrouvez nos inspirations, tendances et conseils
            pratiques pour faire dialoguer couleurs, volumes et textures dans un
            esprit calme, élégant et durable.
          </p>
        </div>

        <HomeProductSpotlight products={galleryProducts} />
        <div className="mx-auto max-w-7xl px-5 pt-20 md:px-8 md:pt-28">
          <p className="max-w-2xl text-[15px] leading-8 text-[#171717]/65 md:text-[16px]">
            Côté produit, retrouvez nos inspirations, tendances et conseils
            pratiques pour faire dialoguer couleurs, volumes et textures dans un
            esprit calme, élégant et durable.
          </p>
        </div>
        <div className="pt-10 md:pt-14">
          <HomeJournalSpotlight
            posts={journalPosts}
            fallbackImageUrl={homeContent.blogCardImageUrl}
          />
        </div>
      </div>
    </>
  );
}
