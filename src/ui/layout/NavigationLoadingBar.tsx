'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function NavigationLoadingBar() {
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const [loading, setLoading] = useState(false)
	const timer = useRef<ReturnType<typeof setTimeout>>(null)
	const raf = useRef<number>(null)
	const startTime = useRef(0)

	const MIN_DURATION = 800
	const MAX_DURATION = 3000

	useEffect(() => {
		if (timer.current) clearTimeout(timer.current)
		if (raf.current) cancelAnimationFrame(raf.current)

		setLoading(true)
		startTime.current = Date.now()

		const show = () => {
			if (timer.current) clearTimeout(timer.current)
			const elapsed = Date.now() - startTime.current
			const remaining = Math.max(0, MIN_DURATION - elapsed)
			timer.current = setTimeout(() => {
				setLoading(false)
			}, remaining + Math.random() * (MAX_DURATION - MIN_DURATION))
		}

		raf.current = requestAnimationFrame(show)

		return () => {
			if (timer.current) clearTimeout(timer.current)
			if (raf.current) cancelAnimationFrame(raf.current)
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
