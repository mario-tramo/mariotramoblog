'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function NavigationLoadingBar() {
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const [loading, setLoading] = useState(false)
	const timer = useRef<ReturnType<typeof setTimeout>>(null)
	const mounted = useRef(false)

	useEffect(() => {
		if (!mounted.current) {
			mounted.current = true
			return
		}

		if (timer.current) clearTimeout(timer.current)

		setLoading(true)

		timer.current = setTimeout(() => {
			setLoading(false)
		}, 1200)

		return () => {
			if (timer.current) clearTimeout(timer.current)
		}
	}, [pathname, searchParams])

	return (
		<div
			className="pointer-events-none fixed left-0 right-0 z-50"
			style={{ top: 'var(--header-height)', height: 3 }}
		>
			<div
				className={`h-full bg-brand transition-all duration-500 ease-out ${loading ? 'opacity-100' : 'opacity-0'}`}
				style={{ width: loading ? '90%' : '0%' }}
				role="progressbar"
				aria-valuenow={loading ? 90 : 0}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-label="Caricamento pagina"
			/>
		</div>
	)
}
