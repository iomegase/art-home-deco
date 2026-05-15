"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    if (images.length > 0) return images;
    return [{ id: "fallback-logo", url: "/logo.png", alt: productTitle, position: 0 }];
  }, [images, productTitle]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasMultipleImages = galleryImages.length > 1;
  const safeIndex = Math.min(selectedIndex, galleryImages.length - 1);
  const selectedImage = galleryImages[safeIndex] ?? galleryImages[0];

  useEffect(() => {
    if (!isModalOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") { setIsModalOpen(false); return; }
      if (event.key === "ArrowLeft" && hasMultipleImages)
        setSelectedIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);
      if (event.key === "ArrowRight" && hasMultipleImages)
        setSelectedIndex((i) => (i + 1) % galleryImages.length);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [galleryImages.length, hasMultipleImages, isModalOpen]);

  function goToPrevious() {
    setSelectedIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);
  }
  function goToNext() {
    setSelectedIndex((i) => (i + 1) % galleryImages.length);
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Main image */}
        <div className="relative aspect-[4/4] w-full overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="absolute inset-0 z-10 cursor-zoom-in"
            aria-label="Agrandir l'image"
          >
            <ProductImageFallback
              src={selectedImage?.url}
              alt={selectedImage?.alt ?? productTitle}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-contain p-8 transition-transform duration-700 ease-out hover:scale-[1.02]"
            />
          </button>

          {/* Nav arrows — bottom right */}
          {hasMultipleImages && (
            <div className="absolute bottom-0 right-5 z-20 flex items-center gap-5">
              <button
                type="button"
                onClick={goToPrevious}
                aria-label="Image précédente"
                className="text-[#171717]/40 transition hover:text-[#171717]"
              >
                <ChevronLeft className="h-7 w-7" strokeWidth={1.4} />
              </button>
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#b0a99a]">
                {safeIndex + 1} / {galleryImages.length}
              </span>
              <button
                type="button"
                onClick={goToNext}
                aria-label="Image suivante"
                className="text-[#171717]/40 transition hover:text-[#171717]"
              >
                <ChevronRight className="h-7 w-7" strokeWidth={1.4} />
              </button>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {hasMultipleImages && (
          <div className="flex gap-2 overflow-x-auto">
            {galleryImages.map((image, index) => {
              const active = index === safeIndex;
              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  aria-label={`Afficher l'image ${index + 1}`}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden bg-white transition mt-4 ${
                    active
                      ? "shadow-md"
                      : "opacity-50 hover:opacity-100"
                  }`}
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
        )}
      </div>

      {/* ── Modal zoom ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[140] flex flex-col bg-white"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between  px-6 py-5 md:px-12">
            <div>
              <p className="text-[11px] font-bold mt-6 uppercase tracking-[0.18em] text-[#b0a99a]">zoom sur le produit 
              </p>
              <h2 className="mt-1 text-2xl  font-light leading-tight tracking-[-0.02em] text-[#171717]">
                {productTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              aria-label="Fermer"
              className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#b0a99a] transition hover:text-[#171717]"
            >
              Fermer ×
            </button>
          </div>

          {/* Image */}
          <div className="relative min-h-0 flex-1 ">
            <ProductImageFallback
              src={selectedImage?.url}
              alt={selectedImage?.alt ?? productTitle}
              fill
              sizes="100vw"
              className="object-contain p-10"
            />

            {hasMultipleImages && (
              <div className="absolute bottom-6 right-6 flex items-center gap-6">
                <button
                  type="button"
                  onClick={goToPrevious}
                  aria-label="Image précédente"
                  className="text-[#171717]/40 transition hover:text-[#171717]"
                >
                  <ChevronLeft className="h-8 w-8" strokeWidth={1.4} />
                </button>
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#b0a99a]">
                  {safeIndex + 1} / {galleryImages.length}
                </span>
                <button
                  type="button"
                  onClick={goToNext}
                  aria-label="Image suivante"
                  className="text-[#171717]/40 transition hover:text-[#171717]"
                >
                  <ChevronRight className="h-8 w-8" strokeWidth={1.4} />
                </button>
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {hasMultipleImages && (
            <div className="flex gap-2 overflow-x-auto px-6 py-4 md:px-12">
              {galleryImages.map((image, index) => {
                const active = index === safeIndex;
                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden bg-white transition ${
                      active ? "ring-2 ring-orange-500/50 rounded-md" : "opacity-50 hover:opacity-100"
                    }`}
                  >
                    <ProductImageFallback
                      src={image.url}
                      alt={image.alt ?? productTitle}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
