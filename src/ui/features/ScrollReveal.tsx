'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const SECTION_SELECTOR = '.section, [data-module]'
const ITEM_SELECTOR = '.section :is(article, [class*="grid"] > *)'

export default function ScrollReveal() {
	const pathname = usePathname()
	const observerRef = useRef<IntersectionObserver | null>(null)

	useEffect(() => {
		observerRef.current = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.setAttribute('data-visible', 'true')
						observerRef.current?.unobserve(entry.target)
					}
				}
			},
			{ rootMargin: '-64px 0px -64px 0px' },
		)

		const sections = document.querySelectorAll(SECTION_SELECTOR)
		for (const el of sections) {
			observerRef.current.observe(el)
		}

		const items = document.querySelectorAll(ITEM_SELECTOR)
		for (const el of items) {
			observerRef.current.observe(el)
		}

		return () => observerRef.current?.disconnect()
	}, [pathname])

	return null
}
