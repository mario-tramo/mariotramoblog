'use client'

import { Play, Image as ImageIcon } from 'lucide-react'

/* ──────────────────────────────────────────────────
   SectionHeader — gradient divider + shadow title
   ────────────────────────────────────────────────── */
function SectionHeader({ title, shadow }: { title: string; shadow: string }) {
	return (
		<div className="mb-8">
			<div className="h-1 w-full bg-gradient-to-r from-accent via-accent/50 to-transparent" />
			<div className="relative mt-6">
				<span
					className="absolute -top-4 left-0 select-none text-[clamp(3rem,10vw,5rem)] font-black leading-none text-white/5"
					aria-hidden
				>
					{shadow}
				</span>
				<h2 className="relative text-2xl font-bold text-white md:text-3xl">
					{title}
				</h2>
			</div>
		</div>
	)
}

/* ──────────────────────────────────────────────────
   CardVertical — image on top, content below (CA10)
   ────────────────────────────────────────────────── */
function CardVertical({
	label,
	title,
	author,
	date,
	gradient,
	hasVideo,
	hasGallery,
}: {
	label: string
	title: string
	author: string
	date: string
	gradient: string
	hasVideo?: boolean
	hasGallery?: boolean
}) {
	return (
		<article className="group flex flex-col overflow-hidden rounded-xl bg-surface-light transition-all hover:-translate-y-1">
			<div className={`relative aspect-[16/9] ${gradient}`}>
				{hasVideo && (
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110">
							<Play size={20} fill="white" className="ml-0.5 text-white" />
						</div>
					</div>
				)}
				{hasGallery && (
					<div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-[10px] text-white">
						<ImageIcon size={10} />
						<span>8</span>
					</div>
				)}
				<div className="absolute left-3 top-3 rounded bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent backdrop-blur-sm">
					{label}
				</div>
			</div>
			<div className="flex flex-1 flex-col justify-between gap-3 p-4">
				<h3 className="font-semibold leading-snug text-white line-clamp-3">
					{title}
				</h3>
				<div className="flex items-center gap-2 text-[11px] text-white/40">
					<span>{author}</span>
					<span>&middot;</span>
					<span>{date}</span>
				</div>
			</div>
		</article>
	)
}

/* ──────────────────────────────────────────────────
   CardHorizontal — content left, image right (CA05C)
   ────────────────────────────────────────────────── */
function CardHorizontal({
	label,
	title,
	author,
	date,
	gradient,
}: {
	label: string
	title: string
	author: string
	date: string
	gradient: string
}) {
	return (
		<article className="group flex overflow-hidden rounded-xl bg-surface-light transition-all hover:-translate-y-0.5">
			<div className="flex flex-1 flex-col justify-center gap-2 p-4">
				<div className="inline-block self-start rounded bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent">
					{label}
				</div>
				<h3 className="text-sm font-semibold leading-snug text-white line-clamp-2">
					{title}
				</h3>
				<div className="flex items-center gap-2 text-[11px] text-white/40">
					<span>{author}</span>
					<span>&middot;</span>
					<span>{date}</span>
				</div>
			</div>
			<div className={`relative w-28 shrink-0 overflow-hidden md:w-36 ${gradient}`} />
		</article>
	)
}

/* ──────────────────────────────────────────────────
   CardMini — compact, for sidebars / rail
   ────────────────────────────────────────────────── */
function CardMini({
	number,
	title,
	author,
	date,
}: {
	number: number
	title: string
	author: string
	date: string
}) {
	return (
		<article className="group flex items-start gap-3 border-b border-line-soft pb-4 last:border-0 last:pb-0">
			<span className="mt-0.5 shrink-0 text-2xl font-black leading-none text-white/10">
				{String(number).padStart(2, '0')}
			</span>
			<div className="min-w-0 flex-1">
				<h4 className="text-sm font-semibold leading-snug text-white transition-colors group-hover:text-accent line-clamp-2">
					{title}
				</h4>
				<div className="mt-1 flex items-center gap-2 text-[11px] text-white/40">
					<span>{author}</span>
					<span>&middot;</span>
					<span>{date}</span>
				</div>
			</div>
		</article>
	)
}

/* ──────────────────────────────────────────────────
   Section exports
   ────────────────────────────────────────────────── */

/** F3C pattern: pure 3-column grid of vertical cards */
export function GridF3C() {
	return (
		<section className="section" data-module>
			<SectionHeader title="In primo piano" shadow="in primo piano" />
			<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{f3cCards.map((card, i) => (
					<CardVertical key={i} {...card} />
				))}
			</div>
		</section>
	)
}

/** P1A pattern: 1 featured vertical card + 2 horizontal cards stacked */
export function GridP1A() {
	return (
		<section className="section" data-module>
			<SectionHeader title="Da non perdere" shadow="da non perdere" />
			<div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
				<div>
					<CardVertical {...p1aFeatured} />
				</div>
				<div className="flex flex-col gap-4">
					{p1aList.map((card, i) => (
						<CardHorizontal key={i} {...card} />
					))}
				</div>
			</div>
		</section>
	)
}

/** P2A pattern: 2-column grid of vertical cards */
export function GridP2A() {
	return (
		<section className="section" data-module>
			<SectionHeader title="Le più lette" shadow="le più lette" />
			<div className="grid gap-5 sm:grid-cols-2">
				{p2aCards.map((card, i) => (
					<CardVertical key={i} {...card} />
				))}
			</div>
		</section>
	)
}

/** P3B pattern: 3-column grid of mixed cards (first vertical, rest horizontal) */
export function GridP3B() {
	return (
		<section className="section" data-module>
			<SectionHeader title="Ultime notizie" shadow="ultime notizie" />
			<div className="grid gap-5 md:grid-cols-[1.4fr_1fr_1fr]">
				<CardVertical {...p3bFeatured} />
				{p3bList.map((card, i) => (
					<div key={i}>
						<CardHorizontal {...card} />
					</div>
				))}
			</div>
		</section>
	)
}

/** Rail-friendly mini card list */
export function RailMiniList({ title }: { title?: string }) {
	return (
		<div>
			{title && (
				<div className="mb-5">
					<div className="h-0.5 w-8 bg-accent" />
					<h3 className="mt-3 text-lg font-bold text-white">{title}</h3>
				</div>
			)}
			<div className="space-y-4">
				{miniCards.map((card, i) => (
					<CardMini key={i} number={i + 1} {...card} />
				))}
			</div>
		</div>
	)
}

/* ──────────────────────────────────────────────────
   Dummy data
   ────────────────────────────────────────────────── */

const f3cCards = [
	{ label: 'Calcio', title: 'Il nuovo modulo di Ancelotti: come sta cambiando il Real Madrid', author: 'Gianluca Rossi', date: '22 Giu 2026', gradient: 'bg-gradient-to-br from-blue-900/60 to-blue-950/60', hasVideo: true },
	{ label: 'Formula 1', title: 'Hamilton: "Questa stagione è la più impegnativa della mia carriera"', author: 'Marco Bianchi', date: '21 Giu 2026', gradient: 'bg-gradient-to-br from-red-900/60 to-red-950/60', hasGallery: true },
	{ label: 'MotoGP', title: 'Ducati svela il nuovo pacchetto aerodinamico per il GP di Olanda', author: 'Laura Verdi', date: '21 Giu 2026', gradient: 'bg-gradient-to-br from-amber-900/60 to-amber-950/60' },
]

const p1aFeatured = { label: 'Calciomercato', title: 'Calciomercato, tutte le trattative del giorno: le ultime news su Osimhen e Lukaku', author: 'Simone Conti', date: '22 Giu 2026', gradient: 'bg-gradient-to-br from-emerald-900/60 to-emerald-950/60', hasVideo: true }

const p1aList = [
	{ label: 'Serie A', title: 'Juventus, Thiago Motta: "Dobbiamo crescere nella gestione"', author: 'Federico Bruni', date: '22 Giu 2026', gradient: 'bg-gradient-to-br from-zinc-800/60 to-zinc-900/60' },
	{ label: 'Champions', title: 'Inter, Inzaghi: "Abbiamo dimostrato carattere" dopo la rimonta', author: 'Federico Bruni', date: '21 Giu 2026', gradient: 'bg-gradient-to-br from-sky-900/60 to-sky-950/60' },
]

const p2aCards = [
	{ label: 'Tennis', title: 'Sinner vola ai quarti: "È il mio momento migliore"', author: 'Elena Rinaldi', date: '22 Giu 2026', gradient: 'bg-gradient-to-br from-green-900/60 to-green-950/60', hasGallery: true },
	{ label: 'Ciclismo', title: 'Giro d\'Italia 2026, percorso e tappe: tutte le novità', author: 'Paolo Ferri', date: '21 Giu 2026', gradient: 'bg-gradient-to-br from-pink-900/60 to-pink-950/60' },
]

const p3bFeatured = { label: 'Calcio Estero', title: 'Premier League, il Manchester City non si ferma: quinta vittoria consecutiva', author: 'Luca Marchetti', date: '22 Giu 2026', gradient: 'bg-gradient-to-br from-indigo-900/60 to-indigo-950/60', hasVideo: true }

const p3bList = [
	{ label: 'NBA', title: 'Magic Johnson: "Lakers, così non si vince"', author: 'Andrea Neri', date: '22 Giu 2026', gradient: 'bg-gradient-to-br from-purple-900/60 to-purple-950/60' },
	{ label: 'Volley', title: 'Superlega, Perugia si rinforza: arriva il centrale polacco', author: 'Chiara Costa', date: '21 Giu 2026', gradient: 'bg-gradient-to-br from-yellow-900/60 to-yellow-950/60' },
]

	const miniCards = [
	{ title: 'Sky Sport esclusiva: l\'intervista a Bagnaia dopo la vittoria', author: 'Sky Sport', date: '22 Giu 2026' },
	{ title: 'Calciomercato, Chelsea su Kvaratskhelia: offerta da 80 milioni', author: 'Sky Sport', date: '22 Giu 2026' },
	{ title: 'Giannis Antetokounmpo: "Milwaukee è casa mia"', author: 'Sky Sport', date: '21 Giu 2026' },
	{ title: 'MotoGP, Martin: "Pronto per lottare per il titolo"', author: 'Sky Sport', date: '21 Giu 2026' },
	{ title: 'Serie A, le designazioni arbitrali della 10ª giornata', author: 'Sky Sport', date: '21 Giu 2026' },
	{ title: 'Sinner conquista Vienna: ennesimo record italiano', author: 'Sky Sport', date: '20 Giu 2026' },
]
