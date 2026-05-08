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
    <section className="relative mx-auto grid min-h-[820px] max-w-[1240px] grid-cols-1 items-center gap-16 px-6 pb-28 pt-20 md:px-16 lg:grid-cols-[430px_1fr_230px] lg:px-0">
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

      <aside className="timeline absolute left-6 top-24 hidden h-[150px] w-8 md:left-16 md:block lg:left-0">
        <span className="timeline-dot relative mx-auto block h-5 w-5 rounded-full" />
      </aside>

      <div key={`content-${post.id}`} className={`relative z-10 pl-0 md:pl-20 lg:pl-24 ${direction === "next" ? "journal-panel-next" : "journal-panel-prev"}`}>
        <p className="mb-16 text-[12px] font-extrabold uppercase leading-relaxed tracking-[0.14em]">
          {post.category || "Aticles"}
        </p>

        <h2 className="max-w-[300px] text-[48px] font-[300] leading-[0.96] tracking-[-0.05em] text-[#171717] md:text-[68px]">
          {postTitleClamped}
          <br />
        </h2>

        <p className="mt-12 max-w-[260px] text-[14px] leading-relaxed text-[#8d8d8d]">
          {post.excerpt}
        </p>

        <a
          href={`/blog/${post.slug}`}
          className="mt-12 inline-flex h-[48px] w-[146px] items-center justify-center border border-[#dedede] bg-white text-[11px] font-bold uppercase tracking-[0.16em] transition hover:border-[#171717] hover:text-[#171717]"
        >
          Voir l article
        </a>

        <div className="arrow-line relative mt-24 flex w-[105px] items-center justify-between text-[38px] font-extralight text-[#171717]/70">
          <button type="button" aria-label="Article précédent" onClick={goPrev}>
            <span>←</span>
          </button>
          <button type="button" aria-label="Article suivant" onClick={goNext}>
            <span>→</span>
          </button>
        </div>
      </div>

      <div key={`main-image-${post.id}`} className={`relative min-h-[600px] ${direction === "next" ? "journal-panel-next" : "journal-panel-prev"}`}>
        <div className="absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[#f1f1f0]" />

        <figure className="relative absolute left-1/2 top-[110px] z-10 h-[390px] w-[300px] -translate-x-1/2 overflow-hidden">
          <Image
            src={post.imageUrl || fallbackImageUrl}
            alt={post.imageAlt || post.title}
            fill
            sizes="300px"
            className="h-full w-full object-cover object-center opacity-90 mix-blend-multiply saturate-[0.9] contrast-[1.02]"
          />
        </figure>
      </div>

      <div key={`side-image-${post.id}`} className={`relative hidden min-h-[560px] lg:block ${direction === "next" ? "journal-panel-next" : "journal-panel-prev"}`}>
        <div className="absolute left-2 top-0 h-[150px] w-[150px] overflow-hidden rounded-full bg-[#f1f1f0]">
          <figure className="relative absolute left-[18px] top-[16px] h-[150px] w-[115px] overflow-hidden">
            <Image
              src={post.imageUrl || fallbackImageUrl}
              alt={post.imageAlt || post.title}
              fill
              sizes="115px"
              className="h-full w-full object-cover object-center opacity-90 mix-blend-multiply saturate-[0.9] contrast-[1.02]"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
