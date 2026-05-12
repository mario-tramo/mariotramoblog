"use client";

interface StandingsRow {
  position: number;
  team: string;
  played?: number;
  won?: number;
  drawn?: number;
  lost?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  points?: number;
}

interface Zone {
  label?: string;
  color?: string;
  fromPosition?: number;
  toPosition?: number;
}

interface StandingsProps {
  value: {
    title: string;
    highlightTeams?: string[];
    rows?: StandingsRow[];
    zones?: Zone[];
  };
}

const zoneColors: Record<string, { border: string; dot: string }> = {
  blue: { border: "border-l-primary", dot: "bg-primary" },
  green: { border: "border-l-primary", dot: "bg-primary" },
  orange: { border: "border-l-muted-foreground", dot: "bg-muted-foreground" },
  red: { border: "border-l-destructive", dot: "bg-destructive" },
};

export function Standings({ value }: StandingsProps) {
  if (!value.rows?.length) return null;

  const getZoneColor = (pos: number) => {
    const zone = value.zones?.find((z) => z.fromPosition && z.toPosition && pos >= z.fromPosition && pos <= z.toPosition);
    return zone?.color ? zoneColors[zone.color]?.border || "" : "";
  };

  return (
    <div className="my-6 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border font-bold">{value.title}</div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted text-xs text-muted-foreground uppercase">
              <th className="px-3 py-2 text-left w-8">#</th>
              <th className="px-3 py-2 text-left">Squadra</th>
              <th className="px-3 py-2 text-center">G</th>
              <th className="px-3 py-2 text-center">V</th>
              <th className="px-3 py-2 text-center">P</th>
              <th className="px-3 py-2 text-center">S</th>
              <th className="px-3 py-2 text-center">GF</th>
              <th className="px-3 py-2 text-center">GS</th>
              <th className="px-3 py-2 text-center font-bold">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {value.rows.map((row) => {
              const isHighlighted = value.highlightTeams?.includes(row.team);
              const zoneBorder = getZoneColor(row.position);
              return (
                <tr
                  key={row.position}
                  className={`${isHighlighted ? "bg-primary/5 font-semibold" : ""} ${zoneBorder ? `border-l-4 ${zoneBorder}` : ""}`}
                >
                  <td className="px-3 py-2 text-muted-foreground">{row.position}</td>
                  <td className="px-3 py-2">{row.team}</td>
                  <td className="px-3 py-2 text-center">{row.played}</td>
                  <td className="px-3 py-2 text-center">{row.won}</td>
                  <td className="px-3 py-2 text-center">{row.drawn}</td>
                  <td className="px-3 py-2 text-center">{row.lost}</td>
                  <td className="px-3 py-2 text-center">{row.goalsFor}</td>
                  <td className="px-3 py-2 text-center">{row.goalsAgainst}</td>
                  <td className="px-3 py-2 text-center font-bold">{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Zone legend */}
      {value.zones && value.zones.length > 0 && (
        <div className="px-4 py-2 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
          {value.zones.map((zone, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm ${zoneColors[zone.color || ""]?.dot || "bg-muted-foreground"}`} />
              <span>{zone.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
