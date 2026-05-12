"use client";

interface CalloutProps {
  value: {
    type: string;
    title?: string;
    text: string;
    source?: string;
  };
}

const calloutStyles: Record<string, { icon: string; border: string; title: string }> = {
  breaking: { icon: "🔴", border: "border-l-destructive", title: "BREAKING NEWS" },
  transfer: { icon: "🔄", border: "border-l-primary", title: "Calciomercato" },
  injury: { icon: "🏥", border: "border-l-destructive", title: "Infortunio" },
  var: { icon: "📺", border: "border-l-primary", title: "VAR" },
  info: { icon: "ℹ️", border: "border-l-primary", title: "Info" },
  warning: { icon: "⚠️", border: "border-l-destructive", title: "Attenzione" },
  stat: { icon: "📊", border: "border-l-primary", title: "Statistica" },
  rumor: { icon: "💬", border: "border-l-border", title: "Indiscrezione" },
};

export function Callout({ value }: CalloutProps) {
  const style = calloutStyles[value.type] || calloutStyles.info;

  return (
    <div className={`my-6 rounded-xl border-l-4 ${style.border} bg-muted p-4`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{style.icon}</span>
        <span className="font-bold text-sm uppercase tracking-wide text-foreground">
          {value.title || style.title}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{value.text}</p>
      {value.source && (
        <p className="text-xs text-muted-foreground mt-2 italic">Fonte: {value.source}</p>
      )}
    </div>
  );
}
