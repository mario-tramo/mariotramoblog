"use client";

import { useEffect, useRef } from "react";

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

export function SocialEmbed({ value }: SocialEmbedProps) {
  const platform = (value.platform as Platform) || detectPlatform(value.url);
  const size: EmbedSize = { width: value.width, height: value.height };

  const embedMap: Record<string, React.ReactNode> = {
    tiktok: <TikTokEmbed url={value.url} size={size} />,
    instagram: <InstagramEmbed url={value.url} size={size} />,
    twitter: <TwitterEmbed url={value.url} size={size} />,
    facebook: <FacebookEmbed url={value.url} size={size} />,
    threads: <ThreadsEmbed url={value.url} size={size} />,
  };

  return (
    <figure className="my-6">
      {platform && embedMap[platform] ? (
        embedMap[platform]
      ) : (
        <FallbackLink url={value.url} platform={platform} />
      )}
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
