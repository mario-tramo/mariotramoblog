import resolveUrl from './resolveUrl'
import { BASE_URL, vercelPreview } from './env'
import { urlFor } from '@/sanity/lib/image'
import type { Metadata } from 'next'
import { DEFAULT_LANG } from './i18n'

const SITE_NAME = 'Trm Sport'

export default async function processMetadata(
	page: Sanity.PageBase & {
		title?: string
		translations?: { slug: string; language?: string }[]
		publishDate?: string
		_updatedAt?: string
		authors?: Sanity.Person[]
		categories?: Sanity.BlogCategory[]
		tags?: Sanity.BlogTag[]
	},
): Promise<Metadata> {
	const url = resolveUrl(page)
	const { description, noIndex, keywords, canonicalUrl } = page.metadata
	const title = page.metadata.title || page.title || ''
	const isBlogPost = page._type === 'blog.post'

	const tagNames = page.tags?.filter(Boolean).map((t) => t.title) || []
	const baseKeywords = keywords ?? page.categories?.filter(Boolean).map((c) => c.title) ?? []
	const seoKeywords = [...baseKeywords, ...tagNames]

	// Prefer the editorial featured image, cropped hotspot-aware to the 1.91:1
	// ratio that social platforms expect; otherwise fall back to the generated
	// branded OG card.
	const ogParams = new URLSearchParams({ title })
	if (isBlogPost && page.categories?.[0]) ogParams.set('category', page.categories[0].title)
	if (isBlogPost && page.publishDate) ogParams.set('date', page.publishDate)

	const featured = page.metadata.image
	const image = featured?.asset
		? urlFor(featured).width(1200).height(630).fit('crop').url()
		: `${BASE_URL}/api/og?${ogParams.toString()}`

	return {
		metadataBase: new URL(BASE_URL),
		title,
		description,
		keywords: seoKeywords,
		authors: page.authors?.map((a) => ({ name: a.name })),
		openGraph: {
			type: isBlogPost ? 'article' : 'website',
			url,
			title,
			description,
			images: [{ url: image, width: 1200, height: 630, alt: title }],
			siteName: SITE_NAME,
			locale: 'it_IT',
			...(isBlogPost && {
				publishedTime: page.publishDate,
				modifiedTime: page._updatedAt,
				authors: page.authors?.map((a) => a.name),
				section: page.categories?.[0]?.title,
				tags: seoKeywords,
			}),
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [image],
		},
		robots: noIndex || vercelPreview
			? { index: false, follow: false }
			: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
		alternates: {
			canonical: canonicalUrl || url,
			languages: Object.fromEntries(
				page.translations
					?.filter((t) => !!t?.language && !!t?.slug)
					?.map(({ language, slug }) => [
						language,
						[BASE_URL, language !== DEFAULT_LANG && language, slug]
							.filter(Boolean)
							.join('/'),
					]) || [],
			),
			types: {
				'application/rss+xml': '/blog/rss.xml',
			},
		},
	}
}
