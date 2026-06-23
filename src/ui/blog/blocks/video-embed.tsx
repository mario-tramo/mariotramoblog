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

export function VideoEmbed({ value }: VideoEmbedProps) {
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
