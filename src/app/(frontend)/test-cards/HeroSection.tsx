'use client'

import { Play, Image as ImageIcon } from 'lucide-react'

export default function HeroSection() {
	return (
		<section className="section">
			<div className="grid gap-5 md:grid-cols-[1.6fr_1fr]">
				{/* Featured Card */}
				<article className="group relative overflow-hidden rounded-xl bg-surface-light">
					<div className="relative aspect-[16/9] md:aspect-[4/3]">
						<div className="absolute inset-0 bg-gradient-to-br from-accent-grad-from to-accent-grad-to" />
						<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
						<div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/30 to-transparent" />
						<div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent" />
						{/* Play button overlay */}
						<div className="absolute left-4 top-4 flex items-center gap-2 rounded bg-red-600/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
							<Play size={12} fill="currentColor" />
							<span>Video</span>
						</div>
						{/* Live badge */}
						<div className="absolute right-4 top-4 flex items-center gap-1.5 rounded bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
							<span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
							Live
						</div>
					</div>
					<div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
						<div className="mb-3 inline-block rounded bg-accent/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-accent">
							Calcio
						</div>
						<h2 className="mb-2 text-balance text-2xl font-bold leading-tight text-white md:text-3xl">
							La difesa a 3 sta rivoluzionando il calcio moderno
						</h2>
						<p className="mb-3 line-clamp-2 text-sm text-white/70">
							Analisi approfondita di come i migliori allenatori europei stanno reinventando il modulo difensivo, con dati e schemi tattici esclusivi.
						</p>
						<div className="flex items-center gap-3 text-xs text-white/50">
							<span>Gianluca Rossi</span>
							<span>&middot;</span>
							<span>22 Giu 2026</span>
							<span>&middot;</span>
							<span className="flex items-center gap-1">
								<ImageIcon size={12} />
								12 foto
							</span>
						</div>
					</div>
				</article>

				{/* Secondary Cards */}
				<div className="flex flex-col gap-5">
					{secondaryCards.map((card, i) => (
						<article
							key={i}
							className="group flex overflow-hidden rounded-xl bg-surface-light transition-all hover:translate-y-0.5"
						>
							<div className="flex flex-1 flex-col justify-center p-4">
								<div className="mb-2 inline-block self-start rounded bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent">
									{card.label}
								</div>
								<h3 className="mb-1 text-sm font-semibold leading-snug text-white line-clamp-2">
									{card.title}
								</h3>
								<div className="flex items-center gap-2 text-[11px] text-white/40">
									<span>{card.author}</span>
									<span>&middot;</span>
									<span>{card.date}</span>
								</div>
							</div>
							<div className="relative w-28 shrink-0 overflow-hidden md:w-32">
								<div className={`absolute inset-0 ${card.gradient}`} />
								<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
							</div>
						</article>
					))}
				</div>
			</div>
		</section>
	)
}

const secondaryCards = [
	{
		label: 'Formula 1',
		title: 'Leclerc: &ldquo;Ferrari ha trovato la direzione giusta&rdquo;',
		author: 'Marco Bianchi',
		date: '22 Giu 2026',
		gradient: 'bg-gradient-to-br from-red-900/60 to-red-950/60',
	},
	{
		label: 'MotoGP',
		title: 'Bagnaia domina le prove libere a Barcellona',
		author: 'Laura Verdi',
		date: '21 Giu 2026',
		gradient: 'bg-gradient-to-br from-amber-900/60 to-amber-950/60',
	},
	{
		label: 'Basket',
		title: 'Nazionale, convocati per le qualificazioni mondiali',
		author: 'Andrea Neri',
		date: '21 Giu 2026',
		gradient: 'bg-gradient-to-br from-blue-900/60 to-blue-950/60',
	},
]
