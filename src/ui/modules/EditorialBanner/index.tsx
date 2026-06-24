import { type CSSProperties } from "react";
import { stegaClean } from "@sanity/client/stega";
import Link from "next/link";
import resolveUrl from "@/lib/resolveUrl";

/* ─── Preset catalogue ───────────────────────────────────────── */
export type PresetKey =
  | "analisi-violet" | "analisi-blue" | "analisi-indigo"
  | "calcio-green" | "calcio-blue" | "calcio-amber"
  | "f1-red" | "f1-silver" | "f1-orange"
  | "tennis-clay" | "tennis-grass" | "tennis-hard"
  | "basket-nba" | "basket-lakers" | "basket-bulls";

interface PresetDef {
  accent: string;
  accentLabel: string;
  decorFn: (color: string) => React.ReactNode;
}

/* ─── Internal decorators ────────────────────────────────────── */
function DiagLines({ color }: { color: string }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full"
      preserveAspectRatio="none"
      viewBox="0 0 700 200"
    >
      <line x1="420" y1="0" x2="700" y2="200" stroke={color} strokeWidth="60" strokeOpacity="0.05" />
      <line x1="550" y1="0" x2="700" y2="100" stroke={color} strokeWidth="1" strokeOpacity="0.10" />
    </svg>
  );
}

function PitchLines({ color }: { color: string }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full"
      preserveAspectRatio="none"
      viewBox="0 0 700 200"
    >
      <line x1="500" y1="0" x2="500" y2="200" stroke={color} strokeWidth="1" strokeOpacity="0.10" />
      <circle cx="600" cy="100" r="65" stroke={color} strokeWidth="1" strokeOpacity="0.10" fill="none" />
      <line x1="0" y1="1" x2="700" y2="1" stroke={color} strokeWidth="1.5" strokeOpacity="0.12" />
      <line x1="0" y1="199" x2="700" y2="199" stroke={color} strokeWidth="1.5" strokeOpacity="0.12" />
    </svg>
  );
}

function SpeedLines({ color }: { color: string }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full"
      preserveAspectRatio="none"
      viewBox="0 0 700 200"
    >
      {[20, 60, 100, 140, 180].map((y, i) => (
        <line
          key={i}
          x1={300 + i * 12} y1={y} x2="700" y2={y}
          stroke={color}
          strokeWidth={i % 2 === 0 ? "1.2" : "0.7"}
          strokeOpacity={i % 2 === 0 ? "0.12" : "0.07"}
        />
      ))}
      <path d="M380 0 L700 0 L700 200 L440 200 Z" fill={color} fillOpacity="0.04" />
    </svg>
  );
}

function CourtLines({ color }: { color: string }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full"
      preserveAspectRatio="none"
      viewBox="0 0 700 200"
    >
      <rect x="360" y="20" width="300" height="160" stroke={color} strokeWidth="1" strokeOpacity="0.12" fill="none" />
      <line x1="510" y1="20" x2="510" y2="180" stroke={color} strokeWidth="1" strokeOpacity="0.09" />
      <line x1="360" y1="100" x2="660" y2="100" stroke={color} strokeWidth="1" strokeOpacity="0.12" />
      <rect x="420" y="68" width="180" height="64" stroke={color} strokeWidth="0.8" strokeOpacity="0.09" fill="none" />
    </svg>
  );
}

function CourtArc({ color }: { color: string }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full"
      preserveAspectRatio="none"
      viewBox="0 0 700 200"
    >
      <circle cx="640" cy="100" r="85" stroke={color} strokeWidth="1.2" strokeOpacity="0.10" fill="none" />
      <circle cx="640" cy="100" r="12" stroke={color} strokeWidth="1.2" strokeOpacity="0.15" fill="none" />
      <line x1="555" y1="100" x2="700" y2="100" stroke={color} strokeWidth="1" strokeOpacity="0.10" />
      <rect x="655" y="55" width="45" height="90" stroke={color} strokeWidth="1" strokeOpacity="0.10" fill="none" />
    </svg>
  );
}

const PRESETS: Record<PresetKey, PresetDef> = {
  "analisi-violet": { accent: "#7c3aed", accentLabel: "ANALISI", decorFn: (c) => <DiagLines color={c} /> },
  "analisi-blue": { accent: "#2563eb", accentLabel: "ANALISI", decorFn: (c) => <DiagLines color={c} /> },
  "analisi-indigo": { accent: "#6366f1", accentLabel: "ANALISI", decorFn: (c) => <DiagLines color={c} /> },
  "calcio-green": { accent: "#16a34a", accentLabel: "CALCIO", decorFn: (c) => <PitchLines color={c} /> },
  "calcio-blue": { accent: "#1d4ed8", accentLabel: "CALCIO", decorFn: (c) => <PitchLines color={c} /> },
  "calcio-amber": { accent: "#d97706", accentLabel: "CALCIO", decorFn: (c) => <PitchLines color={c} /> },
  "f1-red": { accent: "#dc2626", accentLabel: "F1", decorFn: (c) => <SpeedLines color={c} /> },
  "f1-silver": { accent: "#94a3b8", accentLabel: "F1", decorFn: (c) => <SpeedLines color={c} /> },
  "f1-orange": { accent: "#ea580c", accentLabel: "F1", decorFn: (c) => <SpeedLines color={c} /> },
  "tennis-clay": { accent: "#c2410c", accentLabel: "TENNIS", decorFn: (c) => <CourtLines color={c} /> },
  "tennis-grass": { accent: "#15803d", accentLabel: "TENNIS", decorFn: (c) => <CourtLines color={c} /> },
  "tennis-hard": { accent: "#1d4ed8", accentLabel: "TENNIS", decorFn: (c) => <CourtLines color={c} /> },
  "basket-nba": { accent: "#d97706", accentLabel: "NBA", decorFn: (c) => <CourtArc color={c} /> },
  "basket-lakers": { accent: "#7e22ce", accentLabel: "NBA", decorFn: (c) => <CourtArc color={c} /> },
  "basket-bulls": { accent: "#9f1239", accentLabel: "NBA", decorFn: (c) => <CourtArc color={c} /> },
};

export default function EditorialBanner({
  preset,
  category,
  title,
  subtitle,
  author,
  timeAgo,
  ctaText,
  ctaLink,
}: {
  preset?: string;
  category?: string;
  title?: string;
  subtitle?: string;
  author?: string;
  timeAgo?: string;
  ctaText?: string;
  ctaLink?: Sanity.Link;
}) {
  const p = PRESETS[stegaClean(preset) as PresetKey] ?? PRESETS["calcio-blue"];
  const { accent, accentLabel } = p;

  const rootStyle: CSSProperties = {
    background: `linear-gradient(105deg, var(--color-surface) 0%, var(--color-surface) 55%, color-mix(in srgb, ${accent} 20%, var(--color-surface)) 100%)`,
    borderLeft: `3px solid ${accent}`,
  };

  const linkHref = ctaLink
    ? ctaLink.type === "external"
      ? stegaClean(ctaLink.external) ?? "#"
      : ctaLink.internal
        ? resolveUrl(ctaLink.internal, { base: false })
        : "#"
    : "#";

  return (
    <div
      className="relative grid min-h-[148px] grid-cols-[1fr_auto] items-center gap-4 overflow-hidden rounded-xl shadow-lg"
      style={rootStyle}
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        {p.decorFn(accent)}
      </div>

      <div className="relative z-10 flex flex-col gap-2 p-6">
        <span
          className="inline-block w-fit rounded px-[9px] py-[3px] text-[0.6rem] font-extrabold uppercase tracking-[0.12em]"
          style={{ background: accent, color: "#fff" }}
        >
          {category}
        </span>

        <h2 className="m-0 max-w-[480px] text-[1.35rem] font-bold leading-tight tracking-tight text-ink">
          {title}
        </h2>

        {subtitle && (
          <p className="m-0 max-w-[420px] text-[0.78rem] leading-relaxed text-muted">
            {subtitle}
          </p>
        )}

        <div className="mt-1 flex flex-wrap items-center gap-3">
          {(author || timeAgo) && (
            <span className="text-[0.68rem] font-medium text-gray-500">
              {author && `Di ${author}`}
              {author && timeAgo && "  ·  "}
              {timeAgo}
            </span>
          )}
          {linkHref && (
            <Link
              href={linkHref}
              className="inline-flex items-center gap-1 rounded px-[14px] py-[6px] text-[0.6rem] font-extrabold uppercase tracking-[0.1em] no-underline transition-opacity hover:opacity-90"
              style={{ background: accent, color: "#fff" }}
            >
              {ctaText ?? "LEGGI"} ›
            </Link>
          )}
        </div>
      </div>

      <div
        className="relative z-10 hidden shrink-0 select-none self-start pr-6 pt-6 md:block"
        style={{
          fontStyle: "italic",
          fontWeight: 900,
          fontSize: "clamp(2.8rem, 6vw, 5rem)",
          letterSpacing: "-0.04em",
          color: accent,
          opacity: 0.12,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          lineHeight: 1,
        }}
      >
        {accentLabel}
      </div>
    </div>
  );
}
