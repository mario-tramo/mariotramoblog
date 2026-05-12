"use client";

import { useState } from "react";

interface GalleryImage {
  asset?: { _ref: string };
  caption?: string;
  credit?: string;
}

interface ImageGalleryProps {
  value: {
    title?: string;
    images?: GalleryImage[];
    layout?: string;
  };
}

export function ImageGallery({ value }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!value.images?.length) return null;

  if (value.layout === "grid" || value.layout === "masonry") {
    return (
      <figure className="my-6">
        {value.title && (
          <figcaption className="font-bold text-sm mb-3">{value.title}</figcaption>
        )}
        <div className={`grid gap-2 ${value.images.length === 1 ? "grid-cols-1" : value.images.length === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"}`}>
          {value.images.map((img, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden bg-muted aspect-video">
              {img.asset?._ref && (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                  [Immagine {i + 1}]
                </div>
              )}
              {img.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs px-2 py-1">
                  {img.caption}
                  {img.credit && <span className="opacity-70"> — {img.credit}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </figure>
    );
  }

  // Default: carousel
  const current = value.images[activeIndex];
  return (
    <figure className="my-6">
      {value.title && (
        <figcaption className="font-bold text-sm mb-3">{value.title}</figcaption>
      )}
      <div className="relative rounded-xl overflow-hidden bg-muted aspect-video">
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          [Immagine {activeIndex + 1} di {value.images.length}]
        </div>

        {value.images.length > 1 && (
          <>
            <button
              onClick={() => setActiveIndex((i) => (i === 0 ? value.images!.length - 1 : i - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/70"
              aria-label="Precedente"
            >
              ‹
            </button>
            <button
              onClick={() => setActiveIndex((i) => (i === value.images!.length - 1 ? 0 : i + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/70"
              aria-label="Successiva"
            >
              ›
            </button>
          </>
        )}
      </div>

      {(current.caption || current.credit) && (
        <figcaption className="text-sm text-muted-foreground mt-2 text-center">
          {current.caption}
          {current.credit && <span className="opacity-70"> — {current.credit}</span>}
        </figcaption>
      )}

      {value.images.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {value.images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === activeIndex ? "bg-foreground" : "bg-border"}`}
              aria-label={`Vai a immagine ${i + 1}`}
            />
          ))}
        </div>
      )}
    </figure>
  );
}
