import type { Metadata } from 'next'
import { Suspense } from 'react'
import Home4 from './Home4'

export const revalidate = 3600

export const metadata: Metadata = {
	title: 'Home',
	description:
		'TRM Sport — notizie sportive, calcio, calciomercato, Formula 1, tennis e fantacalcio. Analisi e approfondimenti in tempo reale.',
	robots: { index: false, follow: false },
}

export default function Home4Page() {
	return (
		<Suspense fallback={<Home4Skeleton />}>
			<Home4 />
		</Suspense>
	)
}

function Home4Skeleton() {
	return (
		<div className="mx-auto max-w-screen-2xl space-y-5 p-4 sm:p-6">
			<div className="skeleton aspect-[16/9] w-full rounded-xl" />
			<div className="grid gap-5 lg:grid-cols-2">
				{[...Array(4)].map((_, i) => (
					<div key={i} className="skeleton-2 rounded-xl" />
				))}
			</div>
		</div>
	)
}