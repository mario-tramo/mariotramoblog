interface PlayerStatsProps {
  value: {
    playerName: string;
    playerImage?: { asset?: { _ref: string } };
    team?: string;
    role?: string;
    stats?: Array<{ label: string; value: string }>;
    rating?: number;
  };
}

const roleLabels: Record<string, string> = {
  goalkeeper: "Portiere",
  defender: "Difensore",
  midfielder: "Centrocampista",
  forward: "Attaccante",
};

function RatingBadge({ rating }: { rating: number }) {
  const color =
    rating >= 7 ? "bg-primary/15 text-primary" :
    rating >= 6 ? "bg-muted text-muted-foreground" :
    "bg-destructive/15 text-destructive";

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-bold ${color}`}>
      {rating}
    </span>
  );
}

export function PlayerStats({ value }: PlayerStatsProps) {
  return (
    <div className="my-6 rounded-xl bg-card shadow-sm overflow-hidden">
      <div className="p-5 flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h4 className="text-xl font-bold">{value.playerName}</h4>
            {value.rating && <RatingBadge rating={value.rating} />}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {value.team && <span>{value.team}</span>}
            {value.team && value.role && <span> · </span>}
            {value.role && <span>{roleLabels[value.role] || value.role}</span>}
          </div>
        </div>
      </div>

      {value.stats && value.stats.length > 0 && (
        <div className="border-t border-ink/5 grid grid-cols-3 sm:grid-cols-5 divide-x divide-ink/5">
          {value.stats.map((stat, i) => (
            <div key={i} className="p-3 text-center">
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
