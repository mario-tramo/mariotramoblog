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
    compact?: boolean;
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
    <div className="my-6 rounded-xl bg-card shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-ink/5 font-bold">{value.title}</div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted text-xs text-muted-foreground uppercase">
              <th className="px-2 py-2 text-left w-8 sm:px-3">#</th>
              <th className="px-2 py-2 text-left sm:px-3">Squadra</th>
              {!value.compact && (
                <>
                  <th className="hidden px-3 py-2 text-center sm:table-cell">G</th>
                  <th className="hidden px-3 py-2 text-center sm:table-cell">V</th>
                  <th className="hidden px-3 py-2 text-center sm:table-cell">P</th>
                  <th className="hidden px-3 py-2 text-center sm:table-cell">S</th>
                  <th className="hidden px-3 py-2 text-center md:table-cell">GF</th>
                  <th className="hidden px-3 py-2 text-center md:table-cell">GS</th>
                </>
              )}
              {value.compact && (
                <th className="px-2 py-2 text-center sm:px-3">G</th>
              )}
              <th className="px-2 py-2 text-center font-bold sm:px-3">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {value.rows.map((row) => {
              const isHighlighted = value.highlightTeams?.includes(row.team);
              const zoneBorder = getZoneColor(row.position);
              return (
                <tr
                  key={row.position}
                  className={`${isHighlighted ? "bg-primary/5 font-semibold" : ""} ${zoneBorder ? `border-l-4 ${zoneBorder}` : ""}`}
                >
                  <td className="px-2 py-2 text-muted-foreground sm:px-3">{row.position}</td>
                  <td className="max-w-[120px] truncate px-2 py-2 sm:max-w-none sm:px-3">{row.team}</td>
                  {!value.compact && (
                    <>
                      <td className="hidden px-3 py-2 text-center sm:table-cell">{row.played}</td>
                      <td className="hidden px-3 py-2 text-center sm:table-cell">{row.won}</td>
                      <td className="hidden px-3 py-2 text-center sm:table-cell">{row.drawn}</td>
                      <td className="hidden px-3 py-2 text-center sm:table-cell">{row.lost}</td>
                      <td className="hidden px-3 py-2 text-center md:table-cell">{row.goalsFor}</td>
                      <td className="hidden px-3 py-2 text-center md:table-cell">{row.goalsAgainst}</td>
                    </>
                  )}
                  {value.compact && (
                    <td className="px-2 py-2 text-center sm:px-3">{row.played}</td>
                  )}
                  <td className="px-2 py-2 text-center font-bold sm:px-3">{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Zone legend */}
      {value.zones && value.zones.length > 0 && (
        <div className="px-4 py-2 border-t border-ink/5 flex flex-wrap gap-4 text-xs text-muted-foreground">
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
