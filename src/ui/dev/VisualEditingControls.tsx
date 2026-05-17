import { draftMode } from 'next/headers'
import { SanityLive } from '@/sanity/lib/fetch'
import { VisualEditing } from 'next-sanity/visual-editing'
import DraftModeControls from './DraftModeControls'

export default async function VisualEditingControls() {
	return (
		<>
			<SanityLive />

			{(await draftMode()).isEnabled && (
				<>
					<VisualEditing />
					<DraftModeControls />
				</>
			)}
		</>
	)
}
