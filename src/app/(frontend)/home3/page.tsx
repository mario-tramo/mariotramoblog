import type { Metadata } from 'next'
import HomeV3 from '@/ui/modules/HomeV3'

export const revalidate = 3600

export const metadata: Metadata = {
	title: 'Home Premium',
	robots: { index: false, follow: false },
}

export default function Page() {
	return <HomeV3 />
}
