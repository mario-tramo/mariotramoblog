'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function ScrollToTop() {
	const pathname = usePathname()
	const isHome = pathname === '/'
	const restored = useRef(false)

	useEffect(() => {
		if (isHome) return

		if (!restored.current) {
			history.scrollRestoration = 'manual'
			restored.current = true
		}

		const raf = requestAnimationFrame(() => {
			window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
			document.querySelector<HTMLElement>('#main-content')?.focus()
		})

		return () => cancelAnimationFrame(raf)
	}, [pathname, isHome])

	return null
}
