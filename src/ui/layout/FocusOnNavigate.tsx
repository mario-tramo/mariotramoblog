'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function FocusOnNavigate() {
	const pathname = usePathname()
	const prevPath = useRef(pathname)

	useEffect(() => {
		if (pathname === prevPath.current) return
		prevPath.current = pathname

		const main = document.querySelector<HTMLElement>('#main-content')
		if (main) {
			main.focus()
		}
	}, [pathname])

	return null
}
