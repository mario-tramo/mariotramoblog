import dynamic from 'next/dynamic'

const Studio = dynamic(() => import('./Studio'), { ssr: false })

export const maxDuration = 60 // sec

export { metadata, viewport } from 'next-sanity/studio'

export default function StudioPage() {
	return <Studio />
}
