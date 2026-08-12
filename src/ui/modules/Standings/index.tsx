import {
	fetchStandings,
	COMPETITIONS,
	StandingsError,
	APIErrorCode,
	type CompetitionCode,
	type Standing,
} from '@/lib/football-data'
import StandingsClient from './StandingsClient'
import StandingsTable from './StandingsTable'

export default async function Standings({
	competition = 'SA',
	mobileRows = '5',
	desktopRows = '5',
	inline = false,
	nested = false,
	expanded = false,
}: Partial<{
	competition: CompetitionCode
	mobileRows: '5' | '10' | 'all'
	desktopRows: '5' | '10' | 'all'
	inline: boolean
	nested: boolean
	expanded: boolean
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
			}
		}
		const errorContent = (
			<div className={inline ? '' : 'mx-auto max-w-screen-lg'}>
				<p className="text-center text-sm text-muted">{message}</p>
			</div>
		)

		if (expanded) {
			if (inline || nested) return errorContent
			return <section className="section">{errorContent}</section>
		}
		if (inline || nested) return <div className="max-h-[430px] overflow-hidden">{errorContent}</div>
		return <section className="section max-h-[430px] overflow-hidden">{errorContent}</section>
	}

	const content = (
		<div className={inline ? '' : 'mx-auto max-w-screen-lg'}>
			<header className="mb-4 border-b border-line-soft pb-3">
				<h2 className="font-heading text-3xl uppercase leading-none tracking-tight md:text-5xl">
					{competitionName}
				</h2>
				<div className="mt-2 h-1 w-10 rounded-full bg-brand" aria-hidden="true" />
				{currentMatchday != null && currentMatchday > 0 && (
					<p className="mt-1 text-xs text-muted">Giornata {currentMatchday}</p>
				)}
			</header>
			{expanded ? (
				<StandingsTable rows={standings} />
			) : (
				<StandingsClient
					competitionName={competitionName}
					currentMatchday={currentMatchday}
					rows={standings}
					inline={inline}
					mobileRows={mobileRows}
					desktopRows={desktopRows}
				/>
			)}
		</div>
	)

	if (expanded) {
		if (inline || nested) return content
		return <section className="section">{content}</section>
	}
	if (inline || nested) return <div className="max-h-[430px] overflow-hidden">{content}</div>
	return <section className="section max-h-[430px] overflow-hidden">{content}</section>
}
