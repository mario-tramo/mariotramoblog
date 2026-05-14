"use client";

import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { MatchResult } from "./blocks/match-result";
import { PlayerStats } from "./blocks/player-stats";
import { Lineup } from "./blocks/lineup";
import { MatchTimeline } from "./blocks/match-timeline";
import { Standings } from "./blocks/standings";
import { Callout } from "./blocks/callout";
import { QuoteBlock } from "./blocks/quote-block";
import { VideoEmbed } from "./blocks/video-embed";
import { ImageGallery } from "./blocks/image-gallery";
import { InfoBox } from "./blocks/info-box";

const components: PortableTextComponents = {
  types: {
    matchResult: MatchResult,
    playerStats: PlayerStats,
    lineup: Lineup,
    matchTimeline: MatchTimeline,
    standings: Standings,
    callout: Callout,
    quoteBlock: QuoteBlock,
    videoEmbed: VideoEmbed,
    imageGallery: ImageGallery,
    infoBox: InfoBox,
    image: ({ value }: { value: { caption?: string; credit?: string } }) => (
      <figure className="my-6">
        <div className="rounded-xl overflow-hidden bg-muted aspect-video flex items-center justify-center text-muted-foreground">
          [Immagine]
        </div>
        {(value.caption || value.credit) && (
          <figcaption className="text-sm text-muted-foreground mt-2 text-center">
            {value.caption}
            {value.credit && (
              <span className="opacity-70"> — {value.credit}</span>
            )}
          </figcaption>
        )}
      </figure>
    ),
  },
  marks: {
    link: ({ children, value }: { children: React.ReactNode; value?: { href?: string } }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline hover:text-primary/80"
      >
        {children}
      </a>
    ),
  },
  block: {
    h2: ({ children }) => (
      <h2 id={typeof children === "string" ? children.toString().toLowerCase().replace(/\s+/g, "-") : undefined} className="text-2xl font-bold mt-8 mb-3">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-bold mt-6 mb-2">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-semibold mt-4 mb-2">{children}</h4>
    ),
    normal: ({ children }) => (
      <p className="text-base leading-relaxed mb-4">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-ink/10 pl-4 italic text-muted-foreground my-4">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside space-y-1 mb-4">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside space-y-1 mb-4">{children}</ol>
    ),
  },
};

interface PortableTextRendererProps {
  content: PortableTextBlock[];
}

export function PortableTextRenderer({ content }: PortableTextRendererProps) {
  if (!content?.length) return null;

  return (
    <div className="prose prose-lg max-w-none">
      <PortableText value={content} components={components} />
    </div>
  );
}
