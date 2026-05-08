import Link from "next/link";
import Image from "next/image";
import { NewsletterSignupForm } from "@/components/analytics/NewsletterSignupForm";
import { BlogImage } from "@/components/blog/blog-image";
import { HomeJournalSpotlight } from "@/components/home/home-journal-spotlight";
import { ProductImageFallback } from "@/components/product/product-image-fallback";
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
    .slice(0, 4);
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
      <div className="overflow-hidden" style={{ backgroundColor: homeContent.homeBackgroundColor }}>
        <header className="relative mx-auto mt-[76px] grid min-h-[780px] max-w-[1240px] grid-cols-1 px-6 pt-24 md:px-16 lg:grid-cols-[430px_1fr] lg:px-0 lg:pt-32">
      <div className="relative z-10 pl-0 md:pl-20 lg:pl-24">
        <h1 className="mt-16 max-w-[390px] text-[48px] font-light leading-[0.96] tracking-[-0.05em] text-[#171717] md:text-7xl">
          Art Home
          <br />
          Déco
        </h1>

        <p className="mt-12 max-w-[310px] text-[14px] leading-relaxed text-[#8d8d8d]">
          {homeContent.heroParagraph}
        </p>
      </div>

      <div className="relative mt-16 min-h-[460px] lg:mt-0">
        <div className="absolute left-[8%] top-[150px] h-[390px] w-[390px] rounded-full bg-[#f1f1f0] md:left-[14%]" />
        <div className="absolute right-[3%] top-[260px] h-[265px] w-[265px] rounded-full bg-[#f1f1f0]" />
        <div className="absolute left-[54%] top-0 h-[420px] w-[255px] rounded-[48%] bg-[#f1f1f0]" />
        <div className="absolute left-[18%] top-[110px] z-10 h-[430px] w-[430px] rounded-full bg-white/45 backdrop-blur-[1px] md:left-[24%]" />

        <figure className="absolute left-[30%] top-[48px] z-20 h-[520px] w-[360px] overflow-hidden rounded-[48%] bg-white/10 shadow-[0_45px_90px_rgba(0,0,0,0.08)] md:left-[38%]">
          <img
            src={homeContent.heroImageUrl}
            alt={homeContent.heroImageAlt}
            className="flowerpot-img scale-[1.18] opacity-[0.82] saturate-[0.85] contrast-[1.08]"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/45 via-white/10 to-white/55 mix-blend-screen" />
          <div className="absolute inset-y-0 left-0 w-1/3 bg-white/35 blur-2xl" />
        </figure>
      </div>
    </header>

        {/* <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 md:grid-cols-[0.9fr_1fr] md:items-center md:px-8">
          <div>
            <p className="text-accent">{homeContent.approachLabel}</p>
            <h2 className="mt-4 max-w-lg text-4xl leading-tight md:text-6xl">
              {homeContent.approachTitle}
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted">
              {homeContent.approachParagraph}
            </p>
            <Link
              href="/contact"
              className="mt-7 inline-flex rounded-full bg-accent px-7 py-3 text-sm font-bold text-brand-contrast transition hover:bg-brand"
            >
              {homeContent.approachCtaLabel}
            </Link>
          </div>
          <div className="overflow-hidden rounded-[42%_58%_48%_52%/48%_45%_55%_52%]">
            <Image
              src={homeContent.approachImageUrl}
              alt={homeContent.approachImageAlt}
              width={1000}
              height={820}
              className="aspect-[1.05/0.85] h-full w-full object-cover"
            />
          </div>
        </section> */}

        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <h2 className="text-4xl md:text-5xl">Galerie produits</h2>
          </div>
          <div className="mt-6 flex gap-5 overflow-x-auto px-5 pb-2 md:px-[max(2rem,calc((100vw-80rem)/2+2rem))]">
            {galleryProducts.map((product) => {
              const cover = product.images[0];
              return (
                <Link key={product.id} href={`/boutique/${product.slug}`}>
                  <ProductImageFallback
                    src={cover?.url}
                    alt={cover?.alt || product.title}
                    width={700}
                    height={450}
                    className="aspect-square rounded-2xl max-w-sm shrink-0 object-cover w-50"
                  />
                </Link>
              );
            })}
          </div>
        </section>
        <HomeJournalSpotlight
          posts={journalPosts}
          fallbackImageUrl={homeContent.blogCardImageUrl}
        />
      </div>
    </>
  );
}
