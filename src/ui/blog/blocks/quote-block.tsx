"use client";

interface QuoteBlockProps {
  value: {
    quote: string;
    author: string;
    role?: string;
    image?: { asset?: { _ref: string } };
    context?: string;
  };
}

export function QuoteBlock({ value }: QuoteBlockProps) {
  return (
    <blockquote className="my-6 border-l-4 border-primary bg-muted rounded-r-xl p-5">
      <p className="text-lg italic leading-relaxed text-foreground">
        &ldquo;{value.quote}&rdquo;
      </p>
      <footer className="mt-3 flex items-center gap-3">
        <div>
          <cite className="not-italic font-bold text-sm">{value.author}</cite>
          {value.role && (
            <p className="text-xs text-muted-foreground">{value.role}</p>
          )}
          {value.context && (
            <p className="text-xs text-muted-foreground/70 mt-0.5">{value.context}</p>
          )}
        </div>
      </footer>
    </blockquote>
  );
}
