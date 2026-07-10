"use client";

import { useCookieConsent } from "@/ui/features/CookieConsent";

interface VideoEmbedProps {
  value: {
    url: string;
    caption?: string;
    type?: string;
  };
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

const typeLabels: Record<string, string> = {
  highlights: "Highlights",
  interview: "Intervista",
  press_conference: "Conferenza stampa",
  tactical_analysis: "Analisi tattica",
  other: "Video",
};

function BlurredVideoCard({ onAccept }: { onAccept: () => void }) {
  return (
    <div className="relative mx-auto w-full overflow-hidden rounded-xl border border-line bg-surface">
      <div aria-hidden className="blur-[2px] [&>*]:select-none">
        <div className="aspect-video w-full bg-muted" />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-canvas/60 backdrop-blur-[1px]">
        <p className="mb-3 text-balance px-4 text-center text-sm text-ink">
          Il video è bloccato.
          <br />
          Per visualizzarlo, accetta i cookie di terze parti.
        </p>
        <button
          type="button"
          onClick={onAccept}
          className="rounded-full bg-ink px-5 py-1.5 text-sm font-semibold text-canvas transition-colors hover:bg-ink/80"
        >
          Accetta cookie
        </button>
      </div>
    </div>
  );
}

export function VideoEmbed({ value }: VideoEmbedProps) {
	const { consent, accept } = useCookieConsent();
  const embedUrl = getEmbedUrl(value.url);

  if (!embedUrl) {
    return (
      <div className="my-6">
        <a
          href={value.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          {value.caption || "Guarda il video"}
        </a>
      </div>
    );
  }

  if (consent !== "accepted") {
    return (
      <figure className="my-6">
        <BlurredVideoCard onAccept={accept} />
      </figure>
    );
  }

  return (
    <figure className="my-6">
      <div className="relative w-full overflow-hidden rounded-xl aspect-video">
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          title={value.caption || "Video"}
        />
      </div>
      {(value.caption || value.type) && (
        <figcaption className="mt-2 text-sm text-muted-foreground text-center">
          {value.type && (
            <span className="inline-block bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded mr-2">
              {typeLabels[value.type] || value.type}
            </span>
          )}
          {value.caption}
        </figcaption>
      )}
    </figure>
  );
}
