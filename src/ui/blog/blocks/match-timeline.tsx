"use client";

interface TimelineEvent {
  minute: string;
  type: string;
  team?: string;
  player?: string;
  playerOut?: string;
  description?: string;
}

interface MatchTimelineProps {
  value: {
    title?: string;
    events?: TimelineEvent[];
  };
}

const eventIcons: Record<string, string> = {
  goal: "⚽",
  assist: "🅰️",
  yellow_card: "🟡",
  second_yellow: "🟡🟡",
  red_card: "🔴",
  substitution: "🔄",
  disallowed_goal: "⚽❌",
  var: "📺",
  penalty: "🥅",
  penalty_missed: "❌",
  injury: "🏥",
  period: "🏁",
};

export function MatchTimeline({ value }: MatchTimelineProps) {
  if (!value.events?.length) return null;

  return (
    <div className="my-6 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {value.title && (
        <div className="px-4 py-3 border-b border-border font-bold">
          {value.title}
        </div>
      )}

      <div className="divide-y divide-border">
        {value.events.map((event, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 px-4 py-2.5 ${
              event.team === "away" ? "flex-row-reverse text-right" : ""
            }`}
          >
            <span className="font-mono text-sm text-muted-foreground w-12 shrink-0 pt-0.5">
              {event.minute}
            </span>
            <span className="text-lg shrink-0">{eventIcons[event.type] || "•"}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">
                {event.player}
                {event.type === "substitution" && event.playerOut && (
                  <span className="text-muted-foreground"> ↔ {event.playerOut}</span>
                )}
              </div>
              {event.description && (
                <div className="text-xs text-muted-foreground mt-0.5">{event.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
