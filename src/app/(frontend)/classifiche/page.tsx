import { Suspense } from 'react'
import type { Metadata } from 'next'
import Standings from '@/ui/modules/Standings'
import StandingsSkeleton from '@/ui/skeletons/StandingsSkeleton'
import type { CompetitionCode } from '@/lib/football-data'
import { BASE_URL } from '@/lib/env'

export const metadata: Metadata = {
	title: 'Classifiche',
	description: 'Classifiche aggiornate dei principali campionati di calcio europei',
	alternates: {
		canonical: '/classifiche',
	},
}

const COMPETITIONS: CompetitionCode[] = ['SA', 'PL', 'PD', 'BL1', 'FL1']

export default function ClassifichePage() {
	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: 'Classifiche | Trm Sport',
		description: 'Classifiche aggiornate dei principali campionati di calcio europei',
		url: `${BASE_URL}/classifiche`,
		inLanguage: 'it',
		isPartOf: {
			'@type': 'WebSite',
			name: 'Trm Sport',
			url: BASE_URL,
		},
	}

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<div className="py-8">
				<header className="section text-center">
					<h1 className="h2">Classifiche</h1>
					<p className="text-muted mt-2">
						I principali campionati europei
					</p>
				</header>

				{COMPETITIONS.map((code) => (
					<Suspense key={code} fallback={<StandingsSkeleton />}>
						<Standings competition={code} />
					</Suspense>
				))}
			</div>
		</>
	)
}
