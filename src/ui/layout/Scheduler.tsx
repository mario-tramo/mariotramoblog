'use client'

import { useEffect, useState } from 'react'

export default function Scheduler({
	start,
	end,
	children,
}: Partial<{
	start: string
	end: string
	children: React.ReactNode
}>) {
	if (!start && !end) return children

	const [isActive, setIsActive] = useState(true)

	useEffect(() => {
		function checkActive() {
			const now = new Date()
			return (!start || new Date(start) < now) && (!end || new Date(end) > now)
		}
		setIsActive(checkActive())
		const interval = setInterval(() => setIsActive(checkActive()), 1000)
		return () => clearInterval(interval)
	}, [start, end])

	if (!isActive) return null

	return children
}
