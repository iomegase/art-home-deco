"use client";

import { useRef, useState } from "react";
import NextLink from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductImageFallback } from "@/components/product/product-image-fallback";
import { formatPriceCents } from "@/features/product/format";

type SpotlightProduct = {
  id: string;
  slug: string;
  title: string;
  priceCents: number;
  images: Array<{ url: string; alt: string | null }>;
  shortDescription?: string | null;
  description?: string | null;
  categories?: Array<{ category?: { title?: string | null } }>;
};

type Props = {
  products: SpotlightProduct[];
};

function clampWords(value: string, maxWords: number) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return value;
  return words.slice(0, maxWords).join(" ");
}

export function HomeProductSpotlight({ products }: Props) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  if (products.length === 0) return null;

  const product = products[index];
  const cover = product.images[0];
  const title = clampWords(product.title, 4);
  const category =
    product.categories?.[0]?.category?.title || "Galerie produits";

  const goNext = () => {
    setDirection("next");
    setIndex((current) => (current + 1) % products.length);
  };

  const goPrev = () => {
    setDirection("prev");
    setIndex((current) => (current - 1 + products.length) % products.length);
  };

  const animClass =
    direction === "next" ? "product-panel-next" : "product-panel-prev";

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
      <div className="mx-auto max-w-[1240px] px-6 pt-14 md:px-16 lg:px-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#bd9254]">
          01 — Galerie produits
        </p>
        <div className="mt-5 flex flex-col justify-between gap-6 md:flex-row">
          <h2
            className="shrink-0 text-[42px] font-thin leading-[0.92] tracking-[-0.04em] text-[#171717] md:text-[56px]"
            style={{
              fontFamily:
                'var(--font-elms-sans), "Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
          >
            Côté
            <br />
            <span className="text-[#b0a99a]">Produits.</span>
          </h2>
          {/* Correction : "sélectionnées" -> "sélectionnés" et assombrissement léger du gris pour l'accessibilité */}
          <p className="text-[10px] font-bold uppercase leading-[1.8] tracking-[0.1em] text-slate-500 md:max-w-[400px] md:text-[12px]">
            Retrouvez nos articles sélectionnés pour faire dialoguer couleurs,
            volumes et textures dans un esprit calme, élégant et durable.
          </p>
        </div>
      </div>

      <section
        className="relative mx-auto flex min-h-[620px] max-w-[1240px] flex-col overflow-x-clip px-6 pb-10 pt-6 md:min-h-[820px] md:px-16 md:pb-24 md:pt-12 lg:grid lg:grid-cols-[1fr_480px] lg:items-center lg:px-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* IMAGE — Placée en premier dans le flux sur mobile (flex-col) mais à gauche sur Desktop (lg:order-1) */}
        <div
          key={`image-${product.id}`}
          className={`group relative z-0 flex min-h-[450px] w-full items-center justify-center lg:order-1 lg:min-h-[600px] ${animClass}`}
        >
          {/* Formes d'arrière-plan (Blobs) adaptées pour rester relatives au conteneur */}
          <div className="absolute left-[-10%] top-[10%] h-[350px] w-[400px] rotate-[-15deg] rounded-[60%_40%_70%_30%/50%] bg-slate-400/10 mix-blend-multiply blur-[2px] transition-all duration-[3000ms] ease-in-out group-hover:rotate-[-5deg] group-hover:scale-105 group-hover:rounded-[40%_60%_30%_70%/60%_40%_60%_40%] md:left-[8%] md:h-[500px] md:w-[550px]" />
          <div className="absolute left-[45%] top-[-5%] h-[400px] w-[280px] rotate-[15deg] rounded-[40%_60%_30%_70%/60%_40%_60%_40%] bg-slate-200/40 mix-blend-multiply transition-all duration-[4000ms] ease-in-out group-hover:-translate-x-4 group-hover:rotate-[25deg] group-hover:rounded-[70%_30%_50%_50%/30%_70%_40%_60%] md:left-[50%] md:h-[550px] md:w-[350px]" />
          <div className="absolute right-[0%] top-[40%] h-[220px] w-[220px] rotate-[35deg] rounded-[50%_50%_30%_70%/50%_50%_70%_30%] bg-amber-100/20 mix-blend-multiply transition-all duration-[3500ms] ease-in-out group-hover:translate-y-4 group-hover:rotate-[20deg] group-hover:rounded-[30%_70%_60%_40%/50%_40%_60%_50%] md:right-[10%] md:h-[320px] md:w-[320px]" />
          <div className="absolute left-[12%] top-[15%] z-10 h-[320px] w-[320px] rotate-[-8deg] rounded-[45%_55%_50%_50%/50%_50%_45%_55%] border border-white/40 bg-white/30 shadow-sm backdrop-blur-[6px] transition-all duration-[5000ms] ease-in-out group-hover:rotate-[5deg] group-hover:rounded-[55%_45%_60%_40%/45%_55%_40%_60%] md:left-[24%] md:h-[480px] md:w-[480px]" />

          {/* L'image produit est maintenant parfaitement centrée */}
          <figure className="absolute left-1/2 top-1/2 z-10 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-transparent md:h-[480px] md:w-[480px]">
            <ProductImageFallback
              src={cover?.url}
              alt={cover?.alt || product.title}
              fill
              sizes="(max-width: 768px) 320px, 480px"
              className="h-full w-full rounded-[40%_60%_30%_70%/60%_40%_60%_40%] object-cover object-center mix-blend-multiply contrast-[1.05] saturate-[1.1] transition-all duration-[3000ms] ease-in-out group-hover:rounded-[55%_45%_60%_40%/45%_55%_40%_60%]"
            />
          </figure>
        </div>

        {/* CONTENU — Apparaît sous l'image sur Mobile, et à droite sur Desktop (lg:order-2) */}
        <div
          key={`content-${product.id}`}
          className={`relative z-10 mt-8 flex flex-col items-center text-center lg:order-2 lg:mt-0 lg:items-start lg:pl-10 lg:text-left ${animClass}`}
        >
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#bd9254]">
            {category}
          </p>

          <h2
            className="text-[34px] font-[300] leading-[0.96] tracking-[-0.05em] text-[#171717] md:text-[42px]"
            style={{
              fontFamily:
                'var(--font-elms-sans), "Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
          >
            {title}
          </h2>

          {/* Ordre logique : Titre -> Prix -> Bouton */}
          <p className="mt-4 text-[28px] font-mono tracking-[-0.02em] text-[#8c8577] md:text-[32px]">
            {formatPriceCents(product.priceCents)}
          </p>

          <NextLink
            href={`/boutique/${product.slug}`}
            className="mt-8 inline-flex h-[46px] w-[146px] items-center justify-center border border-[#171717] bg-[#171717] text-[11px] font-bold uppercase tracking-widest text-white transition hover:bg-white hover:text-[#171717]"
          >
            Ajouter au panier
          </NextLink>

          {/* Contrôles du carrousel regroupés et Pagination ajoutée */}
          <div className="mt-12 flex items-center justify-center gap-6 lg:justify-start">
            <button
              type="button"
              aria-label="Produit précédent"
              onClick={goPrev}
              className="text-[#171717]/40 transition hover:text-[#171717]"
            >
              <ChevronLeft className="h-8 w-8" strokeWidth={1.5} />
            </button>

            {/* Pagination Horizontale (remplace l'ancienne Aside verticale) */}
            <div className="flex gap-2">
              {products.map((_, i) => (
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
              aria-label="Produit suivant"
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