"use client";

import { useState } from "react";
import Image from "next/image";
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

  return (
    <section className="relative mx-auto grid min-h-[820px] max-w-[1240px] grid-cols-1 items-center gap-16 overflow-x-clip px-6 pb-28 pt-20 md:px-16 lg:grid-cols-[430px_1fr_230px] lg:px-0">
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
      {/* hey codex je suis front end je dois se retrouver au dessus de background  */}
      <div className="absolute left-0 top-0 " />
      <aside className="timeline absolute left-6 top-24 hidden h-[150px] w-8 md:left-16 md:block lg:left-0">
        <span className="timeline-dot relative mx-auto block h-5 w-5 rounded-full" />
      </aside>

      <div
        key={`content-${post.id}`}
        className={`relative z-10 pl-0 md:pl-20 lg:pl-24 ${direction === "next" ? "journal-panel-next" : "journal-panel-prev"}`}
      >
        <p className="relative z-10 mb-16 text-[12px] font-extrabold uppercase leading-relaxed tracking-[0.14em]">
          {post.category || "Aticles"}
        </p>

        <h2
          className="relative z-10 max-w-[350px] text-[48px] font-[300] leading-[0.96] tracking-[-0.05em] text-[#171717] md:text-[68px]"
          style={{
            fontFamily:
              'var(--font-elms-sans), "Helvetica Neue", Helvetica, Arial, sans-serif',
          }}
        >
          {postTitleClamped}
          <br />
        </h2>

        <p className="relative z-10 mt-12 max-w-[300px] text-[12px] font-bold uppercase leading-5 tracking-[0.14em] text-slate-800">
          {post.excerpt}
        </p>

        <a
          href={`/blog/${post.slug}`}
          className="relative z-10 mt-12 inline-flex h-[48px] w-[146px] items-center justify-center border border-[#dedede] bg-white/85 text-[11px] font-bold uppercase tracking-[0.16em] transition hover:border-[#171717] hover:text-[#171717]"
        >
          Lire l&apos;article
        </a>
    
        <div className="arrow-line relative z-10 mt-24 flex w-[105px] items-center justify-between text-[38px] font-extralight text-[#171717]/70">
          <button type="button" aria-label="Article précédent" onClick={goPrev}>
            <span>←</span>
          </button>
          <button type="button" aria-label="Article suivant" onClick={goNext}>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* hey codex cette partie doit se retrouver sous le contenu principal */}
      <div className="absolute inset-x-0 top-[300px] space-y-7 z-0 lg:relative lg:col-span-2 lg:top-0 lg:grid lg:grid-cols-[1fr_230px]">
        <div
          key={`main-image-${post.id}`}
          className={`group relative min-h-[600px] ${direction === "next" ? "journal-panel-next" : "journal-panel-prev"}`}
        >
          {/* 1. Pétale de fond (Nuage de base) */}
          <div className="absolute left-[-10%] top-[120px] h-[350px] w-[400px] rotate-[-15deg] rounded-[60%_40%_70%_30%/50%] bg-slate-400/10 mix-blend-multiply blur-[2px] transition-all duration-[3000ms] ease-in-out group-hover:rotate-[-5deg] group-hover:scale-105 group-hover:rounded-[40%_60%_30%_70%/60%_40%_60%_40%] md:left-[8%] md:top-[130px] md:h-[500px] md:w-[550px]" />

          {/* 2. Pétale de structure (Élancé) */}
          <div className="absolute left-[45%] top-[-20px] h-[400px] w-[280px] rotate-[15deg] rounded-[40%_60%_30%_70%/60%_40%_60%_40%] bg-slate-200/40 mix-blend-multiply transition-all duration-[4000ms] ease-in-out group-hover:-translate-x-4 group-hover:rotate-[25deg] group-hover:rounded-[70%_30%_50%_50%/30%_70%_40%_60%] md:left-[50%] md:h-[550px] md:w-[350px]" />

          {/* 3. Pétale d'accent (Lumière chaude) */}
          <div className="absolute right-[0%] top-[240px] h-[220px] w-[220px] rotate-[35deg] rounded-[50%_50%_30%_70%/50%_50%_70%_30%] bg-amber-100/20 mix-blend-multiply transition-all duration-[3500ms] ease-in-out group-hover:translate-y-4 group-hover:rotate-[20deg] group-hover:rounded-[30%_70%_60%_40%/50%_40%_60%_50%] md:right-[10%] md:top-[340px] md:h-[320px] md:w-[320px]" />

          {/* 4. Le voile de verre (Celui qui unifie tout) */}
          <div className="absolute left-[12%] top-[80px] z-10 h-[320px] w-[320px] rotate-[-8deg] rounded-[45%_55%_50%_50%/50%_50%_45%_55%] border border-white/40 bg-white/30 shadow-sm backdrop-blur-[6px] transition-all duration-[5000ms] ease-in-out group-hover:rotate-[5deg] group-hover:rounded-[55%_45%_60%_40%/45%_55%_40%_60%] md:left-[24%] md:top-[120px] md:h-[480px] md:w-[480px]" />

          {/* L'image principale (en forme de pétale) */}
          <figure className="absolute left-[60%] top-[110px] z-10 h-[400px] w-[400px] -translate-x-1/2 overflow-hidden bg-transparent">
            <Image
              src={post.imageUrl || fallbackImageUrl}
              alt={post.imageAlt || post.title}
              fill
              sizes="300px"
              className="h-[400px] drop-shadow-sm  object-cover rounded-[40%_60%_30%_70%/60%_40%_60%_40%] object-center mix-blend-multiply contrast-[1.05] saturate-[1.1] transition-all duration-[3000ms] ease-in-out group-hover:rounded-[55%_45%_60%_40%/45%_55%_40%_60%] md:left-[24%] md:top-[120px] md:h-[480px] md:w-[480px] "
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
