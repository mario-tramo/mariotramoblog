'use client'

import LiveBar from './LiveBar'
import HeroSection from './HeroSection'
import { GridF3C, GridP1A, GridP2A, GridP3B } from './CardGrids'
import BytesCarousel from './BytesCarousel'
import RailSection from './RailSection'

export default function TestCardsPage() {
	return (
		<>
			{/* Sport category nav */}
			<SportNav />

			{/* Live match ticker */}
			<LiveBar />

			{/* Hero: featured + secondary */}
			<HeroSection />

			{/* Grid sections */}
			<GridF3C />
			<GridP1A />
			<GridP2A />
			<GridP3B />

			{/* Bytes video carousel — SuperSport style */}
			<BytesCarousel />

			{/* Two-column rail layout */}
			<RailSection />
		</>
	)
}

function SportNav() {
	const categories = [
		'Calcio',
		'Formula 1',
		'MotoGP',
		'Basket',
		'Tennis',
		'Ciclismo',
		'Volley',
		'Atletica',
		'Motori',
		'Altri sport',
	]

	return (
		<nav className="sticky top-[var(--header-height)] z-40 overflow-x-auto border-b border-line-soft bg-surface-contrast/95 backdrop-blur-md">
			<ul className="no-scrollbar mx-auto flex max-w-screen-2xl items-center gap-1 px-4 text-sm">
				{categories.map((cat) => (
					<li key={cat}>
						<a
							href="#"
							className="block whitespace-nowrap px-3 py-3 font-medium text-white/60 transition-colors hover:text-white"
						>
							{cat}
						</a>
					</li>
				))}
				<li className="ml-auto shrink-0">
					<a
						href="#"
						className="block whitespace-nowrap px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-accent transition-colors hover:text-white"
					>
						Sky Sport
					</a>
				</li>
			</ul>
		</nav>
	)
}
