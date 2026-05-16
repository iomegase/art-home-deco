import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { BlogImage } from "@/components/blog/blog-image";
import { buildBlogImageAlt } from "@/features/blog/seo";
import { listPublishedBlogPosts } from "@/server/repositories/blog.repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Journal decoration et inspirations maison",
  description:
    "Guides d'achat, conseils decoration, inspirations maison et art de vivre alpin signes Art Home Déco.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Journal decoration | Art Home Déco",
    description:
      "Guides d'achat, conseils decoration, inspirations maison et art de vivre alpin signes Art Home Déco.",
    url: "/blog",
  },
};

export default async function BlogPage() {
  const posts = await listPublishedBlogPosts();

  let postPointer = 0;

  const layoutSchema = [
    { type: "post" }, { type: "post" }, { type: "post" }, { type: "post" },
    { type: "featured" },
    { type: "post" },
    { type: "logo" },
    { type: "post" }, { type: "post" },
    { type: "featured" },
    { type: "post" }, { type: "post" }, { type: "post" }, { type: "post" },
    { type: "post" }, { type: "post" }, { type: "post" }, { type: "post" },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* ── Header ── */}
      <header className="mx-auto max-w-[1240px] px-6 pb-16 pt-20 md:px-16 md:pt-28 lg:px-0">
        <p className="mb-6 mt-8 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b0a99a]">
          Journal
        </p>
        <h1 className="text-4xl font-thin! leading-[0.92] tracking-[-0.04em] text-[#171717] md:text-6xl">
          L&apos;Inspiration
          <br />
          <span className="text-[#b0a99a]">Éditoriale.</span>
        </h1>
        <p className="mt-10 max-w-[440px] text-[12px] font-bold uppercase leading-6 tracking-[0.12em] text-slate-500">
          Conseils déco, guides d&apos;achat et inspirations pour un intérieur qui vous ressemble.
        </p>
      </header>

      {/* ── Galerie mosaïque ── */}
      <section className="mx-auto grid max-w-[1240px] grid-cols-2 gap-2 px-6 pb-24 sm:grid-cols-3 md:grid-cols-4 md:px-16 lg:grid-cols-6 lg:px-0">
        {layoutSchema.map((item, index) => {
          // Carte logo
          if (item.type === "logo") {
            return (
              <div
                key={`logo-${index}`}
                className="relative aspect-square overflow-hidden bg-[#f6f5f3]"
              >
                <Image
                  src="/logo.png"
                  alt="Logo Art Home Déco"
                  fill
                  className="object-contain p-6 opacity-40"
                  priority
                />
              </div>
            );
          }

          // Articles
          const currentPost = posts[postPointer];
          if (!currentPost) return null;
          postPointer++;

          const isFeatured = item.type === "featured";

          return (
            <article
              key={currentPost.id}
              className={`group relative aspect-square cursor-pointer overflow-hidden bg-[#f6f5f3] ${
                isFeatured ? "lg:col-span-2 lg:row-span-2" : ""
              }`}
            >
              <Link href={`/blog/${currentPost.slug}`} className="absolute inset-0 z-0">
                <BlogImage
                  src={currentPost.imageUrl}
                  alt={buildBlogImageAlt(currentPost)}
                  fill
                  sizes={
                    isFeatured
                      ? "(max-width: 1024px) 100vw, 33vw"
                      : "(max-width: 1024px) 50vw, 16vw"
                  }
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                />

                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#171717]/50 p-6 text-center opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-100">
                  <div
                    className={`flex flex-col items-center transition-transform duration-500 translate-y-2 group-hover:translate-y-0 ${
                      isFeatured ? "gap-10" : "gap-4"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rotate-45 bg-[#b0a99a]" />
                      <span
                        className={`font-bold uppercase tracking-[0.18em] text-white/90 ${
                          isFeatured ? "text-[11px]" : "text-[9px]"
                        }`}
                      >
                        {currentPost.category ?? "Déco"}
                      </span>
                    </div>

                    <div
                      className={`border border-white/40 ${
                        isFeatured ? "px-8 py-3" : "px-5 py-2"
                      }`}
                    >
                      <span
                        className={`font-bold uppercase tracking-[0.28em] text-white ${
                          isFeatured ? "text-[12px]" : "text-[10px]"
                        }`}
                      >
                        Lire
                      </span>
                    </div>

                    <h2
                      className={`font-[300] leading-snug text-white line-clamp-2 ${
                        isFeatured ? "max-w-[260px] text-xl" : "max-w-[150px] text-sm"
                      }`}
                    >
                      {currentPost.title}
                    </h2>
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </section>

      {/* ── Footer strip → Boutique ── */}
      <section className="border-t border-[#e5e7eb] py-24">
        <div className="mx-auto max-w-[1240px] px-6 md:px-16 lg:px-0">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b0a99a]">
                Boutique
              </p>
              <h2 className="max-w-[520px] text-[40px] font-[300] leading-[0.94] tracking-[-0.03em] text-[#171717] md:text-[56px]">
                Découvrez notre sélection de pièces
              </h2>
            </div>
            <Link
              href="/boutique"
              className="inline-flex h-[48px] shrink-0 items-center justify-center border border-[#dedede] px-10 text-[11px] font-bold uppercase tracking-[0.16em] transition hover:border-[#171717]"
            >
              Voir la boutique
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
