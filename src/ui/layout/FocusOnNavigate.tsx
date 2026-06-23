'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function ScrollToTop() {
	const pathname = usePathname()
	const isHome = pathname === '/'

	useEffect(() => {
		if (isHome) return

		history.scrollRestoration = 'manual'

		const id = setTimeout(() => {
			window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
			document.querySelector<HTMLElement>('#main-content')?.focus()
		}, 0)

		return () => clearTimeout(id)
	}, [pathname, isHome])

	return null
}
