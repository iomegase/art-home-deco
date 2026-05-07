"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ProductImageFallback } from "@/components/product/product-image-fallback";

type ProductGalleryImage = {
  id: string;
  url: string;
  alt: string | null;
  position: number;
};

type ProductGalleryProps = {
  productTitle: string;
  images: ProductGalleryImage[];
};

export function ProductGallery({ productTitle, images }: ProductGalleryProps) {
  const galleryImages = useMemo(() => {
    if (images.length > 0) {
      return images;
    }

    return [
      {
        id: "fallback-logo",
        url: "/logo.png",
        alt: productTitle,
        position: 0,
      },
    ];
  }, [images, productTitle]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasMultipleImages = galleryImages.length > 1;
  const safeSelectedIndex = Math.min(selectedIndex, galleryImages.length - 1);
  const selectedImage = galleryImages[safeSelectedIndex] ?? galleryImages[0];

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsModalOpen(false);
        return;
      }

      if (event.key === "ArrowLeft" && hasMultipleImages) {
        setSelectedIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length);
      }

      if (event.key === "ArrowRight" && hasMultipleImages) {
        setSelectedIndex((current) => (current + 1) % galleryImages.length);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [galleryImages.length, hasMultipleImages, isModalOpen]);

  function goToPrevious() {
    setSelectedIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length);
  }

  function goToNext() {
    setSelectedIndex((current) => (current + 1) % galleryImages.length);
  }

  return (
    <>
      <div className="grid gap-4">
        <div className="relative overflow-hidden rounded-[2rem] border border-line bg-white shadow-[0_18px_50px_rgba(0,0,0,0.04)]">
          <div className="relative aspect-[4/5] min-h-[24rem] bg-[radial-gradient(circle_at_top,var(--surface),white_62%)] p-6 md:min-h-[34rem] md:p-8">
            {hasMultipleImages ? (
              <>
                <button
                  type="button"
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/90 text-foreground shadow-sm backdrop-blur hover:border-black"
                  aria-label="Image precedente"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/90 text-foreground shadow-sm backdrop-blur hover:border-black"
                  aria-label="Image suivante"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            ) : null}

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="absolute inset-0 z-10 cursor-zoom-in"
              aria-label="Ouvrir l'image en grand"
            >
              <ProductImageFallback
                src={selectedImage?.url}
                alt={selectedImage?.alt ?? productTitle}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-4"
              />
            </button>
          </div>
        </div>

        {hasMultipleImages ? (
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {galleryImages.map((image, index) => {
                const active = index === safeSelectedIndex;

                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={
                      active
                        ? "relative h-24 w-24 shrink-0 overflow-hidden rounded-[1.25rem] border border-foreground bg-white shadow-sm"
                        : "relative h-24 w-24 shrink-0 overflow-hidden rounded-[1.25rem] border border-line bg-white opacity-80 hover:border-foreground hover:opacity-100"
                    }
                    aria-label={`Afficher l'image ${index + 1}`}
                  >
                    <ProductImageFallback
                      src={image.url}
                      alt={image.alt ?? productTitle}
                      fill
                      sizes="96px"
                      className="object-contain p-2"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[140] bg-white/70 px-4 py-6 backdrop-blur-2xl" role="dialog" aria-modal="true">
          <div className="mx-auto grid h-full max-w-7xl gap-4">
            <div className="flex items-center justify-between gap-4 text-foreground">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-foreground/55">Visualisation</p>
                <h2 className="mt-2 font-serif text-3xl">{productTitle}</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/70 shadow-sm backdrop-blur hover:border-black hover:bg-white"
                aria-label="Fermer la galerie"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden rounded-[2rem] border border-black/8 bg-white/55 shadow-[0_18px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl">
              {hasMultipleImages ? (
                <>
                  <button
                    type="button"
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/75 text-foreground shadow-sm backdrop-blur hover:border-black hover:bg-white"
                    aria-label="Image precedente"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/75 text-foreground shadow-sm backdrop-blur hover:border-black hover:bg-white"
                    aria-label="Image suivante"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}

              <div className="relative h-full min-h-[60vh]">
                <ProductImageFallback
                  src={selectedImage?.url}
                  alt={selectedImage?.alt ?? productTitle}
                  fill
                  sizes="100vw"
                  className="object-contain p-6"
                />
              </div>
            </div>

            {hasMultipleImages ? (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {galleryImages.map((image, index) => {
                  const active = index === safeSelectedIndex;

                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      className={
                        active
                          ? "relative h-20 w-20 shrink-0 overflow-hidden rounded-[1rem] border border-black bg-white shadow-sm"
                          : "relative h-20 w-20 shrink-0 overflow-hidden rounded-[1rem] border border-black/10 bg-white/55 opacity-80 backdrop-blur hover:border-black hover:opacity-100"
                      }
                    >
                      <ProductImageFallback
                        src={image.url}
                        alt={image.alt ?? productTitle}
                        fill
                        sizes="80px"
                        className="object-contain p-2"
                      />
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
