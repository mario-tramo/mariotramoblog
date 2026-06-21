"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

interface GalleryImage {
  asset?: { _ref: string };
  imageUrl?: string;
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
  const dragX = useRef<number | null>(null);
  const dragDx = useRef(0);

  const count = value.images?.length ?? 0;

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % count);
  }, [count]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + count) % count);
  }, [count]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragX.current = e.clientX;
    dragDx.current = 0;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragX.current === null) return;
    dragDx.current = e.clientX - dragX.current;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragX.current === null) return;
    const dx = dragDx.current;
    dragX.current = null;
    dragDx.current = 0;
    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch {}
    if (Math.abs(dx) > 50) (dx < 0 ? goNext : goPrev)();
  };

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
              {img.imageUrl ? (
                <Image src={img.imageUrl} alt={img.caption || `Immagine ${i + 1}`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
              ) : img.asset?._ref ? (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                  [Immagine {i + 1}]
                </div>
              ) : null}
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
  const isMultiple = count > 1;

  return (
    <figure className="my-6">
      {value.title && (
        <figcaption className="font-bold text-sm mb-3">{value.title}</figcaption>
      )}
      <div
        className="relative rounded-xl overflow-hidden bg-muted aspect-video select-none touch-pan-y"
        onPointerDown={isMultiple ? onPointerDown : undefined}
        onPointerMove={isMultiple ? onPointerMove : undefined}
        onPointerUp={isMultiple ? onPointerUp : undefined}
        onPointerCancel={isMultiple ? onPointerUp : undefined}
      >
        {current.imageUrl ? (
          <Image src={current.imageUrl} alt={current.caption || `Immagine ${activeIndex + 1}`} fill className="object-cover" sizes="100vw" priority={activeIndex === 0} />
        ) : current.asset?._ref ? (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            [Immagine {activeIndex + 1} di {value.images.length}]
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            [Immagine {activeIndex + 1} di {value.images.length}]
          </div>
        )}

        {isMultiple && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/70"
              aria-label="Precedente"
            >
              ‹
            </button>
            <button
              onClick={goNext}
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

      {isMultiple && (
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
