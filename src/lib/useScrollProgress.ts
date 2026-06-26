'use client'

import { useState, useEffect } from 'react'

export function useScrollProgress() {
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		function update() {
			const scrollTop = globalThis.scrollY
			const docHeight = document.documentElement.scrollHeight - globalThis.innerHeight
			if (docHeight > 0) {
				setProgress(Math.min((scrollTop / docHeight) * 100, 100))
			}
		}

		update()
		globalThis.addEventListener('scroll', update, { passive: true })
		return () => globalThis.removeEventListener('scroll', update)
	}, [])

	return progress
}
