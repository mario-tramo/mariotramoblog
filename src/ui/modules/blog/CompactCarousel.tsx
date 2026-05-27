'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCategoryColor } from '@/lib/categoryColors'
import Link from 'next/link'
import resolveUrl from '@/lib/resolveUrl'
import { Img } from '@/ui/primitives/Img'

function Slide({ post, active }: { post: Sanity.BlogPost; active: boolean }) {
	return (
		<Link
			href={resolveUrl(post, { base: false })}
			className={cn(
				'group relative block overflow-hidden rounded-xl transition-opacity duration-500',
				'aspect-[4/3] sm:aspect-[16/10]',
				active ? 'opacity-100' : 'opacity-0',
			)}
			tabIndex={active ? 0 : -1}
			aria-hidden={!active}
		>
			<Img
				className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
				image={post.metadata?.image}
				width={800}
				alt={post.title}
			/>

			<div className="pointer-events-none absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

			<div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4 sm:gap-2 sm:p-5">
				{post.categories?.[0] && (
					<span
						className="w-fit rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
						style={{ backgroundColor: getCategoryColor(post.categories[0]) }}
					>
						{post.categories[0].title}
					</span>
				)}
				<h3 className="line-clamp-2 text-sm font-bold leading-snug text-white sm:text-lg">
					{post.title}
				</h3>
			</div>
		</Link>
	)
}

export default function CompactCarousel({
	posts,
}: {
	posts: Sanity.BlogPost[]
}) {
	const count = posts.length
	if (count === 0) return null
	if (count === 1) return <Slide post={posts[0]} active />

	const [index, setIndex] = useState(0)
	const [paused, setPaused] = useState(false)
	const dragX = useRef<number | null>(null)
	const dragDx = useRef(0)

	const next = useCallback(
		() => setIndex((i) => (i + 1) % count),
		[count],
	)
	const prev = useCallback(
		() => setIndex((i) => (i - 1 + count) % count),
		[count],
	)

	useEffect(() => {
		if (paused) return
		const id = setInterval(next, 5000)
		return () => clearInterval(id)
	}, [next, paused])

	const onPointerDown = useCallback((e: React.PointerEvent) => {
		dragX.current = e.clientX
		dragDx.current = 0
		;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
		setPaused(true)
	}, [])

	const onPointerMove = useCallback((e: React.PointerEvent) => {
		if (dragX.current === null) return
		dragDx.current = e.clientX - dragX.current
	}, [])

	const onPointerUp = useCallback(
		(e: React.PointerEvent) => {
			if (dragX.current === null) return
			const dx = dragDx.current
			dragX.current = null
			dragDx.current = 0
			try {
				;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
			} catch {}
			setPaused(false)
			if (Math.abs(dx) > 50) (dx < 0 ? next : prev)()
		},
		[next, prev],
	)

	return (
		<div
			className="relative"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
		>
			<div
				className="relative touch-pan-y select-none overflow-hidden rounded-xl"
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				onPointerCancel={onPointerUp}
			>
				{posts.map((post, i) => (
					<div
						key={post._id}
						className={cn(
							'transition-opacity duration-500',
							i === 0 ? 'relative' : 'absolute inset-0',
							i === index ? 'z-10 opacity-100' : 'z-0 opacity-0',
						)}
					>
						<Slide post={post} active={i === index} />
					</div>
				))}
			</div>

			{/* Dots */}
			<div className="mt-3 flex items-center justify-center gap-1.5">
				{posts.map((_, i) => (
					<button
						key={i}
						onClick={() => setIndex(i)}
						className={cn(
							'size-1.5 rounded-full transition-all',
							i === index
								? 'w-4 bg-brand'
								: 'bg-ink/20 hover:bg-ink/40',
						)}
						aria-label={`Vai all'articolo ${i + 1}`}
					/>
				))}
			</div>

			{/* Arrows */}
			<button
				onClick={prev}
				className="absolute top-1/2 left-2 z-20 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
				aria-label="Precedente"
			>
				<ChevronLeft className="size-4" strokeWidth={2.5} />
			</button>
			<button
				onClick={next}
				className="absolute top-1/2 right-2 z-20 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
				aria-label="Successivo"
			>
				<ChevronRight className="size-4" strokeWidth={2.5} />
			</button>
		</div>
	)
}
