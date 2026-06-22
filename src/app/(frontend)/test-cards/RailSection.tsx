'use client'

import { Play } from 'lucide-react'
import { useState } from 'react'
import { RailMiniList } from './CardGrids'

const tabs = [
	{ id: 'video', label: 'Video' },
	{ id: 'live', label: 'Live' },
	{ id: 'risultati', label: 'Risultati' },
]

export default function RailSection() {
	const [activeTab, setActiveTab] = useState('video')

	return (
		<section className="section" data-module>
			<div className="grid gap-10 lg:grid-cols-[1fr_320px]">
				{/* Main */}
				<div>
					<div className="mb-6">
						<div className="h-1 w-full bg-gradient-to-r from-accent via-accent/50 to-transparent" />
						<div className="relative mt-6">
							<span
								className="absolute -top-4 left-0 select-none text-[clamp(3rem,10vw,5rem)] font-black leading-none text-white/5"
								aria-hidden
							>
								sky sport
							</span>
							<h2 className="relative text-2xl font-bold text-white md:text-3xl">
								Sky Sport Player
							</h2>
						</div>
					</div>

					{/* Tabs */}
					<div className="mb-6 flex gap-1 border-b border-line-soft">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`relative px-4 py-3 text-sm font-medium transition-colors ${
									activeTab === tab.id
										? 'text-accent after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-accent'
										: 'text-white/50 hover:text-white/80'
								}`}
							>
								{tab.label}
							</button>
						))}
					</div>

					{/* Tab content */}
					{activeTab === 'video' && (
						<div className="grid gap-5 sm:grid-cols-2">
							{videoItems.map((item, i) => (
								<article key={i} className="group overflow-hidden rounded-xl bg-surface-light">
									<div className={`relative aspect-video ${item.gradient}`}>
										<div className="absolute inset-0 flex items-center justify-center">
											<div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110">
												<Play size={22} fill="white" className="ml-1 text-white" />
											</div>
										</div>
										<div className="absolute bottom-2 left-2 rounded bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent backdrop-blur-sm">
											{item.label}
										</div>
										<div className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
											{item.duration}
										</div>
									</div>
									<div className="p-3">
										<h3 className="text-sm font-semibold leading-snug text-white line-clamp-2">
											{item.title}
										</h3>
										<p className="mt-1 text-[11px] text-white/40">{item.date}</p>
									</div>
								</article>
							))}
						</div>
					)}

					{activeTab === 'live' && (
						<div className="rounded-xl bg-surface-light p-8 text-center text-white/50">
							<p className="text-lg font-semibold">Nessun evento live in questo momento</p>
							<p className="mt-2 text-sm">I prossimi eventi inizieranno alle 20:45</p>
						</div>
					)}

					{activeTab === 'risultati' && (
						<div className="space-y-3">
							{results.map((r, i) => (
								<div key={i} className="flex items-center justify-between rounded-lg bg-surface-light px-5 py-3">
									<div className="flex flex-col items-start gap-0.5">
										<span className="text-sm font-medium text-white">{r.home}</span>
										<span className="text-sm font-medium text-white">{r.away}</span>
									</div>
									<div className="text-right">
										<span className="text-lg font-bold tabular-nums text-accent">{r.homeScore}–{r.awayScore}</span>
										<p className="text-[10px] uppercase tracking-wider text-white/30">{r.competition}</p>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Rail */}
				<aside className="space-y-8">
					<RailMiniList title="Più letti" />

					{/* Ad placeholder */}
					<div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-surface-light/50 text-xs text-white/20">
						Pubblicit&agrave;
					</div>
				</aside>
			</div>
		</section>
	)
}

const videoItems = [
	{ label: 'Calcio', title: 'Il punto sul calciomercato di giugno con Gianluca Di Marzio', duration: '12:34', date: '22 Giu 2026', gradient: 'bg-gradient-to-br from-sky-900/60 to-sky-950/60' },
	{ label: 'MotoGP', title: 'Prove libere GP Olanda: Bagnaia il più veloce', duration: '08:15', date: '22 Giu 2026', gradient: 'bg-gradient-to-br from-amber-900/60 to-amber-950/60' },
	{ label: 'Formula 1', title: 'Sky Sport Tech: analisi della nuova Ferrari SF-26', duration: '15:42', date: '21 Giu 2026', gradient: 'bg-gradient-to-br from-red-900/60 to-red-950/60' },
	{ label: 'Basket', title: 'NBA Finals 2026: il percorso dei Boston Celtics', duration: '10:08', date: '21 Giu 2026', gradient: 'bg-gradient-to-br from-green-900/60 to-green-950/60' },
]

const results = [
	{ home: 'Argentina', away: 'Austria', homeScore: 2, awayScore: 1, competition: 'Mondiale 2026' },
	{ home: 'Francia', away: 'Iraq', homeScore: 0, awayScore: 0, competition: 'Mondiale 2026' },
	{ home: 'Nuova Zelanda', away: 'Egitto', homeScore: 1, awayScore: 3, competition: 'Mondiale 2026' },
	{ home: 'Italia', away: 'Germania', homeScore: 1, awayScore: 1, competition: 'Amichevole' },
]
