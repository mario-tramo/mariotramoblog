import { permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Blog | Trm Sport',
	robots: { index: false, follow: false },
}

export default function Page() {
	permanentRedirect('/')
}
