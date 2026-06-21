'use client'

import { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

type Post = {
	_id: string
	title: string
	description: string | null
	slug: string
	publishDate: string
	imageUrl: string | null
	lqip: string | null
	hotspot: { x: number; y: number } | null
	authors: { name: string }[] | null
	categories: { title: string }[]
}

const PEK_SM = 0.175
const PEK_LG = 0.225
const CARD_SM = 0.65
const CARD_LG = 0.55
const GAP = 24

function getPek(w: number) {
	return w >= 1024 ? w * PEK_LG : w >= 640 ? w * PEK_SM : 0
}

function getCardW(w: number) {
	return w >= 1024 ? w * CARD_LG : w >= 640 ? w * CARD_SM : w
}

function getGap(w: number) {
	return w >= 640 ? GAP : 16
}

function Slide({ post, active, eager }: { post: Post; active: boolean; eager: boolean }) {
	return (
		<Link
			href={post.slug || '/'}
			className={cn(
				'group relative block overflow-hidden rounded-2xl transition-opacity duration-500',
				'h-[45vh] min-h-[280px] max-h-[420px]',
				'sm:h-auto sm:aspect-video sm:max-h-none sm:min-h-0',
				active ? 'opacity-100' : 'opacity-40',
			)}
			tabIndex={active ? 0 : -1}
			aria-hidden={!active}
		>
			{post.imageUrl ? (
				<Image
					src={post.imageUrl}
					alt={post.title}
					fill
				sizes="(min-width: 1024px) 55vw, (min-width: 640px) 65vw, 100vw"
					className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
				loading={eager ? 'eager' : undefined}
				fetchPriority={eager && active ? 'high' : undefined}
					{...(post.lqip && { placeholder: 'blur', blurDataURL: post.lqip })}
					style={
						post.hotspot
							? { objectPosition: `${post.hotspot.x * 100}% ${post.hotspot.y * 100}%` }
							: undefined
					}
				/>
			) : (
				<div className="absolute inset-0 bg-surface" />
			)}

			<div className="pointer-events-none absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black/90 via-black/70 via-60% to-transparent sm:h-[60%] lg:h-[70%]" />

			<div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 sm:gap-3 sm:p-8 lg:gap-4 lg:p-12">
				{post.categories?.[0] && (
					<span className="w-fit rounded bg-brand px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-brand-foreground sm:px-3 sm:py-1.5 sm:text-sm lg:text-base">
						{post.categories[0].title}
					</span>
				)}

				<h3 className="line-clamp-2 text-xl font-bold leading-tight text-white sm:text-3xl lg:text-[2.75rem]">
					{post.title}
				</h3>

				{post.description && (
					<p className="line-clamp-1 max-w-xl text-xs text-white/70 sm:line-clamp-2 sm:text-sm lg:text-base">
						{post.description}
					</p>
				)}

				{post.authors?.[0] && (
					<div className="flex items-center gap-2 text-sm text-white/80 sm:gap-3 sm:text-base lg:text-lg">
						<span className="grid size-7 place-items-center rounded-full bg-white/20 text-xs font-bold text-white sm:size-8 sm:text-sm lg:size-9">
							{getInitials(post.authors[0].name)}
						</span>
						{post.authors[0].name}
					</div>
				)}
			</div>
		</Link>
	)
}

export default function Carousel({ posts }: { posts: Post[] }) {
	const count = posts.length
	if (count === 0) return null

	const isCarousel = count > 1

	const slides = useMemo(() => {
		if (!isCarousel) return posts
		return [posts[count - 1], ...posts, posts[0]]
	}, [posts, count, isCarousel])

	const [bufferIndex, setBufferIndex] = useState(isCarousel ? 1 : 0)
	const [paused, setPaused] = useState(false)
	const [snapping, setSnapping] = useState(false)

	const trackRef = useRef<HTMLDivElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const [px, setPx] = useState({ card: 650, gap: 24, peek: 175 })

	const measure = useCallback(() => {
		if (!containerRef.current || !trackRef.current) return
		const w = containerRef.current.offsetWidth
		const card = getCardW(w)
		const gap = getGap(w)
		const peek = getPek(w)
		setPx({ card, gap, peek })
	}, [])

	useLayoutEffect(() => {
		measure()
	}, [measure])

	useEffect(() => {
		window.addEventListener('resize', measure)
		return () => window.removeEventListener('resize', measure)
	}, [measure])

	const realIndex = isCarousel
		? ((bufferIndex - 1 + count) % count)
		: 0

	const step = px.card + px.gap

	const next = useCallback(() => {
		setBufferIndex((prev) => prev + 1)
	}, [])

	const prev = useCallback(() => {
		setBufferIndex((prev) => prev - 1)
	}, [])

	const onTransitionEnd = useCallback((e: React.TransitionEvent<HTMLDivElement>) => {
		if (e.target !== e.currentTarget || e.propertyName !== 'transform') return
		if (!isCarousel) return
		if (bufferIndex === 0) {
			setSnapping(true)
			requestAnimationFrame(() => {
				setBufferIndex(count)
				requestAnimationFrame(() => setSnapping(false))
			})
		} else if (bufferIndex === count + 1) {
			setSnapping(true)
			requestAnimationFrame(() => {
				setBufferIndex(1)
				requestAnimationFrame(() => setSnapping(false))
			})
		}
	}, [isCarousel, bufferIndex, count])

	const translateX = isCarousel && step > 0
		? -bufferIndex * step + px.peek
		: 0

	useEffect(() => {
		if (!isCarousel || paused) return
		const interval = setInterval(next, 6000)
		return () => clearInterval(interval)
	}, [isCarousel, next, paused])

	const dragX = useRef<number | null>(null)
	const dragDx = useRef(0)

	const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
		if ((e.target as HTMLElement).closest('a, button')) return
		dragX.current = e.clientX
		dragDx.current = 0
		;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
		setPaused(true)
	}, [])

	const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
		if (dragX.current === null) return
		dragDx.current = e.clientX - dragX.current
	}, [])

	const onPointerUp = useCallback((e: React.PointerEvent<HTMLElement>) => {
		if (dragX.current === null) return
		const dx = dragDx.current
		dragX.current = null
		dragDx.current = 0
		try {
			(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
		} catch { }
		setPaused(false)
		if (Math.abs(dx) > 50) (dx < 0 ? next : prev)()
	}, [next, prev])

	const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
		if (e.key === 'ArrowRight') {
			e.preventDefault()
			next()
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault()
			prev()
		}
	}, [next, prev])

	return (
		<div
			ref={containerRef}
			className="relative overflow-hidden [--peek:0px] sm:[--peek:17.5%] lg:[--peek:22.5%]"
			aria-roledescription={isCarousel ? 'carousel' : undefined}
			aria-label={isCarousel ? 'Articoli in evidenza' : undefined}
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
		>
			<div
				className="touch-pan-y select-none outline-none focus-visible:ring-2 focus-visible:ring-brand"
				tabIndex={0}
				onKeyDown={onKeyDown}
				onPointerDown={isCarousel ? onPointerDown : undefined}
				onPointerMove={isCarousel ? onPointerMove : undefined}
				onPointerUp={isCarousel ? onPointerUp : undefined}
				onPointerCancel={isCarousel ? onPointerUp : undefined}
			>
				<div aria-live="polite" aria-atomic="true" className="sr-only">
					{`Articolo ${realIndex + 1} di ${count}`}
				</div>

				<div
					ref={trackRef}
					onTransitionEnd={onTransitionEnd}
					className={cn(
						'flex will-change-transform',
						'gap-4 sm:gap-6',
						'[--card:100%]',
						isCarousel && 'sm:[--card:65%] lg:[--card:55%]',
						isCarousel && !snapping && step > 0 && 'transition-transform duration-500 ease-out',
					)}
					style={{
						transform: isCarousel && step > 0 ? `translateX(${translateX}px)` : undefined,
					}}
				>
					{slides.map((post, i) => {
						const isActive = i === bufferIndex
						return (
							<div
								key={`${post._id}-${i}`}
								className="w-[var(--card)] shrink-0"
							>
								<Slide post={post} active={isActive} eager={!isCarousel || i === 1 || i === 0 || i === slides.length - 1} />
							</div>
						)
					})}
				</div>
			</div>

			{isCarousel && (
				<>
					<button
						onClick={prev}
						className="absolute top-1/2 left-2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border-2 border-brand bg-white text-brand shadow-xl transition hover:bg-brand hover:text-white focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:left-[calc(var(--peek)-1.5rem)] sm:size-12"
						aria-label="Articolo precedente"
					>
						<ChevronLeft className="size-5 sm:size-6" strokeWidth={2.5} />
					</button>
					<button
						onClick={next}
						className="absolute top-1/2 right-2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border-2 border-brand bg-white text-brand shadow-xl transition hover:bg-brand hover:text-white focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:right-[calc(var(--peek)-1.5rem)] sm:size-12"
						aria-label="Articolo successivo"
					>
						<ChevronRight className="size-5 sm:size-6" strokeWidth={2.5} />
					</button>
				</>
			)}
		</div>
	)
}
