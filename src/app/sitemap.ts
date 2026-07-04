import { fetchSanityLive } from '@/sanity/lib/fetch'
import groq from 'groq'
import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_BASE_URL!.replace(/\/+$/, '') + '/'

interface SitemapEntry {
	url: string
	lastModified: string
	changefreq?: MetadataRoute.Sitemap[number]['changeFrequency']
	priority?: number
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const data = await fetchSanityLive<Record<string, SitemapEntry[]>>({
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
			'blog': *[_type == 'blog.post' && metadata.noIndex != true && defined(categories[0]->slug.current)]|order(publishDate desc){
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

	const enrich = (
		e: SitemapEntry,
		overrides?: Partial<MetadataRoute.Sitemap[number]>,
	): MetadataRoute.Sitemap[number] => ({
		url: e.url,
		lastModified: e.lastModified,
		...overrides,
	})

	const seen = new Set<string>()
	const result: MetadataRoute.Sitemap = []

	const add = (entries: SitemapEntry[], overrides?: Partial<MetadataRoute.Sitemap[number]>) => {
		for (const e of entries) {
			if (seen.has(e.url)) continue
			seen.add(e.url)
			result.push(enrich(e, overrides))
		}
	}

	add(
		[{ url: BASE, lastModified: new Date().toISOString() }],
		{ changeFrequency: 'daily', priority: 1 },
	)

	add(data.pages ?? [], { changeFrequency: 'monthly', priority: 0.5 })
	add(data.categories ?? [], { changeFrequency: 'weekly', priority: 0.6 })
	add(data.blog ?? [], { changeFrequency: 'weekly', priority: 0.8 })
	add(data.legal ?? [], { changeFrequency: 'monthly', priority: 0.3 })
	add(data.authors ?? [], { changeFrequency: 'weekly', priority: 0.4 })

	return result
}
