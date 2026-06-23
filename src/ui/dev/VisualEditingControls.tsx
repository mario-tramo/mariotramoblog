import dynamic from 'next/dynamic'

const SanityLive = dynamic(() =>
	import('@/sanity/lib/fetch').then((mod) => ({ default: mod.SanityLive })),
)
const DraftModeControls = dynamic(() => import('./DraftModeControls'))

export default async function VisualEditingControls() {
	const { draftMode } = await import('next/headers')
	const isDraft = (await draftMode()).isEnabled

	return (
		<>
			{isDraft && <SanityLive />}

			{isDraft && (
				<>
					<DynamicVisualEditing />
					<DraftModeControls />
				</>
			)}
		</>
	)
}

const DynamicVisualEditing = dynamic(() =>
	import('next-sanity/visual-editing').then((mod) => ({ default: mod.VisualEditing })),
)
