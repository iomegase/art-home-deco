"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type ProductImageFallbackProps = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
};

export function ProductImageFallback({
  src,
  alt,
  fallbackSrc = "/logo.png",
  ...props
}: ProductImageFallbackProps) {
  const normalizedSrc = src?.trim() || fallbackSrc;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const currentSrc = failedSrc === normalizedSrc ? fallbackSrc : normalizedSrc;

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setFailedSrc(normalizedSrc);
        }
      }}
    />
  );
}
