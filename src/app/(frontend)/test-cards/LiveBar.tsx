'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'

interface Match {
	home: string
	away: string
	homeScore?: number
	awayScore?: number
	status: 'live' | 'finished' | 'upcoming'
	minute?: number
}

const matches: Match[] = [
	{ home: 'Argentina', away: 'Austria', homeScore: 2, awayScore: 1, status: 'live', minute: 72 },
	{ home: 'Francia', away: 'Iraq', homeScore: 0, awayScore: 0, status: 'live', minute: 34 },
	{ home: 'Nuova Zelanda', away: 'Egitto', homeScore: 1, awayScore: 3, status: 'finished' },
	{ home: 'Italia', away: 'Germania', status: 'upcoming' },
	{ home: 'Brasile', away: 'Spagna', homeScore: 0, awayScore: 1, status: 'live', minute: 56 },
	{ home: 'Inghilterra', away: 'Portogallo', homeScore: 2, awayScore: 2, status: 'finished' },
	{ home: 'Olanda', away: 'Belgio', status: 'upcoming' },
	{ home: 'Croazia', away: 'Turchia', homeScore: 0, awayScore: 0, status: 'live', minute: 12 },
]

export default function LiveBar() {
	const scrollRef = useRef<HTMLDivElement>(null)

	function scroll(dir: 'left' | 'right') {
		if (!scrollRef.current) return
		const amount = 300
		scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
	}

	return (
		<section className="relative overflow-hidden border-b border-line-soft bg-surface-contrast">
			<div className="relative mx-auto flex max-w-screen-2xl items-center">
				<button
					onClick={() => scroll('left')}
					className="absolute left-0 z-10 hidden h-full items-center bg-surface-contrast px-2 text-white/60 transition-colors hover:text-white md:flex"
					aria-label="Scorri a sinistra"
				>
					<ChevronLeft size={20} />
				</button>

				<div
					ref={scrollRef}
					className="no-scrollbar flex gap-px overflow-x-auto"
				>
					{matches.map((match, i) => (
						<div
							key={i}
							className="flex shrink-0 items-center gap-4 px-5 py-3 text-sm transition-colors hover:bg-surface/40"
						>
							<div className="flex flex-col items-end gap-0.5">
								<span className={`whitespace-nowrap font-medium ${match.status === 'live' ? 'text-white' : match.status === 'finished' ? 'text-white/80' : 'text-white/50'}`}>
									{match.home}
								</span>
								<span className={`whitespace-nowrap font-medium ${match.status === 'live' ? 'text-white' : match.status === 'finished' ? 'text-white/80' : 'text-white/50'}`}>
									{match.away}
								</span>
							</div>

							<div className="flex flex-col items-center gap-0.5">
								{match.status === 'live' && (
									<>
										<span className="font-bold tabular-nums text-accent">
											{match.homeScore}–{match.awayScore}
										</span>
										<span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-red-500">
											<span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
											{match.minute}&rsquo;
										</span>
									</>
								)}
								{match.status === 'finished' && (
									<>
										<span className="font-bold tabular-nums text-white/70">
											{match.homeScore}–{match.awayScore}
										</span>
										<span className="text-[10px] uppercase tracking-wider text-white/30">Finale</span>
									</>
								)}
								{match.status === 'upcoming' && (
									<>
										<span className="text-xs font-bold text-white/40">vs</span>
										<span className="text-[10px] uppercase tracking-wider text-white/30">20:45</span>
									</>
								)}
							</div>
						</div>
					))}
				</div>

				<button
					onClick={() => scroll('right')}
					className="absolute right-0 z-10 hidden h-full items-center bg-surface-contrast px-2 text-white/60 transition-colors hover:text-white md:flex"
					aria-label="Scorri a destra"
				>
					<ChevronRight size={20} />
				</button>
			</div>
		</section>
	)
}
