import type { Metadata } from 'next'
import Standings from '@/ui/modules/Standings'
import type { CompetitionCode } from '@/lib/football-data'

export const metadata: Metadata = {
	title: 'Classifiche',
	description: 'Classifiche aggiornate dei principali campionati di calcio europei',
}

const COMPETITIONS: CompetitionCode[] = ['SA', 'PL', 'PD', 'BL1', 'FL1']

export default function ClassifichePage() {
	return (
		<div className="py-8">
			<header className="section text-center">
				<h1 className="h2">Classifiche</h1>
				<p className="text-muted mt-2">
					I principali campionati europei
				</p>
			</header>

			{COMPETITIONS.map((code) => (
				<Standings key={code} competition={code} />
			))}
		</div>
	)
}
