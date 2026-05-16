"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PublicBlogPost } from "@/server/repositories/blog.repository";

type Props = {
  posts: PublicBlogPost[];
  fallbackImageUrl: string;
};

function clampWords(value: string, maxWords: number) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return value;
  return words.slice(0, maxWords).join(" ");
}

export function HomeJournalSpotlight({ posts, fallbackImageUrl }: Props) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  if (posts.length === 0) return null;

  const post = posts[index];
  const postTitleClamped = clampWords(post.title, 4);

  const goNext = () => {
    setDirection("next");
    setIndex((current) => (current + 1) % posts.length);
  };

  const goPrev = () => {
    setDirection("prev");
    setIndex((current) => (current - 1 + posts.length) % posts.length);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    const touch = event.changedTouches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    const startX = touchStartXRef.current;
    const startY = touchStartYRef.current;
    if (startX === null || startY === null) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    const horizontalThreshold = 45;

    if (
      Math.abs(deltaX) > Math.abs(deltaY) &&
      Math.abs(deltaX) > horizontalThreshold
    ) {
      if (deltaX < 0) {
        goNext();
      } else {
        goPrev();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  return (
    <>
     {/* ── Section intro — Journal ── */}
      <section className="mx-auto max-w-[1240px] px-6 pt-26 md:px-16 md:pt-10 lg:px-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b0a99a]">
          02 — Journal éditorial
        </p>

        {/* NOUVELLE STRUCTURE : On utilise la même grille que le contenu en dessous (1fr et 480px) */}
        <div className="mt-5 flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_480px]">
          <h2
            className="shrink-0 text-2xl font-thin leading-[0.92] tracking-[-0.04em] text-[#171717] md:text-"
            style={{
              fontFamily:
                'var(--font-elms-sans), "Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
          >
            Conseils décoration 
            <br />
            <span className="text-[#b0a99a]">pour un intérieur chaleureux en montagne</span>
          </h2>
          
          {/* Le lg:pl-10 est la clé : il reproduit le décalage exact du titre "Comment sublimer..." */}
          <div className="lg:flex lg:items-center lg:pl-10">
            <p className="text-[10px] font-bold uppercase leading-[1.8] tracking-[0.1em] text-slate-500 md:text-[12px]">
              Inspirations, tendances et conseils pratiques pour faire dialoguer
              couleurs, volumes et textures dans un esprit élégant et durable.
            </p>
          </div>
        </div>
      </section>

      {/* Correction de la Grid pour avoir exactement les mêmes proportions que les Produits */}
      <section
        className="relative mx-auto flex min-h-[620px] max-w-[1240px] flex-col overflow-x-clip px-6 pb-16 pt-6 md:min-h-[820px] md:px-16 md:pb-24 md:pt-12 lg:grid lg:grid-cols-[1fr_480px] lg:items-center lg:px-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <style>{`
          .journal-panel-next {
            animation: journal-slide-next 320ms ease;
          }
          .journal-panel-prev {
            animation: journal-slide-prev 320ms ease;
          }
          @keyframes journal-slide-next {
            0% { opacity: 0; transform: translateX(16px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          @keyframes journal-slide-prev {
            0% { opacity: 0; transform: translateX(-16px); }
            100% { opacity: 1; transform: translateX(0); }
          }
        `}</style>

        {/* IMAGE — Placée à GAUCHE (order-1) comme pour les produits */}
        <div
          key={`main-image-${post.id}`}
          className={`group relative z-0 flex min-h-[450px] w-full items-center justify-center lg:order-1 lg:min-h-[600px] ${
            direction === "next" ? "journal-panel-next" : "journal-panel-prev"
          }`}
        >
          {/* Blobs d'arrière-plan adaptés en relatif pour rester centrés */}
          <div className="absolute left-[-10%] top-[10%] h-[350px] w-[400px] rotate-[-15deg] rounded-[60%_40%_70%_30%/50%] bg-slate-400/10 mix-blend-multiply blur-[2px] transition-all duration-[3000ms] ease-in-out group-hover:rotate-[-5deg] group-hover:scale-105 group-hover:rounded-[40%_60%_30%_70%/60%_40%_60%_40%] md:left-[8%] md:h-[500px] md:w-[550px]" />
          <div className="absolute left-[45%] top-[-5%] h-[400px] w-[280px] rotate-[15deg] rounded-[40%_60%_30%_70%/60%_40%_60%_40%] bg-slate-200/40 mix-blend-multiply transition-all duration-[4000ms] ease-in-out group-hover:-translate-x-4 group-hover:rotate-[25deg] group-hover:rounded-[70%_30%_50%_50%/30%_70%_40%_60%] md:left-[50%] md:h-[550px] md:w-[350px]" />
          <div className="absolute right-[0%] top-[40%] h-[220px] w-[220px] rotate-[35deg] rounded-[50%_50%_30%_70%/50%_50%_70%_30%] bg-amber-100/20 mix-blend-multiply transition-all duration-[3500ms] ease-in-out group-hover:translate-y-4 group-hover:rotate-[20deg] group-hover:rounded-[30%_70%_60%_40%/50%_40%_60%_50%] md:right-[10%] md:h-[320px] md:w-[320px]" />
          <div className="absolute left-[12%] top-[15%] z-10 h-[320px] w-[320px] rotate-[-8deg] rounded-[45%_55%_50%_50%/50%_50%_45%_55%] border border-white/40 bg-white/30 shadow-sm backdrop-blur-[6px] transition-all duration-[5000ms] ease-in-out group-hover:rotate-[5deg] group-hover:rounded-[55%_45%_60%_40%/45%_55%_40%_60%] md:left-[24%] md:h-[480px] md:w-[480px]" />

          <figure className="absolute left-1/2 top-1/2 z-10 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-transparent md:h-[480px] md:w-[480px]">
            <Image
              src={post.imageUrl || fallbackImageUrl}
              alt={post.imageAlt || post.title}
              fill
              sizes="(max-width: 768px) 320px, 480px"
              className="h-full w-full rounded-[40%_60%_30%_70%/60%_40%_60%_40%] object-cover object-center drop-shadow-sm mix-blend-multiply contrast-[1.05] saturate-[1.1] transition-all duration-[3000ms] ease-in-out group-hover:rounded-[55%_45%_60%_40%/45%_55%_40%_60%]"
            />
          </figure>
        </div>

        {/* CONTENU — Placé à DROITE (order-2) comme pour les produits */}
        <div
          key={`content-${post.id}`}
          className={`relative z-10 mt-8 flex flex-col items-center text-center lg:order-2 lg:mt-0 lg:items-start lg:pl-10 lg:text-left ${
            direction === "next" ? "journal-panel-next" : "journal-panel-prev"
          }`}
        >
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-[#b0a99a] md:mb-6">
            {post.category || "Articles"}
          </p>

          <h2
            className="max-w-[400px] text-[34px] leading-tight tracking-[-0.05em] text-[#171717] md:text-[42px]"
            style={{
              fontFamily:
                'var(--font-elms-sans), "Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
          >
            {postTitleClamped}
          </h2>

          <p className="mt-5 max-w-[350px] text-[14px] leading-relaxed text-slate-600 md:text-[15px]">
            {post.excerpt}
          </p>

          <a
            href={`/blog/${post.slug}`}
            className="mt-8 inline-flex h-[46px] w-[146px] items-center justify-center border border-[#171717] bg-[#171717] text-[11px] font-bold uppercase tracking-widest text-white transition hover:bg-white hover:text-[#171717]"
          >
            Lire l&apos;article
          </a>

          {/* Ergonomie Carrousel : Contrôles regroupés + Pagination horizontale */}
          <div className="mt-12 flex items-center justify-center gap-6 lg:justify-start">
            <button
              type="button"
              aria-label="Article précédent"
              onClick={goPrev}
              className="text-[#171717]/40 transition hover:text-[#171717]"
            >
              <ChevronLeft className="h-8 w-8" strokeWidth={1.5} />
            </button>

            {/* Pagination Horizontale */}
            <div className="flex gap-2">
              {posts.map((_, i) => (
                <span
                  key={i}
                  className={`block h-1.5 rounded-full transition-all duration-500 ease-in-out ${
                    i === index ? "w-6 bg-[#171717]" : "w-1.5 bg-[#171717]/20"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              aria-label="Article suivant"
              onClick={goNext}
              className="text-[#171717]/40 transition hover:text-[#171717]"
            >
              <ChevronRight className="h-8 w-8" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}