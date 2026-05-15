"use client";

import { useEffect, useRef } from "react";

interface SocialEmbedProps {
  value: {
    url: string;
    platform?: string;
    caption?: string;
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

function TikTokEmbed({ url }: { url: string }) {
  const videoId = getTikTokId(url);
  if (!videoId) return <FallbackLink url={url} platform="tiktok" />;

  return (
    <iframe
      src={`https://www.tiktok.com/embed/v2/${videoId}`}
      className="w-full rounded-xl border-0"
      style={{ height: 750, maxWidth: 605, margin: "0 auto", display: "block" }}
      allow="encrypted-media"
      allowFullScreen
      title="TikTok"
    />
  );
}

function InstagramEmbed({ url }: { url: string }) {
  const shortcode = getInstagramShortcode(url);
  if (!shortcode) return <FallbackLink url={url} platform="instagram" />;

  return (
    <iframe
      src={`https://www.instagram.com/p/${shortcode}/embed/`}
      className="w-full rounded-xl border-0"
      style={{ height: 600, maxWidth: 540, margin: "0 auto", display: "block" }}
      allow="encrypted-media"
      allowFullScreen
      title="Instagram"
    />
  );
}

function TwitterEmbed({ url }: { url: string }) {
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
    />
  );
}

function FacebookEmbed({ url }: { url: string }) {
  const encoded = encodeURIComponent(url);
  return (
    <iframe
      src={`https://www.facebook.com/plugins/post.php?href=${encoded}&show_text=true&width=500`}
      className="rounded-xl border-0"
      style={{ width: 500, height: 600, maxWidth: "100%", margin: "0 auto", display: "block" }}
      allow="encrypted-media"
      allowFullScreen
      title="Facebook"
    />
  );
}

function ThreadsEmbed({ url }: { url: string }) {
  const match = url.match(/threads\.net\/@?[^/]+\/post\/([a-zA-Z0-9_-]+)/);
  if (!match) return <FallbackLink url={url} platform="threads" />;

  return (
    <iframe
      src={`https://www.threads.net/@/post/${match[1]}/embed/`}
      className="w-full rounded-xl border-0"
      style={{ height: 500, maxWidth: 540, margin: "0 auto", display: "block" }}
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

  const embedMap: Record<string, React.ReactNode> = {
    tiktok: <TikTokEmbed url={value.url} />,
    instagram: <InstagramEmbed url={value.url} />,
    twitter: <TwitterEmbed url={value.url} />,
    facebook: <FacebookEmbed url={value.url} />,
    threads: <ThreadsEmbed url={value.url} />,
  };

  return (
    <figure className="my-6">
      {platform && embedMap[platform] ? (
        embedMap[platform]
      ) : (
        <FallbackLink url={value.url} platform={platform} />
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
