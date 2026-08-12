import type { Metadata } from 'next'
import { Suspense } from 'react'
import HomeV5 from '@/ui/modules/HomeV5'

export const revalidate = 3600

export const metadata: Metadata = {
	title: 'Home 5',
	robots: { index: false, follow: false },
}

export default function Page() {
	return (
		<Suspense fallback={<Home5Skeleton />}>
			<HomeV5 />
		</Suspense>
	)
}

function Home5Skeleton() {
	return (
		<div className="space-y-10 md:space-y-16">
			<div className="section !pt-4 !pb-2 md:!pb-4">
				<div className="animate-pulse aspect-[16/9] rounded-2xl bg-white/10" />
			</div>
			<div className="section grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-6">
				<div className="animate-pulse aspect-[16/9] rounded-xl bg-white/10" />
				<div className="space-y-4">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="animate-pulse h-16 rounded-md bg-white/10" />
					))}
				</div>
			</div>
		</div>
	)
}