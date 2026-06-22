import type { Metadata } from 'next'
import TestCardsPage from './TestCardsPage'

export const metadata: Metadata = {
	title: 'Test Cards | Trm Sport',
	robots: { index: false, follow: false },
}

export default function Page() {
	return <TestCardsPage />
}
