import {
	fetchStandings,
	COMPETITIONS,
	StandingsError,
	APIErrorCode,
	type CompetitionCode,
	type Standing,
} from '@/lib/football-data'
import SectionTitle from '@/ui/primitives/SectionTitle'

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
	inline = false,
	nested = false,
}: Partial<{
	competition: CompetitionCode
	mobileRows: '5' | '10' | 'all'
	desktopRows: '5' | '10' | 'all'
	inline: boolean
	nested: boolean
}>) {
	let standings: Standing[] = []
	let competitionName: string = COMPETITIONS[competition]
	let currentMatchday: number | undefined

	try {
		const data = await fetchStandings(competition)
		const total = data.standings.find((s) => s.type === 'TOTAL')
		standings = total?.table ?? []
		competitionName = data.competition.name
		currentMatchday = data.season.currentMatchday
	} catch (error) {
		let message = 'Classifica non disponibile al momento.'
		if (error instanceof StandingsError) {
			switch (error.code) {
				case APIErrorCode.MISSING_KEY:
				case APIErrorCode.INVALID_KEY:
					message = 'Classifica momentaneamente non disponibile.'
					break
				case APIErrorCode.RATE_LIMITED:
					message = 'Classifica momentaneamente non disponibile — riprova più tardi.'
					break
				case APIErrorCode.NETWORK_ERROR:
					message = 'Errore di connessione, riprova più tardi.'
					break
			}
		}
		const errorContent = (
			<div className={inline ? '' : 'mx-auto max-w-screen-lg'}>
				<p className="text-muted text-center">
					{message}
				</p>
			</div>
		)

		if (inline || nested) return errorContent
		return <section className="section">{errorContent}</section>
	}

	const secondaryColClass = inline
		? 'hidden md:table-cell'
		: 'hidden sm:table-cell'
	const tertiaryColClass = inline
		? 'hidden lg:table-cell'
		: 'hidden md:table-cell'

	const content = (
		<div className={inline ? '' : 'mx-auto max-w-screen-lg'}>
			<header className={inline ? 'mb-3' : 'mb-5 border-b border-line-soft pb-4'}>
				{inline ? (
					<SectionTitle>{competitionName}</SectionTitle>
				) : (
					<h2 className="font-heading text-3xl uppercase tracking-tight md:text-5xl">
						{competitionName}
					</h2>
				)}
				{currentMatchday != null && currentMatchday > 0 && (
					<p className="text-muted mt-1 text-xs sm:text-sm">
						Giornata {currentMatchday}
					</p>
				)}
			</header>

			<div className={`overflow-x-auto rounded-lg border border-line ${inline ? 'no-scrollbar' : ''}`}>
				<table className="w-full text-left text-sm">
					<thead>
						<tr className="bg-surface border-b border-line text-xs uppercase tracking-wider text-white/60">
							<th scope="col" className="px-2 py-2 text-center sm:px-3 sm:py-3">
								#
							</th>
							<th scope="col" className="px-2 py-2 sm:px-3 sm:py-3">
								Squadra
							</th>
							<th scope="col" className="px-2 py-2 text-center sm:px-3 sm:py-3">
								Pt
							</th>
							<th scope="col" className={`px-3 py-3 text-center ${secondaryColClass}`}>
								G
							</th>
							<th scope="col" className={`px-3 py-3 text-center ${secondaryColClass}`}>
								V
							</th>
							<th scope="col" className={`px-3 py-3 text-center ${secondaryColClass}`}>
								N
							</th>
							<th scope="col" className={`px-3 py-3 text-center ${secondaryColClass}`}>
								S
							</th>
							<th scope="col" className={`px-3 py-3 text-center ${tertiaryColClass}`}>
								GF
							</th>
							<th scope="col" className={`px-3 py-3 text-center ${tertiaryColClass}`}>
								GS
							</th>
							<th scope="col" className={`px-3 py-3 text-center ${tertiaryColClass}`}>
								DR
							</th>
						</tr>
					</thead>
					<tbody>
						{standings.map((row, i) => (
							<tr
								key={row.team.id}
								className={`border-b border-line-soft transition-colors hover:bg-white/5 ${getRowVisibilityClass(i, mobileRows, desktopRows)}`}
							>
								<td className="px-2 py-2 text-center font-medium sm:px-3 sm:py-2.5">
									{row.position}
								</td>
								<td className="px-2 py-2 sm:px-3 sm:py-2.5">
									<div className="flex min-w-0 items-center">
										<span className="hidden truncate sm:inline">
											{row.team.name}
										</span>
										<span className="truncate sm:hidden">
											{row.team.shortName}
										</span>
									</div>
								</td>
								<td className="px-2 py-2 text-center font-bold text-accent sm:px-3 sm:py-2.5">
									{row.points}
								</td>
								<td className={`px-3 py-2.5 text-center ${secondaryColClass}`}>
									{row.playedGames}
								</td>
								<td className={`px-3 py-2.5 text-center ${secondaryColClass}`}>
									{row.won}
								</td>
								<td className={`px-3 py-2.5 text-center ${secondaryColClass}`}>
									{row.draw}
								</td>
								<td className={`px-3 py-2.5 text-center ${secondaryColClass}`}>
									{row.lost}
								</td>
								<td className={`px-3 py-2.5 text-center ${tertiaryColClass}`}>
									{row.goalsFor}
								</td>
								<td className={`px-3 py-2.5 text-center ${tertiaryColClass}`}>
									{row.goalsAgainst}
								</td>
								<td className={`px-3 py-2.5 text-center ${tertiaryColClass}`}>
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
	)

	if (inline || nested) return content
	return <section className="section">{content}</section>
}
