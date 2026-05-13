'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import moduleProps from '@/lib/moduleProps'
import CTAList from '@/ui/primitives/CTAList'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

function getInitials(name?: string) {
	if (!name) return '??'
	return name
		.split(' ')
		.map((w) => w[0])
		.join('')
		.toUpperCase()
		.slice(0, 2)
}

function Slide({
	slide,
	active,
}: {
	slide: Sanity.HeroSlide
	active: boolean
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
				<img
					src={slide.imageUrl}
					alt={slide.title}
					className="absolute inset-0 size-full object-cover"
					loading="eager"
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

	const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
		dragX.current = e.clientX
		dragDx.current = 0
		;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
		setPaused(true)
	}

	const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
		if (dragX.current === null) return
		dragDx.current = e.clientX - dragX.current
	}

	const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
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
	}

	const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === 'ArrowRight') {
			e.preventDefault()
			next()
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault()
			prev()
		}
	}

	if (!slides?.length) return null

	const s = slides[current]

	return (
		<section
			className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border outline-none focus-visible:ring-2 focus-visible:ring-brand sm:aspect-[16/12] md:aspect-[16/11]"
			aria-roledescription={isCarousel ? 'carousel' : undefined}
			aria-label={isCarousel ? 'Hero slides' : undefined}
			tabIndex={0}
			onKeyDown={onKeyDown}
			onPointerDown={isCarousel ? onPointerDown : undefined}
			onPointerMove={isCarousel ? onPointerMove : undefined}
			onPointerUp={isCarousel ? onPointerUp : undefined}
			onPointerCancel={isCarousel ? onPointerUp : undefined}
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			style={{ touchAction: 'pan-y', userSelect: 'none' }}
			{...moduleProps(props)}
		>
			<div aria-live="polite" aria-atomic="true" className="sr-only">
				{`Slide ${current + 1} di ${count}`}
			</div>

			{slides.map((slide, i) => (
				<Slide key={slide._key} slide={slide} active={i === current} />
			))}

			{/* Gradient overlays */}
			<div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/20" />
			<div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

			{/* Content */}
			<div className="relative flex h-full flex-col justify-between p-5 sm:p-7">
				{/* Top tag */}
				{s.cta?.link?.label && (
					<span className="self-start rounded-full bg-brand px-3 py-1 text-[10px] font-bold tracking-widest text-brand-foreground">
						{s.cta.link.label.toUpperCase()}
					</span>
				)}

				{/* Bottom content */}
				<div>
					<h2 className="text-2xl font-extrabold leading-tight text-white drop-shadow sm:text-3xl md:text-4xl">
						{s.title}
					</h2>

					{s.description && (
						<p className="mt-3 max-w-xl text-sm text-white/85">
							{s.description}
						</p>
					)}

					{/* Author info */}
					{s.author && (
						<div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/75">
							<div className="flex items-center gap-2">
								<span className="grid size-7 place-items-center rounded-full bg-brand text-[10px] font-bold text-brand-foreground">
									{getInitials(s.author.name)}
								</span>
								Di {s.author.name}
							</div>
						</div>
					)}

					{/* Actions + navigation */}
					<div className="mt-5 flex items-center justify-between gap-3">
						<CTAList
							ctas={[s.cta]}
							className="[&_a]:inline-flex [&_a]:items-center [&_a]:gap-2 [&_a]:rounded-full [&_a]:bg-brand [&_a]:px-4 [&_a]:py-2.5 [&_a]:text-sm [&_a]:font-semibold [&_a]:text-brand-foreground [&_a]:transition [&_a]:hover:opacity-90 sm:[&_a]:px-5"
						/>

						{isCarousel && (
							<div className="flex items-center gap-2">
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
							className="mt-4 flex items-center gap-1.5"
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
