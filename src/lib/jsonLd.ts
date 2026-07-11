import { BASE_URL } from './env'
import { urlFor } from '@/sanity/lib/image'

/**
 * Google Discover / News recommend representative images at >=1200px wide,
 * ideally in 16:9, 4:3 and 1:1. We generate hotspot-aware crops from the
 * article's featured image so the subject stays framed in every ratio.
 */
function articleImages(post: Sanity.BlogPost): string[] {
	const img = post.metadata.image
	if (img?.asset) {
		return [
			urlFor(img).width(1200).height(675).fit('crop').url(), // 16:9
			urlFor(img).width(1200).height(900).fit('crop').url(), // 4:3
			urlFor(img).width(1200).height(1200).fit('crop').url(), // 1:1
		]
	}
	if (post.metadata.ogimage) return [post.metadata.ogimage]
	return [
		`${BASE_URL}/api/og?title=${encodeURIComponent(post.title || post.metadata.title)}`,
	]
}

function publisher(logoUrl?: string) {
	return {
		'@type': 'Organization',
		name: 'TRM Sport',
		url: BASE_URL,
		logo: {
			'@type': 'ImageObject',
			url: logoUrl || `${BASE_URL}/logo.png`,
			width: 512,
			height: 512,
		},
	}
}

function normalizeDate(date: string): string {
	if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
		return `${date}T12:00:00Z`
	}
	if (date.includes('T') && date.includes('Z')) return date
	if (date.includes('T') && !date.includes('Z')) return `${date}Z`
	return date
}

function newsMediaPublisher(logoUrl?: string) {
	return {
		'@type': 'NewsMediaOrganization',
		name: 'TRM Sport',
		url: BASE_URL,
		logo: {
			'@type': 'ImageObject',
			url: logoUrl || `${BASE_URL}/logo.png`,
			width: 512,
			height: 512,
		},
	}
}

export function websiteJsonLd(siteTitle: string, description?: string, logoUrl?: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: siteTitle,
		url: BASE_URL,
		inLanguage: 'it',
		...(description && { description }),
		publisher: publisher(logoUrl),
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: `${BASE_URL}/?q={search_term_string}`,
			},
			'query-input': 'required name=search_term_string',
		},
	}
}

export function newsArticleJsonLd(post: Sanity.BlogPost, logoUrl?: string) {
	const catSlug = post.categories?.[0]?.slug?.current
	const url = catSlug
		? `${BASE_URL}/${catSlug}/${post.metadata.slug.current}`
		: `${BASE_URL}/${post.metadata.slug.current}`
	const tagNames = post.tags?.filter(Boolean).map((t) => t.title) || []
	const categoryNames = post.categories?.filter(Boolean).map((c) => c.title) || []
	const keywords = post.metadata.keywords?.length
		? [...post.metadata.keywords, ...tagNames]
		: [...categoryNames, ...tagNames]

	return {
		'@context': 'https://schema.org',
		'@type': 'NewsArticle',
		headline: post.title || post.metadata.title,
		description: post.metadata.description,
		url,
		inLanguage: post.language || 'it',
		datePublished: normalizeDate(post.publishDate),
		dateModified: normalizeDate(post._updatedAt || post.publishDate),
		...(post.readTime && {
			wordCount: Math.round(post.readTime * 200),
		}),
		image: articleImages(post),
		author: post.authors?.map((author) => ({
			'@type': 'Person',
			name: author.name,
			url: author.slug?.current
				? `${BASE_URL}/autori/${author.slug.current}`
				: `${BASE_URL}/blog?author=${encodeURIComponent(author.name)}`,
		})),
		publisher: newsMediaPublisher(logoUrl),
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': url,
		},
		...(post.categories?.length && {
			articleSection: post.categories[0].title,
		}),
		...(keywords?.length && {
			keywords: keywords.join(', '),
		}),
	}
}

/** @deprecated Use newsArticleJsonLd instead */
export const blogPostingJsonLd = newsArticleJsonLd

export function collectionPageJsonLd(
	title: string,
	description?: string,
	url?: string,
	logoUrl?: string,
) {
	return {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: title,
		url: url || BASE_URL,
		inLanguage: 'it',
		...(description && { description }),
		isPartOf: {
			'@type': 'WebSite',
			name: 'TRM Sport',
			url: BASE_URL,
		},
		publisher: publisher(logoUrl),
	}
}

export function webPageJsonLd(page: {
	title: string
	description?: string
	url: string
	dateModified?: string
}, logoUrl?: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: page.title,
		url: page.url,
		inLanguage: 'it',
		...(page.description && { description: page.description }),
		...(page.dateModified && { dateModified: page.dateModified }),
		isPartOf: {
			'@type': 'WebSite',
			name: 'TRM Sport',
			url: BASE_URL,
		},
		publisher: publisher(logoUrl),
	}
}

export function faqPageJsonLd(items: { question: string; answer: string }[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: items.map((item) => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: item.answer,
			},
		})),
	}
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: item.name,
			item: item.url,
		})),
	}
}

export function personJsonLd(author: Sanity.Person) {
	const authorUrl = author.slug?.current
		? `${BASE_URL}/autori/${author.slug.current}`
		: `${BASE_URL}/blog?author=${encodeURIComponent(author.name)}`

	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: author.name,
		url: authorUrl,
		...(author.bio && { description: author.bio }),
		...(author.socialLink && { sameAs: [author.socialLink] }),
		worksFor: {
			'@type': 'Organization',
			name: 'TRM Sport',
			url: BASE_URL,
		},
	}
}

export function organizationJsonLd(socialLinks?: string[], logoUrl?: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'TRM Sport',
		url: BASE_URL,
		logo: {
			'@type': 'ImageObject',
			url: logoUrl || `${BASE_URL}/logo.png`,
			width: 512,
			height: 512,
		},
		...(socialLinks?.length && { sameAs: socialLinks }),
	}
}

export function newsMediaOrganizationJsonLd(socialLinks?: string[], logoUrl?: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'NewsMediaOrganization',
		name: 'TRM Sport',
		url: BASE_URL,
		logo: {
			'@type': 'ImageObject',
			url: logoUrl || `${BASE_URL}/logo.png`,
			width: 512,
			height: 512,
		},
		...(socialLinks?.length && { sameAs: socialLinks }),
	}
}
