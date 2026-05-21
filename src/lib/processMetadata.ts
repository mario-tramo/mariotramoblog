import resolveUrl from './resolveUrl'
import { BASE_URL, BLOG_DIR, vercelPreview } from './env'
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
	const { description, ogimage, noIndex, keywords, canonicalUrl } = page.metadata
	const title = page.metadata.title || page.title || ''
	const isBlogPost = page._type === 'blog.post'

	const tagNames = page.tags?.filter(Boolean).map((t) => t.title) || []
	const baseKeywords = keywords ?? page.categories?.filter(Boolean).map((c) => c.title) ?? []
	const seoKeywords = [...baseKeywords, ...tagNames]

	const ogParams = new URLSearchParams({ title })
	if (isBlogPost && page.categories?.[0]) ogParams.set('category', page.categories[0].title)
	if (isBlogPost && page.publishDate) ogParams.set('date', page.publishDate)
	if (isBlogPost && !ogimage && page.metadata.image) {
		const imgUrl = (page.metadata.image as Sanity.Image & { asset?: { url?: string } })?.asset?.url
		if (imgUrl) ogParams.set('image', imgUrl + '?w=420&h=630&fit=crop')
	}
	const image = ogimage || `${BASE_URL}/api/og?${ogParams.toString()}`

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
				'application/rss+xml': `/${BLOG_DIR}/rss.xml`,
			},
		},
	}
}
