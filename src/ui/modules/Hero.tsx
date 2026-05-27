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
			className="group relative aspect-[4/3] max-h-[500px] touch-pan-y select-none overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand sm:aspect-[2/1] md:aspect-[5/2]"
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

			{/* Gradient overlays */}
			<div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/20" />
			<div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

			{/* Full-slide clickable overlay */}
			{slideHref && (
				<Link href={slideHref} className="absolute inset-0 z-[1]" aria-label={s.title}>
					<span className="sr-only">{s.title}</span>
				</Link>
			)}

			{/* Content */}
			<div className="relative z-[2] flex h-full flex-col justify-end p-6 pointer-events-none sm:p-8">
				{/* Bottom content */}
				<div>
					<h2 className="font-heading text-3xl uppercase leading-none text-white drop-shadow sm:text-4xl md:text-5xl">
						{s.title}
					</h2>

					{s.description && (
						<p className="mt-4 max-w-xl text-sm text-white/85">
							{s.description}
						</p>
					)}

					{/* Author info */}
					{s.author && (
						<div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/75">
							<div className="flex items-center gap-2">
								<span className="grid size-7 place-items-center rounded-full bg-brand text-[10px] font-bold text-brand-foreground">
									{getInitials(s.author.name)}
								</span>
								Di {s.author.name}
							</div>
						</div>
					)}

					{/* Actions + navigation */}
					<div className="mt-6 flex items-center justify-between gap-3">
						<CTAList
							ctas={[s.cta]}
							className="pointer-events-auto [&_a]:inline-flex [&_a]:items-center [&_a]:gap-2 [&_a]:rounded-full [&_a]:border [&_a]:border-brand [&_a]:px-5 [&_a]:py-2.5 [&_a]:text-sm [&_a]:font-semibold [&_a]:text-brand [&_a]:transition [&_a]:hover:bg-brand [&_a]:hover:text-brand-foreground sm:[&_a]:px-6"
						/>

						{isCarousel && (
							<div className="pointer-events-auto flex items-center gap-2">
								<button
									onClick={prev}
									className="grid size-9 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
									aria-label="Slide precedente"
								>
									<ChevronLeft className="size-4" />
								</button>
								<button
									onClick={next}
									className="grid size-9 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
									aria-label="Slide successiva"
								>
									<ChevronRight className="size-4" />
								</button>
							</div>
						)}
					</div>

					{/* Dots */}
					{isCarousel && (
						<div
							className="pointer-events-auto mt-5 flex items-center gap-1.5"
							role="group"
							aria-label="Seleziona slide"
						>
							{slides.map((slide, i) => (
								<button
									key={slide._key}
									onClick={() => setCurrent(i)}
									className={cn(
										'h-1.5 rounded-full transition-all',
										i === current
											? 'w-8 bg-brand'
											: 'w-1.5 bg-white/40 hover:bg-white/70',
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
