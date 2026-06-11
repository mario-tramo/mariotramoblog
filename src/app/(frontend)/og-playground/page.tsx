import { fetchSanityLive } from '@/sanity/lib/fetch'
import { groq } from 'next-sanity'
import { BASE_URL } from '@/lib/env'
import OgPlayground, { type PlaygroundPost } from './OgPlayground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'OG Playground',
	robots: { index: false, follow: false },
}

export default async function Page() {
	const posts = await fetchSanityLive<PlaygroundPost[]>({
		query: groq`*[_type == 'blog.post' && metadata.noIndex != true]|order(publishDate desc)[0...24]{
			'id': _id,
			'title': coalesce(metadata.title, title),
			'description': coalesce(metadata.description, ''),
			'category': categories[0]->title,
			'date': publishDate,
			'imageUrl': metadata.image.asset->url,
			'path': coalesce(categories[0]->slug.current + '/', '') + metadata.slug.current,
		}`,
	})

	return <OgPlayground posts={posts ?? []} baseUrl={BASE_URL} />
}
