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
				'absolute inset-0 transition-opacity duration-700',
				active ? 'opacity-100' : 'opacity-0',
			)}
			aria-hidden={!active}
		>
			{slide.imageUrl && (
				<Image
					src={slide.imageUrl}
					alt={slide.title ?? ''}
					fill
					sizes="100vw"
					className="object-cover"
					priority={isFirst}
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
	const count = slides?.length ?? 0
	const isCarousel = count > 1
	const dragX = useRef<number | null>(null)
	const dragDx = useRef(0)

	const next = useCallback(() => {
		setCurrent((prev) => (prev + 1) % count)
	}, [count])

	const prev = useCallback(() => {
		setCurrent((prev) => (prev - 1 + count) % count)
	}, [count])

	useEffect(() => {
		if (!isCarousel || paused) return
		const interval = setInterval(next, 6000)
		return () => clearInterval(interval)
	}, [isCarousel, next, paused])

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

	// Extract URL from CTA for full-slide clickability
	const slideHref = s.cta?.link?.type === 'internal' && s.cta.link.internal
		? resolveUrl(s.cta.link.internal, { base: false, params: s.cta.link.params })
		: s.cta?.link?.type === 'external' && s.cta.link.external
			? stegaClean(s.cta.link.external)
			: null

	return (
		<section
			className="group relative aspect-[16/9] max-h-[380px] touch-pan-y select-none overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand sm:aspect-[21/9] md:aspect-[3/1]"
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

			{/* Gradient overlays — editorial: lighter, let image breathe */}
			<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

			{/* Full-slide clickable overlay */}
			{slideHref && (
				<Link href={slideHref} className="absolute inset-0 z-[1]" aria-label={s.title}>
					<span className="sr-only">{s.title}</span>
				</Link>
			)}

			{/* Content — compact editorial layout */}
			<div className="relative z-[2] flex h-full flex-col justify-end p-4 pointer-events-none sm:p-6">
				<div>
					<h2 className="font-heading text-2xl uppercase leading-none text-white sm:text-3xl md:text-4xl">
						{s.title}
					</h2>

					{s.description && (
						<p className="mt-2 max-w-lg text-sm text-white/80 line-clamp-2">
							{s.description}
						</p>
					)}

					{/* Author + navigation row */}
					<div className="mt-3 flex items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							{s.author && (
								<div className="flex items-center gap-2 text-xs text-white/70">
									<span className="grid size-6 place-items-center rounded-full bg-brand text-[9px] font-bold text-brand-foreground">
										{getInitials(s.author.name)}
									</span>
									{s.author.name}
								</div>
							)}
							<CTAList
								ctas={[s.cta]}
								className="pointer-events-auto [&_a]:inline-flex [&_a]:items-center [&_a]:gap-1.5 [&_a]:rounded [&_a]:bg-brand [&_a]:px-4 [&_a]:py-1.5 [&_a]:text-xs [&_a]:font-semibold [&_a]:text-white [&_a]:transition [&_a]:hover:opacity-90"
							/>
						</div>

						{isCarousel && (
							<div className="pointer-events-auto flex items-center gap-1.5">
								<button
									onClick={prev}
									className="grid size-8 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
									aria-label="Slide precedente"
								>
									<ChevronLeft className="size-3.5" />
								</button>
								<button
									onClick={next}
									className="grid size-8 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
									aria-label="Slide successiva"
								>
									<ChevronRight className="size-3.5" />
								</button>
							</div>
						)}
					</div>

					{/* Dots */}
					{isCarousel && (
						<div
							className="pointer-events-auto mt-3 flex items-center gap-1"
							role="group"
							aria-label="Seleziona slide"
						>
							{slides.map((slide, i) => (
								<button
									key={slide._key}
									onClick={() => setCurrent(i)}
									className={cn(
										'h-1 rounded-full transition-all',
										i === current
											? 'w-6 bg-brand'
											: 'w-1.5 bg-white/40 hover:bg-white/60',
									)}
									aria-label={`Vai alla slide ${i + 1} di ${count}`}
									aria-current={
										i === current ? 'true' : undefined
									}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</section>
	)
}
