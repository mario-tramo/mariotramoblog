'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ScrollCarousel({
	children,
	className,
}: {
	children: React.ReactNode
	className?: string
}) {
	const wrapperRef = useRef<HTMLDivElement>(null)
	const [canScrollLeft, setCanScrollLeft] = useState(false)
	const [canScrollRight, setCanScrollRight] = useState(false)
	const [totalPages, setTotalPages] = useState(0)
	const [currentPage, setCurrentPage] = useState(0)

	const getScrollEl = useCallback(() => {
		// The scrollable element is the first child with overflow
		const wrapper = wrapperRef.current
		if (!wrapper) return null
		const el = wrapper.querySelector('[data-carousel]') as HTMLElement | null
		return el ?? (wrapper.firstElementChild as HTMLElement | null)
	}, [])

	const updateState = useCallback(() => {
		const el = getScrollEl()
		if (!el) return

		const { scrollLeft, scrollWidth, clientWidth } = el
		const maxScroll = scrollWidth - clientWidth

		setCanScrollLeft(scrollLeft > 2)
		setCanScrollRight(scrollLeft < maxScroll - 2)

		// Calculate pages based on visible items
		const items = Array.from(el.children) as HTMLElement[]
		if (items.length > 0) {
			const firstItem = items[0]
		const rawGap = parseFloat(getComputedStyle(el).columnGap)
		const gap = isNaN(rawGap) ? 32 : rawGap
			const itemWidth = firstItem.offsetWidth + gap
			const visibleItems = Math.max(1, Math.round(clientWidth / itemWidth))
			const pages = Math.ceil(items.length / visibleItems)
			setTotalPages(pages)

			const currentIdx = Math.round(scrollLeft / itemWidth)
			setCurrentPage(Math.min(Math.floor(currentIdx / visibleItems), pages - 1))
		}
	}, [getScrollEl])

	useEffect(() => {
		const el = getScrollEl()
		if (!el) return

		updateState()

		el.addEventListener('scroll', updateState, { passive: true })
		const ro = new ResizeObserver(updateState)
		ro.observe(el)

		return () => {
			el.removeEventListener('scroll', updateState)
			ro.disconnect()
		}
	}, [getScrollEl, updateState])

	const scroll = useCallback((direction: 'left' | 'right') => {
		const el = getScrollEl()
		if (!el) return
		const amount = el.clientWidth * 0.8
		el.scrollBy({
			left: direction === 'left' ? -amount : amount,
			behavior: 'smooth',
		})
	}, [getScrollEl])

	const scrollToPage = useCallback((page: number) => {
		const el = getScrollEl()
		if (!el) return
		const items = Array.from(el.children) as HTMLElement[]
		if (items.length === 0) return
		const rawGap = parseFloat(getComputedStyle(el).columnGap)
		const gap = isNaN(rawGap) ? 32 : rawGap
		const itemWidth = items[0].offsetWidth + gap
		const visibleItems = Math.max(1, Math.round(el.clientWidth / itemWidth))
		const targetIdx = Math.min(page * visibleItems, items.length - 1)
		if (items[targetIdx]) {
			items[targetIdx].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
		}
	}, [getScrollEl])

	const showArrows = canScrollLeft || canScrollRight

	return (
		<div ref={wrapperRef} className={cn('group/carousel relative', className)}>
			{children}

			{/* Desktop arrows */}
			{showArrows && (
				<>
					<button
						type="button"
						onClick={() => scroll('left')}
						className={cn(
							'absolute top-1/2 left-1 z-10 hidden -translate-y-1/2 place-items-center rounded-full border border-line bg-surface text-ink shadow-lg transition hover:bg-brand-deep hover:text-white sm:grid',
							'size-10',
							canScrollLeft ? 'opacity-100' : 'pointer-events-none opacity-0',
						)}
						aria-label="Scorri a sinistra"
					>
						<ChevronLeft className="size-5" strokeWidth={2} />
					</button>
					<button
						type="button"
						onClick={() => scroll('right')}
						className={cn(
							'absolute top-1/2 right-1 z-10 hidden -translate-y-1/2 place-items-center rounded-full border border-line bg-surface text-ink shadow-lg transition hover:bg-brand-deep hover:text-white sm:grid',
							'size-10',
							canScrollRight ? 'opacity-100' : 'pointer-events-none opacity-0',
						)}
						aria-label="Scorri a destra"
					>
						<ChevronRight className="size-5" strokeWidth={2} />
					</button>
				</>
			)}

			{/* Dot indicators */}
			{totalPages > 1 && (
				<div className="mt-4 flex items-center justify-center gap-1.5">
					{Array.from({ length: totalPages }).map((_, i) => (
						<button
							type="button"
							key={i}
							onClick={() => scrollToPage(i)}
							className={cn(
								'h-1.5 rounded-full transition-all',
								i === currentPage
									? 'w-6 bg-brand'
									: 'w-1.5 bg-ink/20 hover:bg-ink/40',
							)}
							aria-label={`Vai a pagina ${i + 1}`}
							aria-current={i === currentPage ? 'true' : undefined}
						/>
					))}
				</div>
			)}
		</div>
	)
}
