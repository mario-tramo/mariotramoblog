import { fetchSanityLive } from '@/sanity/lib/fetch'
import groq from 'groq'
import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_BASE_URL!.replace(/\/+$/, '') + '/'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const data = await fetchSanityLive<Record<string, MetadataRoute.Sitemap>>({
		query: groq`{
			'pages': *[
				_type == 'page' &&
				!(metadata.slug.current in ['404']) &&
				metadata.noIndex != true
			]|order(metadata.slug.current){
				'url': (
					$base
					+ select(
						metadata.slug.current == 'index' => '',
						metadata.slug.current
					)
				),
				'lastModified': _updatedAt,
			},
			'categories': *[
				_type == 'blog.category' &&
				defined(slug.current) &&
				metadata.noIndex != true
			]|order(slug.current){
				'url': $base + slug.current,
				'lastModified': _updatedAt,
			},
			'blog': *[_type == 'blog.post' && metadata.noIndex != true]|order(publishDate desc){
				'url': (
					$base
					+ select(defined(categories[0]->slug.current) => categories[0]->slug.current + '/', '')
					+ metadata.slug.current
				),
				'lastModified': _updatedAt,
			},
			'legal': *[_type == 'legal' && metadata.noIndex != true]|order(metadata.slug.current){
				'url': (
					$base
					+ 'legal/'
					+ metadata.slug.current
				),
				'lastModified': _updatedAt,
			},
			'authors': *[_type == 'person' && defined(slug.current)]|order(name){
				'url': $base + 'autori/' + slug.current,
				'lastModified': _updatedAt,
			}
		}`,
		params: { base: BASE },
	})

	const urls = Object.values(data).flat()

	const seen = new Set<string>()
	return urls.filter((entry) => {
		if (seen.has(entry.url)) return false
		seen.add(entry.url)
		return true
	})
}
