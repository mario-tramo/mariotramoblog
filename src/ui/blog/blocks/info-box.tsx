"use client";

interface InfoBoxProps {
  value: {
    type: string;
    title: string;
    image?: { asset?: { _ref: string } };
    facts?: Array<{ label: string; value: string }>;
    description?: string;
  };
}

const typeIcons: Record<string, string> = {
  player: "👤",
  team: "🏟️",
  coach: "🧑‍💼",
  stadium: "🏟️",
  competition: "🏆",
};

const typeLabels: Record<string, string> = {
  player: "Giocatore",
  team: "Squadra",
  coach: "Allenatore",
  stadium: "Stadio",
  competition: "Competizione",
};

export function InfoBox({ value }: InfoBoxProps) {
  return (
    <div className="my-6 rounded-xl bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-2">
        <span className="text-lg">{typeIcons[value.type] || "📋"}</span>
        <div>
          <div className="text-xs uppercase tracking-wide opacity-70">
            {typeLabels[value.type] || "Scheda"}
          </div>
          <div className="font-bold">{value.title}</div>
        </div>
      </div>

      {/* Facts */}
      {value.facts && value.facts.length > 0 && (
        <dl className="divide-y divide-ink/5">
          {value.facts.map((fact, i) => (
            <div key={i} className="flex px-4 py-2.5 text-sm">
              <dt className="w-1/3 text-muted-foreground shrink-0">{fact.label}</dt>
              <dd className="font-medium">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Description */}
      {value.description && (
        <div className="px-4 py-3 border-t border-ink/5 text-sm text-muted-foreground leading-relaxed">
          {value.description}
        </div>
      )}
    </div>
  );
}
