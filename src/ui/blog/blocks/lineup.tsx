interface Player {
  number?: number;
  name: string;
  position?: string;
  captain?: boolean;
}

interface LineupProps {
  value: {
    teamName: string;
    teamLogo?: { asset?: { _ref: string } };
    formation: string;
    coach?: string;
    starters?: Player[];
    substitutes?: Player[];
  };
}

export function Lineup({ value }: LineupProps) {
  return (
    <div className="my-6 rounded-xl bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-lg">{value.teamName}</span>
        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-mono">
          {value.formation}
        </span>
      </div>

      {value.coach && (
        <div className="px-4 py-2 border-b border-ink/5 text-sm text-muted-foreground">
          All. <strong className="text-foreground">{value.coach}</strong>
        </div>
      )}

      {/* Starters */}
      {value.starters && value.starters.length > 0 && (
        <div className="p-4">
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Titolari
          </h5>
          <div className="space-y-1">
            {value.starters.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {p.number && (
                  <span className="w-7 text-right font-mono text-muted-foreground">
                    {p.number}
                  </span>
                )}
                <span className="font-medium">
                  {p.name}
                  {p.captain && <span className="ml-1 text-primary font-bold">©</span>}
                </span>
                {p.position && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {p.position}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Substitutes */}
      {value.substitutes && value.substitutes.length > 0 && (
        <div className="p-4 border-t border-ink/5 bg-muted">
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Panchina
          </h5>
          <div className="flex flex-wrap gap-2">
            {value.substitutes.map((p, i) => (
              <span key={i} className="text-sm text-muted-foreground">
                {p.number && <span className="font-mono">{p.number}. </span>}
                {p.name}
                {i < value.substitutes!.length - 1 && ","}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
