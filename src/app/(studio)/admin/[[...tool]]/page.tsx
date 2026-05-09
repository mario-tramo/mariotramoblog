export const maxDuration = 60 // sec

export { metadata, viewport } from 'next-sanity/studio'

import StudioClient from './StudioClient'

export default function StudioPage() {
	return <StudioClient />
}
