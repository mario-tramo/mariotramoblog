"use client";

import { useEffect, useRef } from "react";
import { useCookieConsent } from "@/ui/features/CookieConsent";

interface SocialEmbedProps {
  value: {
    url: string;
    platform?: string;
    caption?: string;
    description?: string;
    width?: number;
    height?: number;
  };
}

type Platform =
  | "tiktok"
  | "instagram"
  | "twitter"
  | "facebook"
  | "threads"
  | null;

function detectPlatform(url: string): Platform {
  if (/tiktok\.com/.test(url)) return "tiktok";
  if (/instagram\.com/.test(url)) return "instagram";
  if (/threads\.net/.test(url)) return "threads";
  if (/twitter\.com|x\.com/.test(url)) return "twitter";
  if (/facebook\.com|fb\.watch/.test(url)) return "facebook";
  return null;
}

const platformLabels: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  twitter: "X (Twitter)",
  facebook: "Facebook",
  threads: "Threads",
};

function getTikTokId(url: string): string | null {
  const match = url.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
}

function getInstagramShortcode(url: string): string | null {
  const match = url.match(
    /instagram\.com\/(?:p|reel|reels)\/([a-zA-Z0-9_-]+)/,
  );
  return match ? match[1] : null;
}

function getTweetId(url: string): string | null {
  const match = url.match(/\/status\/(\d+)/);
  return match ? match[1] : null;
}

interface EmbedSize {
  width?: number;
  height?: number;
}

function TikTokEmbed({ url, size }: { url: string; size?: EmbedSize }) {
  const videoId = getTikTokId(url);
  if (!videoId) return <FallbackLink url={url} platform="tiktok" />;

  return (
    <iframe
      src={`https://www.tiktok.com/embed/v2/${videoId}`}
      className="w-full rounded-xl border-0"
      style={{ height: size?.height ?? 750, maxWidth: size?.width ?? 605, margin: "0 auto", display: "block" }}
      allow="encrypted-media"
      allowFullScreen
      loading="lazy"
      title="TikTok"
    />
  );
}

function InstagramEmbed({ url, size }: { url: string; size?: EmbedSize }) {
  const shortcode = getInstagramShortcode(url);
  if (!shortcode) return <FallbackLink url={url} platform="instagram" />;

  return (
    <iframe
      src={`https://www.instagram.com/p/${shortcode}/embed/`}
      className="w-full rounded-xl border-0"
      style={{ height: size?.height ?? 600, maxWidth: size?.width ?? 540, margin: "0 auto", display: "block" }}
      allow="encrypted-media"
      allowFullScreen
      loading="lazy"
      title="Instagram"
    />
  );
}

function TwitterEmbed({ url, size }: { url: string; size?: EmbedSize }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tweetId = getTweetId(url);
    if (!tweetId || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = "";

    const win = window as typeof window & {
      twttr?: { widgets: { createTweet: (id: string, el: HTMLElement) => void } };
    };

    function renderTweet() {
      if (win.twttr?.widgets) {
        win.twttr.widgets.createTweet(tweetId!, container);
      }
    }

    if (win.twttr?.widgets) {
      renderTweet();
    } else {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.onload = renderTweet;
      document.head.appendChild(script);
    }
  }, [url]);

  const tweetId = getTweetId(url);
  if (!tweetId) return <FallbackLink url={url} platform="twitter" />;

  return (
    <div
      ref={containerRef}
      className="flex justify-center [&>div]:!m-0"
      style={size?.width ? { maxWidth: size.width, margin: "0 auto" } : undefined}
    />
  );
}

function FacebookEmbed({ url, size }: { url: string; size?: EmbedSize }) {
  const w = size?.width ?? 500;
  const encoded = encodeURIComponent(url);
  return (
    <iframe
      src={`https://www.facebook.com/plugins/post.php?href=${encoded}&show_text=true&width=${w}`}
      className="rounded-xl border-0"
      style={{ width: w, height: size?.height ?? 600, maxWidth: "100%", margin: "0 auto", display: "block" }}
      allow="encrypted-media"
      allowFullScreen
      loading="lazy"
      title="Facebook"
    />
  );
}

function ThreadsEmbed({ url, size }: { url: string; size?: EmbedSize }) {
  const match = url.match(/threads\.net\/@?[^/]+\/post\/([a-zA-Z0-9_-]+)/);
  if (!match) return <FallbackLink url={url} platform="threads" />;

  return (
    <iframe
      src={`https://www.threads.net/@/post/${match[1]}/embed/`}
      className="w-full rounded-xl border-0"
      style={{ height: size?.height ?? 500, maxWidth: size?.width ?? 540, margin: "0 auto", display: "block" }}
      allow="encrypted-media"
      allowFullScreen
      loading="lazy"
      title="Threads"
    />
  );
}

function FallbackLink({
  url,
  platform,
}: {
  url: string;
  platform: string | null;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline"
    >
      Vedi il post su {platform ? platformLabels[platform] || platform : "social"}
    </a>
  );
}

type EmbedConfig = {
  avatarGradient: string;
  headerText: string;
  subText: string | null;
  bodyText: string;
  timestamp: string;
  actions: string[];
};

const embedConfigs: Record<string, EmbedConfig> = {
  twitter: {
    avatarGradient: "from-sky-400 to-blue-600",
    headerText: "Nome utente",
    subText: "@username",
    bodyText:
      "Testo del tweet che sarebbe visibile se i cookie di terze parti fossero accettati. Qui ci sarebbe il contenuto reale del tweet con link, hashtag e menzioni.",
    timestamp: "4:32 PM · 24 giu 2026",
    actions: ["Reply", "Repost", "Like"],
  },
  instagram: {
    avatarGradient: "from-pink-400 to-amber-500",
    headerText: "nome_utente",
    subText: null,
    bodyText:
      "Didascalia del post Instagram bloccata dai cookie di terze parti. Il contenuto reale diventerebbe visibile dopo l'accettazione.",
    timestamp: "24 giugno 2026",
    actions: ["Like", "Comment", "Share"],
  },
  tiktok: {
    avatarGradient: "from-cyan-400 to-purple-600",
    headerText: "@username",
    subText: null,
    bodyText:
      "Descrizione del video TikTok bloccata dai cookie di terze parti. Il contenuto reale diventerebbe visibile dopo l'accettazione.",
    timestamp: "2026-6-24",
    actions: ["Like", "Comment", "Share"],
  },
  facebook: {
    avatarGradient: "from-blue-500 to-blue-800",
    headerText: "Nome Utente",
    subText: null,
    bodyText:
      "Testo del post Facebook bloccato dai cookie di terze parti. Il contenuto reale diventerebbe visibile dopo l'accettazione.",
    timestamp: "24 giugno 2026",
    actions: ["Like", "Comment", "Share"],
  },
  threads: {
    avatarGradient: "from-zinc-800 to-zinc-600",
    headerText: "Nome utente",
    subText: "@username",
    bodyText:
      "Testo del post Threads bloccato dai cookie di terze parti. Il contenuto reale diventerebbe visibile dopo l'accettazione.",
    timestamp: "4:32 PM · 24 giu 2026",
    actions: ["Reply", "Repost", "Like"],
  },
};

function BlurredEmbedCard({
  platform,
  onAccept,
}: {
  platform: string;
  onAccept: () => void;
}) {
  const config = embedConfigs[platform] ?? embedConfigs.twitter;

  return (
    <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-xl border border-line bg-white">
      <div aria-hidden className="blur-[2px] [&>*]:select-none">
        <div className="p-4 pb-3">
          <div className="flex items-start gap-3">
            <div
              className={`size-10 shrink-0 rounded-full bg-linear-to-br ${config.avatarGradient}`}
            />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-900">
                  {config.headerText}
                </span>
                {config.subText && (
                  <span className="text-xs text-neutral-500">
                    {config.subText}
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-neutral-900">
                {config.bodyText}
              </p>
              <div className="flex items-center gap-4 pt-1 text-neutral-500">
                <span className="text-xs">{config.timestamp}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-4 mb-3 h-44 rounded-lg bg-neutral-100" />
        <div className="flex items-center gap-6 border-t border-neutral-100 px-4 py-3 text-neutral-500">
          {config.actions.map((action) => (
            <span key={action} className="text-xs">
              {action}
            </span>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px]">
        <p className="mb-3 text-balance text-center text-sm text-neutral-900">
          Il contenuto {platformLabels[platform] ?? "social"} è bloccato.
          <br />
          Per visualizzarlo, accetta i cookie di terze parti.
        </p>
        <button
          type="button"
          onClick={onAccept}
          className="rounded-full bg-neutral-900 px-5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
        >
          Accetta cookie
        </button>
      </div>
    </div>
  );
}

export function SocialEmbed({ value }: SocialEmbedProps) {
	const platform = (value.platform as Platform) || detectPlatform(value.url);
  const size: EmbedSize = { width: value.width, height: value.height };
  const { consent, accept } = useCookieConsent();

  if (consent !== "accepted") {
    return (
      <figure data-sanity-id="socialEmbed" className="my-6">
        <BlurredEmbedCard
          platform={platform ?? "social"}
          onAccept={accept}
        />
      </figure>
    );
  }

  const embed = platform === 'tiktok' ? <TikTokEmbed url={value.url} size={size} />
    : platform === 'instagram' ? <InstagramEmbed url={value.url} size={size} />
    : platform === 'twitter' ? <TwitterEmbed url={value.url} size={size} />
    : platform === 'facebook' ? <FacebookEmbed url={value.url} size={size} />
    : platform === 'threads' ? <ThreadsEmbed url={value.url} size={size} />
    : <FallbackLink url={value.url} platform={platform} />;

  return (
    <figure data-sanity-id="socialEmbed" className="my-6">
      {embed}
      {value.description && (
        <p className="mt-3 text-sm text-muted-foreground text-center italic">
          {value.description}
        </p>
      )}
      {value.caption && (
        <figcaption className="mt-2 text-sm text-muted-foreground text-center">
          {platform && (
            <span className="inline-block bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded mr-2">
              {platformLabels[platform] || platform}
            </span>
          )}
          {value.caption}
        </figcaption>
      )}
    </figure>
  );
}
