export const dynamic = 'force-dynamic'
export const revalidate = 0

import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import PublicLayout from '@/app/(frontend)/layout'

export default async function FilteredLayout({ children }: { children: React.ReactNode }) {
	if ((await headers()).get('x-freebuff-internal-route') !== 'filters') notFound()
	return PublicLayout({ children })
}
