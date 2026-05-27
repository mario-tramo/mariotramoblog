interface MatchResultProps {
	value: {
		competition?: string;
		matchday?: string;
		date?: string;
		stadium?: string;
		homeTeam: string;
		homeLogo?: { asset?: { _ref: string } };
		homeScore: number;
		awayTeam: string;
		awayLogo?: { asset?: { _ref: string } };
		awayScore: number;
		status?: string;
		homeScorers?: string[];
		awayScorers?: string[];
	};
}

const statusLabels: Record<string, string> = {
	scheduled: "Programmata",
	live: "LIVE",
	first_half: "1° Tempo",
	half_time: "Intervallo",
	second_half: "2° Tempo",
	finished: "Terminata",
	extra_time: "Supplementari",
	penalties: "Rigori",
	postponed: "Rinviata",
};

export function MatchResult({ value }: MatchResultProps) {
	const isLive = value.status === "live" || value.status === "first_half" || value.status === "second_half";

	return (
		<div className="my-6 rounded-xl bg-card overflow-hidden shadow-sm">
			{/* Header */}
			<div className="bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between text-sm">
				<span className="font-medium">{value.competition}</span>
				{value.matchday && <span className="opacity-70">{value.matchday}</span>}
			</div>

			{/* Score */}
			<div className="px-6 py-5 flex items-center justify-center gap-8">
				<div className="flex flex-col items-center gap-2 flex-1">
					<span className="text-lg font-bold text-center">{value.homeTeam}</span>
				</div>

				<div className="flex items-center gap-3">
					<span className="text-4xl font-bold tabular-nums">{value.homeScore}</span>
					<span className="text-2xl text-muted-foreground">-</span>
					<span className="text-4xl font-bold tabular-nums">{value.awayScore}</span>
				</div>

				<div className="flex flex-col items-center gap-2 flex-1">
					<span className="text-lg font-bold text-center">{value.awayTeam}</span>
				</div>
			</div>

			{/* Scorers */}
			{(value.homeScorers?.length || value.awayScorers?.length) && (
				<div className="px-6 pb-3 flex justify-between text-sm text-muted-foreground">
					<div className="flex-1">
						{value.homeScorers?.map((s, i) => (
							<div key={i}>⚽ {s}</div>
						))}
					</div>
					<div className="flex-1 text-right">
						{value.awayScorers?.map((s, i) => (
							<div key={i}>{s} ⚽</div>
						))}
					</div>
				</div>
			)}

			{/* Footer */}
			<div className="border-t border-line-soft px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
				{value.stadium && <span>{value.stadium}</span>}
				{value.status && (
					<span className={`font-semibold ${isLive ? "text-destructive animate-pulse" : ""}`}>
						{statusLabels[value.status] || value.status}
					</span>
				)}
				{value.date && (
					<span>
						{new Date(value.date).toLocaleDateString("it-IT", {
							day: "numeric",
							month: "short",
							year: "numeric",
							hour: "2-digit",
							minute: "2-digit",
						})}
					</span>
				)}
			</div>
		</div>
	);
}
