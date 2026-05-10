'use client'

import { useState, useEffect, useCallback } from 'react'
import moduleProps from '@/lib/moduleProps'
import CTAList from '@/ui/CTAList'
import { cn } from '@/lib/utils'

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
			{/* Background image */}
			{slide.imageUrl && (
				<img
					src={slide.imageUrl}
					alt={slide.title}
					className="absolute inset-0 size-full object-cover"
					loading="eager"
				/>
			)}

			{/* Overlay */}
			<div className="absolute inset-0 bg-black/50" />

			{/* Content */}
			<div className="section relative z-10 flex h-full flex-col justify-end pb-12">
				<div className="max-w-2xl space-y-4">
					{slide.author && (
						<p className="text-sm font-medium text-white/70">
							{slide.author.name}
						</p>
					)}

					<h2 className="text-3xl font-bold text-white md:text-5xl">
						{slide.title}
					</h2>

					{slide.description && (
						<p className="max-w-lg text-base text-white/80">
							{slide.description}
						</p>
					)}

					<CTAList ctas={[slide.cta]} />
				</div>
			</div>
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
	const count = slides?.length ?? 0
	const isCarousel = count > 1

	const next = useCallback(() => {
		setCurrent((prev) => (prev + 1) % count)
	}, [count])

	const prev = useCallback(() => {
		setCurrent((prev) => (prev - 1 + count) % count)
	}, [count])

	useEffect(() => {
		if (!isCarousel) return
		const interval = setInterval(next, 6000)
		return () => clearInterval(interval)
	}, [isCarousel, next])

	if (!slides?.length) return null

	return (
		<section
			className="relative min-h-[70vh] overflow-hidden bg-black"
			aria-roledescription={isCarousel ? 'carousel' : undefined}
			aria-label={isCarousel ? 'Hero slides' : undefined}
			{...moduleProps(props)}
		>
			<div aria-live="polite" aria-atomic="true" className="sr-only">
				{`Slide ${current + 1} di ${count}`}
			</div>

			{slides.map((slide, i) => (
				<Slide key={slide._key} slide={slide} active={i === current} />
			))}

			{/* Navigation dots */}
			{isCarousel && (
				<div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2" role="group" aria-label="Seleziona slide">
					{slides.map((slide, i) => (
						<button
							key={slide._key}
							onClick={() => setCurrent(i)}
							className={cn(
								'size-2.5 rounded-full transition-all',
								i === current
									? 'bg-white scale-110'
									: 'bg-white/40 hover:bg-white/60',
							)}
							aria-label={`Vai alla slide ${i + 1} di ${count}`}
							aria-current={i === current ? 'true' : undefined}
						/>
					))}
				</div>
			)}

			{/* Prev / Next arrows */}
			{isCarousel && (
				<>
					<button
						onClick={prev}
						className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/50 hover:text-white"
						aria-label="Slide precedente"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="size-5"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
								clipRule="evenodd"
							/>
						</svg>
					</button>
					<button
						onClick={next}
						className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/50 hover:text-white"
						aria-label="Slide successiva"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="size-5"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
								clipRule="evenodd"
							/>
						</svg>
					</button>
				</>
			)}
		</section>
	)
}
