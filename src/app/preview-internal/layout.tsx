import { draftMode, headers } from 'next/headers'
import { notFound } from 'next/navigation'
import PublicLayout from '@/app/(frontend)/layout'
import { runInPreview } from '@/sanity/lib/preview-context'
import dynamicImport from 'next/dynamic'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const VisualEditingControls = dynamicImport(() => import('@/ui/dev/VisualEditingControls'))

export default async function PreviewRootLayout({ children }: { children: React.ReactNode }) {
	const draft = await draftMode()
	if (!draft.isEnabled || (await headers()).get('x-freebuff-internal-route') !== 'preview') {
		notFound()
	}

	return runInPreview(() => (
		<>
			{PublicLayout({ children })}
			<VisualEditingControls />
		</>
	))
}
