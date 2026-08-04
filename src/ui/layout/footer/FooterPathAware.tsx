'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export default function FooterPathAware({
	stayInTheGame,
	footer,
}: {
	stayInTheGame: ReactNode
	footer: ReactNode
}) {
	const pathname = usePathname()
	const hideStayInTheGame = pathname === '/contatti'

	return (
		<>
			{!hideStayInTheGame && stayInTheGame}
			{footer}
		</>
	)
}
