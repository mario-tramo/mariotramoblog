'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import moduleProps from '@/lib/moduleProps'
import CTAList from '@/ui/primitives/CTAList'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import resolveUrl from '@/lib/resolveUrl'
import { stegaClean } from 'next-sanity'
import Link from 'next/link'

const AUTOPLAY_MS = 6000

function Slide({
	slide,
	active,
	isFirst,
}: {
	slide: Sanity.HeroSlide
	active: boolean
	isFirst: boolean
}) {
	return (
		<div
			className={cn(
				'absolute inset-0 transition-all duration-1000',
				active ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
			)}
			aria-hidden={!active}
		>
			{slide.imageUrl && (
				<Image
					src={slide.imageUrl}
					alt={slide.title ?? ''}
					fill
					sizes="100vw"
					className={cn(
						'object-cover',
						active && 'animate-ken-burns',
					)}
					// First slide is the LCP candidate: eager + high fetch priority
					// (`priority` is deprecated in Next 16 and drops fetchpriority=high).
					loading={isFirst ? 'eager' : undefined}
					fetchPriority={isFirst ? 'high' : undefined}
				/>
			)}
		</div>
	)
}

export default function Hero({
	slides,
	...props
}: {
	slides?: Sanity.HeroSlide[]
} & Sanity.Module) {
	const [current, setCurrent] = useState(0)
	const [paused, setPaused] = useState(false)
	const [progress, setProgress] = useState(0)
	const count = slides?.length ?? 0
	const isCarousel = count > 1
	const dragX = useRef<number | null>(null)
	const dragDx = useRef(0)
	const rafRef = useRef<number>(0)
	const startRef = useRef<number>(0)

	const next = useCallback(() => {
		setProgress(0)
		setCurrent((prev) => (prev + 1) % count)
	}, [count])

	const prev = useCallback(() => {
		setProgress(0)
		setCurrent((prev) => (prev - 1 + count) % count)
	}, [count])

	// Autoplay with progress bar
	useEffect(() => {
		if (!isCarousel || paused) {
			cancelAnimationFrame(rafRef.current)
			return
		}
		startRef.current = performance.now()
		const tick = (now: number) => {
			const elapsed = now - startRef.current
			const pct = Math.min(elapsed / AUTOPLAY_MS, 1)
			setProgress(pct)
			if (pct >= 1) {
				next()
			} else {
				rafRef.current = requestAnimationFrame(tick)
			}
		}
		rafRef.current = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(rafRef.current)
	}, [isCarousel, paused, current, next])

	const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
		if ((e.target as HTMLElement).closest('a, button')) return
		dragX.current = e.clientX
		dragDx.current = 0
		;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
		setPaused(true)
	}, [])

	const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
		if (dragX.current === null) return
		dragDx.current = e.clientX - dragX.current
	}, [])

	const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
		if (dragX.current === null) return
		const dx = dragDx.current
		dragX.current = null
		dragDx.current = 0
		try {
			;(e.currentTarget as HTMLDivElement).releasePointerCapture(
				e.pointerId,
			)
		} catch {}
		setPaused(false)
		if (Math.abs(dx) > 50) (dx < 0 ? next : prev)()
	}, [next, prev])

	const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === 'ArrowRight') {
			e.preventDefault()
			next()
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault()
			prev()
		}
	}, [next, prev])

	const onMouseEnter = useCallback(() => setPaused(true), [])
	const onMouseLeave = useCallback(() => setPaused(false), [])

	if (!slides?.length) return null

	const s = slides[current]

	const slideHref = s.cta?.link?.type === 'internal' && s.cta.link.internal
		? resolveUrl(s.cta.link.internal, { base: false, params: s.cta.link.params })
		: s.cta?.link?.type === 'external' && s.cta.link.external
			? stegaClean(s.cta.link.external)
			: null

	return (
		<section
			className="group relative aspect-[16/9] max-h-[520px] touch-pan-y select-none overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand sm:aspect-[21/9] md:max-h-[560px]"
			aria-roledescription={isCarousel ? 'carousel' : undefined}
			aria-label={isCarousel ? 'Hero slides' : undefined}
			tabIndex={0}
			onKeyDown={onKeyDown}
			onPointerDown={isCarousel ? onPointerDown : undefined}
			onPointerMove={isCarousel ? onPointerMove : undefined}
			onPointerUp={isCarousel ? onPointerUp : undefined}
			onPointerCancel={isCarousel ? onPointerUp : undefined}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			{...moduleProps(props)}
		>
			<div aria-live="polite" aria-atomic="true" className="sr-only">
				{`Slide ${current + 1} di ${count}`}
			</div>

			{slides.map((slide, i) => (
				<Slide key={slide._key} slide={slide} active={i === current} isFirst={i === 0} />
			))}

			{/* Gradient overlays — cinematic depth */}
			<div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 via-40% to-transparent" />
			<div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

			{/* Full-slide clickable overlay */}
			{slideHref && (
				<Link href={slideHref} className="absolute inset-0 z-[1]" aria-label={s.title}>
					<span className="sr-only">{s.title}</span>
				</Link>
			)}

			{/* Content — cinematic editorial layout */}
			<div className="pointer-events-none relative z-[2] flex h-full flex-col justify-end p-5 sm:p-8 md:p-12">
				<div className="max-w-3xl space-y-3 md:space-y-4">
					{/* Category label */}
					{s.cta?.link?.label && (
						<span className="inline-block rounded bg-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white sm:text-xs">
							{s.cta.link.label === 'Leggi di più' ? '' : s.cta.link.label}
						</span>
					)}

					<h2 className="font-heading text-4xl uppercase leading-[0.92] tracking-tight text-white drop-shadow-lg sm:text-6xl md:text-7xl lg:text-8xl">
						{s.title}
					</h2>

					{s.description && (
						<p className="line-clamp-2 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base md:text-lg">
							{s.description}
						</p>
					)}

					{/* Author + CTA row */}
					<div className="flex items-center gap-4 pt-1">
						{s.author && (
							<div className="flex items-center gap-2 text-xs text-white/60 sm:text-sm">
								<span className="grid size-7 place-items-center rounded-full bg-white/15 text-[10px] font-bold text-white">
									{getInitials(s.author.name)}
								</span>
								{s.author.name}
							</div>
						)}
						<CTAList
							ctas={[s.cta]}
							className="pointer-events-auto [&_a]:inline-flex [&_a]:items-center [&_a]:gap-1.5 [&_a]:rounded-lg [&_a]:bg-brand [&_a]:px-5 [&_a]:py-2 [&_a]:text-xs [&_a]:font-bold [&_a]:uppercase [&_a]:tracking-wide [&_a]:text-white [&_a]:transition [&_a]:hover:opacity-90 sm:[&_a]:text-sm"
						/>
					</div>
				</div>

				{/* Navigation + progress */}
				{isCarousel && (
					<div className="pointer-events-auto mt-6 flex items-center gap-3 sm:mt-8">
						<button
							onClick={prev}
							className="grid size-9 place-items-center rounded-full border border-white/20 text-white transition hover:border-white/40 hover:bg-white/10 sm:size-10"
							aria-label="Slide precedente"
						>
							<ChevronLeft className="size-4" />
						</button>
						<button
							onClick={next}
							className="grid size-9 place-items-center rounded-full border border-white/20 text-white transition hover:border-white/40 hover:bg-white/10 sm:size-10"
							aria-label="Slide successiva"
						>
							<ChevronRight className="size-4" />
						</button>

						{/* Progress indicators */}
						<div
							className="ml-2 flex items-center gap-1.5"
							role="group"
							aria-label="Seleziona slide"
						>
							{slides.map((slide, i) => (
								<button
									key={slide._key}
									onClick={() => { setProgress(0); setCurrent(i) }}
									className="relative h-1 overflow-hidden rounded-full transition-all"
									style={{ width: i === current ? 48 : 8 }}
									aria-label={`Vai alla slide ${i + 1} di ${count}`}
									aria-current={i === current ? 'true' : undefined}
								>
									<span className="absolute inset-0 bg-white/25" />
									{i === current && (
										<span
											className="absolute inset-y-0 left-0 bg-brand transition-none"
											style={{ width: `${progress * 100}%` }}
										/>
									)}
								</button>
							))}
						</div>
					</div>
				)}
			</div>
		</section>
	)
}
