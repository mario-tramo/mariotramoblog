'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'

interface ByteCard {
	title: string
	category: string
	gradient: string
}

const bytes: ByteCard[] = [
	{ title: 'Hélio Varela with the equaliser for the Blue Sharks', category: 'Football', gradient: 'from-emerald-900/80 to-emerald-950/80' },
	{ title: 'How to celebrate your first FIFA World Cup 2026', category: 'Football', gradient: 'from-sky-900/80 to-sky-950/80' },
	{ title: "Mo Salah's goal from every angle", category: 'Football', gradient: 'from-red-900/80 to-red-950/80' },
	{ title: 'Gakpo\'s Strike Roars in isiZulu — ZZ Masondo\'s Mic Brings the Magic!', category: 'Football', gradient: 'from-amber-900/80 to-amber-950/80' },
	{ title: 'On The Mark - Day 10 | Elephants still in the running', category: 'Football', gradient: 'from-green-900/80 to-green-950/80' },
	{ title: 'The journey to 100 goals! Brobbey scores landmark World Cup goal', category: 'Football', gradient: 'from-orange-900/80 to-orange-950/80' },
	{ title: 'Lions, hotdogs, cowboys... It wouldn\'t be a World Cup without fancy dress fans!', category: 'Football', gradient: 'from-purple-900/80 to-purple-950/80' },
	{ title: 'Manu Tshituka on celebrating his birthday in the Springboks camp', category: 'Rugby', gradient: 'from-yellow-900/80 to-yellow-950/80' },
	{ title: 'Lionel Messi has still got it! Check out his best touches v Algeria', category: 'Football', gradient: 'from-blue-900/80 to-blue-950/80' },
	{ title: 'Round 1 best saves! Courtois, Suzuki, Beach & Vozinha the standout stars', category: 'Football', gradient: 'from-indigo-900/80 to-indigo-950/80' },
	{ title: 'These 95 minutes were totally worth the wait for Ghana manager Carlos Queiroz', category: 'Football', gradient: 'from-teal-900/80 to-teal-950/80' },
	{ title: 'The band is back together! Ronaldinho and 2002 Brazil stars', category: 'Football', gradient: 'from-rose-900/80 to-rose-950/80' },
]

export default function BytesCarousel() {
	const scrollRef = useRef<HTMLDivElement>(null)
	const [showLeft, setShowLeft] = useState(false)
	const [showRight, setShowRight] = useState(true)

	function updateArrows() {
		const el = scrollRef.current
		if (!el) return
		setShowLeft(el.scrollLeft > 16)
		setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 16)
	}

	function scroll(dir: 'left' | 'right') {
		if (!scrollRef.current) return
		const amount = scrollRef.current.clientWidth * 0.75
		scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
	}

	return (
		<section className="relative overflow-hidden bg-gradient-to-b from-surface-soft via-surface to-surface pb-16 pt-10">
			<div className="mx-auto max-w-screen-2xl px-4 md:px-10 xl:px-0">
				<h2 className="mb-6 text-2xl font-bold text-white md:text-3xl">
					Bytes
				</h2>

				<div className="relative">
					{/* Left arrow */}
					<div
						className={`absolute bottom-0 left-0 top-0 z-10 hidden items-center bg-gradient-to-r from-surface/90 to-transparent pl-1 transition-opacity duration-300 md:flex ${
							showLeft ? 'opacity-100' : 'pointer-events-none opacity-0'
						}`}
					>
						<button
							onClick={() => scroll('left')}
							className="flex h-10 w-10 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
							aria-label="Precedenti"
						>
							<ChevronLeft size={24} />
						</button>
					</div>

					{/* Track */}
					<div
						ref={scrollRef}
						onScroll={updateArrows}
						className="no-scrollbar flex gap-4 overflow-x-auto pb-4"
					>
						{bytes.map((byte, i) => (
							<button
								key={i}
								type="button"
								className="group/byte relative w-29 shrink-0 cursor-pointer overflow-hidden rounded-lg lg:w-49"
								style={{ aspectRatio: '9 / 16' }}
							>
								{/* Image placeholder */}
								<div className={`absolute inset-0 bg-gradient-to-br ${byte.gradient}`}>
									<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
								</div>

								{/* Gradient overlay */}
								<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

								{/* Play button */}
								<div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
									<div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 shadow-lg transition-transform duration-300 group-hover/byte:scale-110 lg:h-12 lg:w-12">
										<Play size={14} fill="white" className="ml-0.5 text-white lg:h-6 lg:w-6" />
									</div>
								</div>

								{/* Content */}
								<div className="absolute bottom-0 left-0 right-0 z-10 p-3 lg:p-4">
									<h3 className="mb-1 text-xs font-medium leading-snug text-white line-clamp-3 lg:mb-2 lg:text-lg lg:font-bold">
										{byte.title}
									</h3>
									<p className="text-[10px] leading-none text-blue-400 line-clamp-1 lg:text-sm">
										{byte.category}
									</p>
								</div>
							</button>
						))}
					</div>

					{/* Right arrow */}
					<div
						className={`absolute bottom-0 right-0 top-0 z-10 hidden items-center justify-end bg-gradient-to-l from-surface/90 to-transparent pr-1 transition-opacity duration-300 md:flex ${
							showRight ? 'opacity-100' : 'pointer-events-none opacity-0'
						}`}
					>
						<button
							onClick={() => scroll('right')}
							className="flex h-10 w-10 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
							aria-label="Successivi"
						>
							<ChevronRight size={24} />
						</button>
					</div>
				</div>
			</div>
		</section>
	)
}
