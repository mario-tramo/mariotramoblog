import {
	fetchStandings,
	COMPETITIONS,
	type CompetitionCode,
	type Standing,
} from '@/lib/football-data'

function getRowVisibilityClass(
	index: number,
	mobileRows: string,
	desktopRows: string,
) {
	const mobileLimit = mobileRows === 'all' ? Infinity : Number(mobileRows)
	const desktopLimit = desktopRows === 'all' ? Infinity : Number(desktopRows)

	const hiddenMobile = index >= mobileLimit
	const hiddenDesktop = index >= desktopLimit

	if (hiddenMobile && hiddenDesktop) return 'hidden'
	if (hiddenMobile) return 'hidden md:table-row'
	if (hiddenDesktop) return 'md:hidden'
	return ''
}

export default async function Standings({
	competition = 'SA',
	mobileRows = '5',
	desktopRows = 'all',
}: Partial<{
	competition: CompetitionCode
	mobileRows: '5' | '10' | 'all'
	desktopRows: '5' | '10' | 'all'
}>) {
	let standings: Standing[] = []
	let competitionName: string = COMPETITIONS[competition]
	let emblem: string | undefined
	let currentMatchday: number | undefined

	try {
		const data = await fetchStandings(competition)
		const total = data.standings.find((s) => s.type === 'TOTAL')
		standings = total?.table ?? []
		competitionName = data.competition.name
		emblem = data.competition.emblem
		currentMatchday = data.season.currentMatchday
	} catch {
		return (
			<section className="section">
				<div className="mx-auto max-w-screen-lg">
					<p className="text-muted text-center">
						Classifica non disponibile al momento.
					</p>
				</div>
			</section>
		)
	}

	return (
		<section className="section">
			<div className="mx-auto max-w-screen-lg">
				<header className="mb-6 flex items-center gap-3">
					{emblem && (
						<img
							src={emblem}
							alt={competitionName}
							className="h-8 w-8"
						/>
					)}
					<div>
						<h2 className="h4">{competitionName}</h2>
						{currentMatchday && (
							<p className="text-muted text-sm">
								Giornata {currentMatchday}
							</p>
						)}
					</div>
				</header>

				<div className="overflow-x-auto rounded-lg border border-white/10">
					<table className="w-full text-left text-sm">
						<thead>
							<tr className="bg-surface border-b border-white/10 text-xs uppercase tracking-wider text-white/60">
								<th className="px-3 py-3 text-center">#</th>
								<th className="px-3 py-3">Squadra</th>
								<th className="px-3 py-3 text-center">Pt</th>
								<th className="hidden px-3 py-3 text-center sm:table-cell">
									G
								</th>
								<th className="hidden px-3 py-3 text-center sm:table-cell">
									V
								</th>
								<th className="hidden px-3 py-3 text-center sm:table-cell">
									N
								</th>
								<th className="hidden px-3 py-3 text-center sm:table-cell">
									S
								</th>
								<th className="hidden px-3 py-3 text-center md:table-cell">
									GF
								</th>
								<th className="hidden px-3 py-3 text-center md:table-cell">
									GS
								</th>
								<th className="hidden px-3 py-3 text-center md:table-cell">
									DR
								</th>
							</tr>
						</thead>
						<tbody>
							{standings.map((row, i) => (
								<tr
									key={row.team.id}
									className={`border-b border-white/5 transition-colors hover:bg-white/5 ${getRowVisibilityClass(i, mobileRows, desktopRows)}`}
								>
									<td className="px-3 py-2.5 text-center font-medium">
										{row.position}
									</td>
									<td className="px-3 py-2.5">
										<div className="flex items-center gap-2">
											<img
												src={row.team.crest}
												alt={row.team.shortName}
												className="h-5 w-5"
											/>
											<span className="hidden sm:inline">
												{row.team.name}
											</span>
											<span className="sm:hidden">
												{row.team.shortName}
											</span>
										</div>
									</td>
									<td className="px-3 py-2.5 text-center font-bold text-accent">
										{row.points}
									</td>
									<td className="hidden px-3 py-2.5 text-center sm:table-cell">
										{row.playedGames}
									</td>
									<td className="hidden px-3 py-2.5 text-center sm:table-cell">
										{row.won}
									</td>
									<td className="hidden px-3 py-2.5 text-center sm:table-cell">
										{row.draw}
									</td>
									<td className="hidden px-3 py-2.5 text-center sm:table-cell">
										{row.lost}
									</td>
									<td className="hidden px-3 py-2.5 text-center md:table-cell">
										{row.goalsFor}
									</td>
									<td className="hidden px-3 py-2.5 text-center md:table-cell">
										{row.goalsAgainst}
									</td>
									<td className="hidden px-3 py-2.5 text-center md:table-cell">
										{row.goalDifference > 0
											? `+${row.goalDifference}`
											: row.goalDifference}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	)
}
