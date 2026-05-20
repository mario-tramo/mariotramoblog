'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import Link from 'next/link'

type Post = {
	_id: string
	title: string
	description: string | null
	slug: string
	publishDate: string
	imageUrl: string | null
	lqip: string | null
	author: { name: string } | null
	categories: { title: string }[]
}

function Slide({ post, active }: { post: Post; active: boolean }) {
	return (
		<Link
			href={post.slug}
			className={cn(
				'group relative block overflow-hidden rounded-2xl transition-opacity duration-500',
				'aspect-[3/4] sm:aspect-[2/1] lg:aspect-[21/9]',
				active ? 'opacity-100' : 'opacity-50',
			)}
			tabIndex={active ? 0 : -1}
			aria-hidden={!active}
		>
			{post.imageUrl ? (
				<img
					src={post.imageUrl + '?w=1200&auto=format'}
					alt={post.title}
					className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
					loading="lazy"
					{...(post.lqip && {
						style: {
							backgroundImage: `url(${post.lqip})`,
							backgroundSize: 'cover',
						},
					})}
				/>
			) : (
				<div className="absolute inset-0 bg-surface" />
			)}

			<div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

			<div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:gap-4 sm:p-10 lg:p-12">
				{post.categories?.[0] && (
					<span className="w-fit rounded bg-brand px-3.5 py-1.5 text-sm font-bold uppercase tracking-wide text-brand-foreground sm:text-base lg:text-lg">
						{post.categories[0].title}
					</span>
				)}

				<h3 className="line-clamp-2 text-2xl font-bold leading-tight text-white sm:text-4xl lg:text-[2.75rem]">
					{post.title}
				</h3>

				{post.description && (
					<p className="line-clamp-2 max-w-xl text-sm text-white/70 sm:text-base">
						{post.description}
					</p>
				)}

				{post.author && (
					<div className="flex items-center gap-3 text-base text-white/80 sm:text-lg">
						<span className="grid size-8 place-items-center rounded-full bg-white/20 text-sm font-bold text-white sm:size-9">
							{getInitials(post.author.name)}
						</span>
						{post.author.name}
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

	/*
	 * Circular buffer: clone last item before first and first item after last
	 * [clone-last, 0, 1, 2, ..., n-1, clone-first]
	 * Visual index 0 maps to buffer index 1
	 */
	const slides = useMemo(() => {
		if (!isCarousel) return posts
		return [posts[count - 1], ...posts, posts[0]]
	}, [posts, count, isCarousel])

	// bufferIndex: actual position in the extended array
	const [bufferIndex, setBufferIndex] = useState(isCarousel ? 1 : 0)
	const [animate, setAnimate] = useState(true)
	const [paused, setPaused] = useState(false)
	const dragX = useRef<number | null>(null)
	const dragDx = useRef(0)

	// Real index (0-based, for display purposes)
	const realIndex = isCarousel
		? ((bufferIndex - 1 + count) % count)
		: 0

	const next = useCallback(() => {
		setAnimate(true)
		setBufferIndex((prev) => prev + 1)
	}, [])

	const prev = useCallback(() => {
		setAnimate(true)
		setBufferIndex((prev) => prev - 1)
	}, [])

	// After transition on clone slides, snap to real position without animation
	const onTransitionEnd = useCallback(() => {
		if (!isCarousel) return
		if (bufferIndex === 0) {
			setAnimate(false)
			setBufferIndex(count) // jump to real last
		} else if (bufferIndex === count + 1) {
			setAnimate(false)
			setBufferIndex(1) // jump to real first
		}
	}, [bufferIndex, count, isCarousel])

	// Auto-advance
	useEffect(() => {
		if (!isCarousel || paused) return
		const interval = setInterval(next, 6000)
		return () => clearInterval(interval)
	}, [isCarousel, next, paused])

	// Drag / swipe
	const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
		if ((e.target as HTMLElement).closest('a, button')) return
		dragX.current = e.clientX
		dragDx.current = 0
		;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
		setPaused(true)
	}

	const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
		if (dragX.current === null) return
		dragDx.current = e.clientX - dragX.current
	}

	const onPointerUp = (e: React.PointerEvent<HTMLElement>) => {
		if (dragX.current === null) return
		const dx = dragDx.current
		dragX.current = null
		dragDx.current = 0
		try {
			;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
		} catch {}
		setPaused(false)
		if (Math.abs(dx) > 50) (dx < 0 ? next : prev)()
	}

	const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
		if (e.key === 'ArrowRight') {
			e.preventDefault()
			next()
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault()
			prev()
		}
	}

	return (
		<div
			className="relative"
			aria-roledescription={isCarousel ? 'carousel' : undefined}
			aria-label={isCarousel ? 'Articoli in evidenza' : undefined}
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
		>
			<div
				className="touch-pan-y select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-brand"
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
					className={cn(
						'flex',
						'gap-4 sm:gap-6',
						'[--card:100%] [--gap:1rem] [--peek:0px]',
						isCarousel && 'sm:[--card:78%] sm:[--gap:1.5rem] sm:[--peek:11%]',
						animate && 'transition-transform duration-500 ease-out',
					)}
					style={{
						transform: isCarousel
							? `translateX(calc(-${bufferIndex} * (var(--card) + var(--gap)) + var(--peek)))`
							: undefined,
					}}
					onTransitionEnd={onTransitionEnd}
				>
					{slides.map((post, i) => {
						const isActive = i === bufferIndex
						return (
							<div
								key={`${post._id}-${i}`}
								className="w-[var(--card)] shrink-0"
							>
								<Slide post={post} active={isActive} />
							</div>
						)
					})}
				</div>
			</div>

			{/* Navigation arrows — visible on all devices */}
			{isCarousel && (
				<>
					<button
						onClick={prev}
						className="absolute top-1/2 left-2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border-2 border-brand bg-white text-brand shadow-xl transition hover:bg-brand hover:text-white focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:left-[9%] sm:size-12"
						aria-label="Articolo precedente"
					>
						<ChevronLeft className="size-5 sm:size-6" strokeWidth={2.5} />
					</button>
					<button
						onClick={next}
						className="absolute top-1/2 right-2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border-2 border-brand bg-white text-brand shadow-xl transition hover:bg-brand hover:text-white focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:right-[9%] sm:size-12"
						aria-label="Articolo successivo"
					>
						<ChevronRight className="size-5 sm:size-6" strokeWidth={2.5} />
					</button>
				</>
			)}
		</div>
	)
}
