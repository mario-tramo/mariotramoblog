import type { Standing } from '@/lib/football-data'

function getRowVisibilityClass(index: number, mobileRows: number, desktopRows: number) {
	const hiddenMobile = index >= mobileRows
	const hiddenDesktop = index >= desktopRows

	if (hiddenMobile && hiddenDesktop) return 'hidden'
	if (hiddenMobile) return 'hidden md:table-row'
	if (hiddenDesktop) return 'md:hidden'
	return ''
}

export default function StandingsTable({
	rows,
	compact = false,
	mobileRows = 5,
	desktopRows = 10,
	inline = false,
}: {
	rows: Standing[]
	compact?: boolean
	mobileRows?: number
	desktopRows?: number
	inline?: boolean
}) {
	const secondaryColClass = inline ? 'hidden md:table-cell' : 'hidden sm:table-cell'
	const tertiaryColClass = inline ? 'hidden lg:table-cell' : 'hidden md:table-cell'

	return (
		<div className={`overflow-x-auto rounded-md border border-line ${inline ? 'no-scrollbar' : ''}`}>
			<table className="w-full min-w-[360px] text-left text-sm">
				<thead>
					<tr className="border-b border-line bg-surface text-[10px] uppercase tracking-[0.14em] text-white/60">
						<th scope="col" className="w-9 px-2 py-2 text-center sm:px-3 sm:py-2.5">#</th>
						<th scope="col" className="px-2 py-2 sm:px-3 sm:py-2.5">Squadra</th>
						<th scope="col" className="w-12 px-2 py-2 text-center sm:px-3 sm:py-2.5">Pt</th>
						<th scope="col" className={`w-11 px-3 py-2.5 text-center ${secondaryColClass}`}>G</th>
						<th scope="col" className={`w-11 px-3 py-2.5 text-center ${secondaryColClass}`}>V</th>
						<th scope="col" className={`w-11 px-3 py-2.5 text-center ${secondaryColClass}`}>N</th>
						<th scope="col" className={`w-11 px-3 py-2.5 text-center ${secondaryColClass}`}>S</th>
						<th scope="col" className={`w-12 px-3 py-2.5 text-center ${tertiaryColClass}`}>GF</th>
						<th scope="col" className={`w-12 px-3 py-2.5 text-center ${tertiaryColClass}`}>GS</th>
						<th scope="col" className={`w-12 px-3 py-2.5 text-center ${tertiaryColClass}`}>DR</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row, index) => (
						<tr
							key={row.team.id}
							className={`border-b border-line-soft text-[13px] transition-colors last:border-0 hover:bg-white/5 ${compact ? getRowVisibilityClass(index, mobileRows, desktopRows) : ''}`}
						>
							<td className="px-2 py-1.5 text-center font-medium text-muted sm:px-3 sm:py-2">{row.position}</td>
							<td className="max-w-0 px-2 py-1.5 sm:px-3 sm:py-2">
								<span className="hidden truncate sm:inline">{row.team.name}</span>
								<span className="block truncate sm:hidden">{row.team.shortName}</span>
							</td>
							<td className="px-2 py-1.5 text-center font-bold text-accent sm:px-3 sm:py-2">{row.points}</td>
							<td className={`px-3 py-2 text-center ${secondaryColClass}`}>{row.playedGames}</td>
							<td className={`px-3 py-2 text-center ${secondaryColClass}`}>{row.won}</td>
							<td className={`px-3 py-2 text-center ${secondaryColClass}`}>{row.draw}</td>
							<td className={`px-3 py-2 text-center ${secondaryColClass}`}>{row.lost}</td>
							<td className={`px-3 py-2 text-center ${tertiaryColClass}`}>{row.goalsFor}</td>
							<td className={`px-3 py-2 text-center ${tertiaryColClass}`}>{row.goalsAgainst}</td>
							<td className={`px-3 py-2 text-center ${tertiaryColClass}`}>
								{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
