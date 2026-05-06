"use client";

import Image, { type ImageProps } from "next/image";
import { useMemo, useState } from "react";
import { BLOG_IMAGE_FALLBACK_URL } from "@/features/blog/blog-context";
import { normalizeBlogImageUrl } from "@/features/blog/image-url";

type BlogImageProps = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
};

export function BlogImage({ src, alt, fallbackSrc = BLOG_IMAGE_FALLBACK_URL, onError, ...props }: BlogImageProps) {
  const normalizedSrc = useMemo(() => normalizeBlogImageUrl(src, fallbackSrc), [src, fallbackSrc]);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const currentSrc = failedSrc === normalizedSrc ? fallbackSrc : normalizedSrc;

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={(event) => {
        onError?.(event);
        if (currentSrc !== fallbackSrc) {
          setFailedSrc(normalizedSrc);
        }
      }}
    />
  );
}
