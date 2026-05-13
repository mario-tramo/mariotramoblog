import resolveUrl from './resolveUrl'
import { BASE_URL, BLOG_DIR, vercelPreview } from './env'
import type { Metadata } from 'next'
import { DEFAULT_LANG } from './i18n'

const SITE_NAME = 'Mario Tramo'

export default async function processMetadata(
	page: Sanity.PageBase & {
		translations?: { slug: string; language?: string }[]
		publishDate?: string
		_updatedAt?: string
		authors?: Sanity.Person[]
		categories?: Sanity.BlogCategory[]
	},
): Promise<Metadata> {
	const url = resolveUrl(page)
	const { title, description, ogimage, noIndex } = page.metadata
	const seo = page.seo
	const isBlogPost = page._type === 'blog.post'

	// SEO advanced fields override base metadata when available
	const seoTitle = seo?.metaTitle || title
	const seoDescription = seo?.metaDescription || description
	const seoKeywords = seo?.seoKeywords ?? page.categories?.map((c) => c.title)
	const seoNoIndex = seo?.noIndex ?? noIndex

	const ogParams = new URLSearchParams({ title: seoTitle })
	if (isBlogPost && page.categories?.[0]) ogParams.set('category', page.categories[0].title)
	if (isBlogPost && page.publishDate) ogParams.set('date', page.publishDate)
	if (isBlogPost && !ogimage && page.metadata.image) {
		const imgUrl = (page.metadata.image as any)?.asset?.url
		if (imgUrl) ogParams.set('image', imgUrl + '?w=420&h=630&fit=crop')
	}
	const seoOgImage = seo?.ogImage
		? (seo.ogImage as any)?.asset?.url
		: undefined
	const image = seoOgImage || ogimage || `${BASE_URL}/api/og?${ogParams.toString()}`

	return {
		metadataBase: new URL(BASE_URL),
		title: seoTitle,
		description: seoDescription,
		keywords: seoKeywords,
		authors: page.authors?.map((a) => ({ name: a.name })),
		openGraph: {
			type: isBlogPost ? 'article' : 'website',
			url,
			title: seo?.ogTitle || seoTitle,
			description: seo?.ogDescription || seoDescription,
			images: [{ url: image, width: 1200, height: 630, alt: seoTitle }],
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
			card: seo?.twitterCardType || 'summary_large_image',
			title: seoTitle,
			description: seoDescription,
			images: [image],
			...(seo?.twitterSite && { site: seo.twitterSite }),
			...(seo?.twitterCreator && { creator: seo.twitterCreator }),
		},
		robots: seoNoIndex || vercelPreview
			? { index: false, follow: false }
			: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
		alternates: {
			canonical: seo?.canonicalUrl || url,
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
