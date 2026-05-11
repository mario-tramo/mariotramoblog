import { fetchSanityLive } from '@/sanity/lib/fetch'
import { groq } from 'next-sanity'
import { DEFAULT_LANG } from '@/lib/i18n'
import { BLOG_DIR } from '@/lib/env'
import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_BASE_URL + '/'

// Posts published within 30 days get higher priority
const RECENT_THRESHOLD = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

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
					+ select(defined(language) && language != $defaultLang => language + '/', '')
					+ select(
						metadata.slug.current == 'index' => '',
						metadata.slug.current
					)
				),
				'lastModified': _updatedAt,
				'priority': select(
					metadata.slug.current == 'index' => 1,
					metadata.slug.current == '${BLOG_DIR}' => 0.9,
					0.6
				),
				'changeFrequency': select(
					metadata.slug.current == 'index' => 'daily',
					metadata.slug.current == '${BLOG_DIR}' => 'daily',
					'weekly'
				),
			},
			'blog': *[_type == 'blog.post' && metadata.noIndex != true]|order(publishDate desc){
				'url': (
					$base
					+ select(defined(language) && language != $defaultLang => language + '/', '')
					+ '${BLOG_DIR}/'
					+ metadata.slug.current
				),
				'lastModified': _updatedAt,
				'priority': select(publishDate > $recentThreshold => 0.8, 0.5),
				'changeFrequency': select(publishDate > $recentThreshold => 'weekly', 'monthly'),
			},
			'legal': *[_type == 'legal' && metadata.noIndex != true]|order(metadata.slug.current){
				'url': (
					$base
					+ select(defined(language) && language != $defaultLang => language + '/', '')
					+ 'legal/'
					+ metadata.slug.current
				),
				'lastModified': _updatedAt,
				'priority': 0.2,
				'changeFrequency': 'yearly',
			}
		}`,
		params: {
			base: BASE,
			defaultLang: DEFAULT_LANG,
			recentThreshold: RECENT_THRESHOLD,
		},
	})

	return Object.values(data).flat()
}
