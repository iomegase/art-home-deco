import Link from "next/link";
import Image from "next/image";
import { NewsletterSignupForm } from "@/components/analytics/NewsletterSignupForm";
import { BlogImage } from "@/components/blog/blog-image";
import { getSiteSettings } from "@/server/repositories/site-settings.repository";
import { listPublishedBlogPosts } from "@/server/repositories/blog.repository";
import { listActiveProducts } from "@/server/repositories/catalog.repository";

export default async function Home() {
  const { homeContent } = await getSiteSettings();
  const [blogPosts, products] = await Promise.all([listPublishedBlogPosts(), listActiveProducts()]);
  const galleryProducts = products.filter((product) => product.images[0]).slice(0, 4);
  const journalPosts = blogPosts.slice(0, 3);

  return (
    <div className="overflow-hidden">
      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-14 pt-10 md:grid-cols-[0.95fr_1fr] md:items-center md:px-8 md:pb-20 md:pt-12">
        <div className="overflow-hidden rounded-[42%_58%_48%_52%/48%_45%_55%_52%]">
          <Image
            src={homeContent.heroImageUrl}
            alt={homeContent.heroImageAlt}
            width={1000}
            height={820}
            className="aspect-[1.05/0.85] h-full w-full object-cover"
          />
        </div>

        <div className="max-w-2xl">
          <h1 className="mt-4 max-w-xl text-5xl leading-none text-foreground md:text-7xl">{homeContent.heroTitle}</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-muted">{homeContent.heroParagraph}</p>
          <Link href="/boutique" className="mt-8 inline-flex rounded-full bg-terracotta px-7 py-3 text-sm font-bold text-white transition hover:bg-brand">
            {homeContent.heroCtaLabel}
          </Link>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 pb-20 md:px-8">
        <div className="absolute left-0 right-0 top-1/2 -z-10 h-28 -translate-y-1/2 " />
        <div className="grid gap-5 md:grid-cols-3">
          <Link
            href="/boutique"
            className="group relative min-h-[420px] overflow-hidden rounded-br-[5rem] rounded-tl-[5rem] bg-terracotta text-brand-contrast"
          >
            <Image src={homeContent.collectionCardImageUrl} alt={homeContent.collectionCardImageAlt} fill className="object-cover opacity-35 transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-br from-terracotta/75 via-terracotta/70 to-[#6f3622]/75 transition-opacity duration-500 group-hover:opacity-85" />

            <div className="relative z-10 flex h-full flex-col justify-between p-8 md:p-12">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/80">Collection</span>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-4xl leading-tight md:text-5xl text-white">{homeContent.collectionTitle}</h3>
                {/* <div className="inline-flex h-12 w-12 translate-y-2 items-center justify-center rounded-full bg-white/90 text-terracotta shadow-sm transition-all duration-500 group-hover:translate-y-0 group-hover:rotate-[-45deg]">
                  →
                </div> */}
              </div>
            </div>
          </Link>

          <Link
            href="/contact"
            className="group relative min-h-[420px] overflow-hidden rounded-br-[5rem] rounded-tl-[5rem] bg-[#ece7d8] transition-all hover:bg-[#e5dfce]"
          >
            <Image src={homeContent.adviceCardImageUrl} alt={homeContent.adviceCardImageAlt} fill className="object-cover opacity-25 transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#f6f1e7]/90 via-[#ece7d8]/85 to-[#d7d0bf]/80 transition-opacity duration-500 group-hover:opacity-90" />

            <div className="relative z-10 flex h-full flex-col justify-between p-8 md:p-12">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-foreground/80" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/70">Conseil déco</span>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-4xl leading-tight md:text-5xl text-foreground">{homeContent.adviceTitle}</h3>
                <p className="max-w-[240px] text-sm text-foreground/70 opacity-0 translate-y-2 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  {homeContent.adviceParagraph}
                </p>
                {/* <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-foreground shadow-sm transition-transform duration-500 group-hover:rotate-[-45deg]">
                  →
                </div> */}
              </div>
            </div>
          </Link>

          <Link href="/blog" className="group relative min-h-[420px] overflow-hidden rounded-br-[5rem] rounded-tl-[5rem] bg-accent">
            <Image src={homeContent.blogCardImageUrl} alt={homeContent.blogCardImageAlt} fill className="object-cover mix-blend-multiply opacity-60 " />

            <div className="relative z-10 flex h-full flex-col justify-between p-8 md:p-12">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/80">Inspirations</span>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-4xl leading-tight md:text-5xl text-white">{homeContent.blogCardTitle}</h3>
                <p className="text-sm text-white/70 opacity-0 transition-all duration-500 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                  {homeContent.blogCardParagraph}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 md:grid-cols-[0.9fr_1fr] md:items-center md:px-8">
        <div>
          <p className="text-accent">{homeContent.approachLabel}</p>
          <h2 className="mt-4 max-w-lg text-4xl leading-tight md:text-6xl">{homeContent.approachTitle}</h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted">{homeContent.approachParagraph}</p>
          <Link href="/contact" className="mt-7 inline-flex rounded-full bg-accent px-7 py-3 text-sm font-bold text-brand-contrast transition hover:bg-brand">
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
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <h2 className="text-4xl md:text-5xl">Galerie produits</h2>
        </div>
        <div className="mt-6 flex gap-5 overflow-x-auto px-5 pb-2 md:px-[max(2rem,calc((100vw-80rem)/2+2rem))]">
          {galleryProducts.map((product) => {
            const cover = product.images[0];
            if (!cover) return null;
            return (
              <Link key={product.id} href={`/boutique/${product.slug}`}>
                <Image
                  src={cover.url}
                  alt={cover.alt || product.title}
                  width={700}
                  height={450}
                  className="aspect-square rounded-2xl max-w-sm shrink-0 object-cover w-50"
                />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 grid gap-20 lg:grid-cols-[1fr_0.4fr]">
        <div>
          <h2 className="font-serif text-5xl mb-12">Le Journal</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {journalPosts.map((post) => (
              <article key={post.id} className="group cursor-pointer">
                <div className="overflow-hidden rounded-xl bg-surface">
                  <BlogImage
                    src={post.imageUrl || homeContent.blogCardImageUrl}
                    alt={post.imageAlt || post.title}
                    width={600}
                    height={350}
                    className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <h3 className="mt-4 font-serif text-xl group-hover:text-terracotta transition-colors">{post.title}</h3>
                <Link href={`/blog/${post.slug}`} className="mt-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground">
                  Lire l&apos;article
                </Link>
              </article>
            ))}
          </div>
        </div>

        <aside className="sticky top-24 self-start rounded-[3rem] bg-terracotta p-10 text-white shadow-xl">
          <h2 className="font-serif text-3xl">{homeContent.newsletterTitle}</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/80">{homeContent.newsletterParagraph}</p>
          <NewsletterSignupForm
            placeholder={homeContent.newsletterPlaceholder}
            buttonLabel={homeContent.newsletterButtonLabel}
          />
        </aside>
      </section>
    </div>
  );
}
