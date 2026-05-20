'use client'

interface StandingsRow {
	position: number
	team: string
	played: number
	won?: number
	drawn?: number
	lost?: number
	goalsFor?: number
	goalsAgainst?: number
	points: number
}

interface StandingsZone {
	label: string
	color: string
	fromPosition: number
	toPosition: number
}

interface StandingsProps {
	value: {
		title?: string
		compact?: boolean
		highlightTeams?: string[]
		zones?: StandingsZone[]
		rows: StandingsRow[]
	}
}

const zoneColors: Record<string, string> = {
	blue: 'border-l-blue-500',
	orange: 'border-l-orange-500',
	green: 'border-l-green-500',
	red: 'border-l-red-500',
	yellow: 'border-l-yellow-500',
	purple: 'border-l-purple-500',
}

const zoneBgColors: Record<string, string> = {
	blue: 'bg-blue-500/10',
	orange: 'bg-orange-500/10',
	green: 'bg-green-500/10',
	red: 'bg-red-500/10',
	yellow: 'bg-yellow-500/10',
	purple: 'bg-purple-500/10',
}

function getZoneForPosition(position: number, zones?: StandingsZone[]) {
	if (!zones) return undefined
	return zones.find((z) => position >= z.fromPosition && position <= z.toPosition)
}

export function Standings({ value }: StandingsProps) {
	const { title, compact, highlightTeams = [], zones, rows } = value
	const isCompact = compact || rows.every((r) => r.won === undefined)

	return (
		<div className="my-4 overflow-hidden rounded-lg border border-white/10">
			{title && (
				<div className="border-b border-white/10 bg-surface px-4 py-3">
					<h3 className="text-sm font-semibold">{title}</h3>
				</div>
			)}

			{zones && zones.length > 0 && (
				<div className="flex flex-wrap gap-3 border-b border-white/10 px-4 py-2">
					{zones.map((zone) => (
						<span
							key={zone.label}
							className={`flex items-center gap-1.5 text-xs text-white/60`}
						>
							<span
								className={`inline-block h-2.5 w-2.5 rounded-sm ${zoneBgColors[zone.color] || 'bg-white/20'}`}
								style={
									!zoneBgColors[zone.color]
										? { backgroundColor: zone.color }
										: undefined
								}
							/>
							{zone.label}
						</span>
					))}
				</div>
			)}

			<div className="overflow-x-auto">
				<table className="w-full text-left text-sm">
					<thead>
						<tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/60">
							<th className="px-3 py-2 text-center">#</th>
							<th className="px-3 py-2">Squadra</th>
							<th className="px-3 py-2 text-center">Pt</th>
							<th className="px-3 py-2 text-center">G</th>
							{!isCompact && (
								<>
									<th className="hidden px-3 py-2 text-center sm:table-cell">V</th>
									<th className="hidden px-3 py-2 text-center sm:table-cell">N</th>
									<th className="hidden px-3 py-2 text-center sm:table-cell">S</th>
									<th className="hidden px-3 py-2 text-center md:table-cell">GF</th>
									<th className="hidden px-3 py-2 text-center md:table-cell">GS</th>
									<th className="hidden px-3 py-2 text-center md:table-cell">DR</th>
								</>
							)}
						</tr>
					</thead>
					<tbody>
						{rows.map((row) => {
							const zone = getZoneForPosition(row.position, zones)
							const isHighlighted = highlightTeams.includes(row.team)
							const goalDiff =
								row.goalsFor !== undefined && row.goalsAgainst !== undefined
									? row.goalsFor - row.goalsAgainst
									: undefined

							return (
								<tr
									key={`${row.position}-${row.team}`}
									className={`border-b border-white/5 transition-colors hover:bg-white/5 ${
										zone ? `border-l-2 ${zoneColors[zone.color] || ''}` : ''
									} ${isHighlighted ? 'bg-white/5 font-medium' : ''}`}
								>
									<td className="px-3 py-2 text-center font-medium">
										{row.position}
									</td>
									<td className="px-3 py-2">{row.team}</td>
									<td className="px-3 py-2 text-center font-bold text-accent">
										{row.points}
									</td>
									<td className="px-3 py-2 text-center">{row.played}</td>
									{!isCompact && (
										<>
											<td className="hidden px-3 py-2 text-center sm:table-cell">
												{row.won}
											</td>
											<td className="hidden px-3 py-2 text-center sm:table-cell">
												{row.drawn}
											</td>
											<td className="hidden px-3 py-2 text-center sm:table-cell">
												{row.lost}
											</td>
											<td className="hidden px-3 py-2 text-center md:table-cell">
												{row.goalsFor}
											</td>
											<td className="hidden px-3 py-2 text-center md:table-cell">
												{row.goalsAgainst}
											</td>
											<td className="hidden px-3 py-2 text-center md:table-cell">
												{goalDiff !== undefined
													? goalDiff > 0
														? `+${goalDiff}`
														: goalDiff
													: ''}
											</td>
										</>
									)}
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>
		</div>
	)
}
