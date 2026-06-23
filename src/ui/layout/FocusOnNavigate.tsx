'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function ScrollToTop() {
	const pathname = usePathname()

	useEffect(() => {
		history.scrollRestoration = 'manual'
	}, [])

	useEffect(() => {
		const id = setTimeout(() => {
			window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
			document.querySelector<HTMLElement>('#main-content')?.focus()
		}, 0)

		return () => clearTimeout(id)
	}, [pathname])

	return null
}
