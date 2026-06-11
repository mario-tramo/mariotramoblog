import { BASE_URL } from './env'

const PUBLISHER = {
	'@type': 'Organization',
	name: 'Trm Sport',
	url: BASE_URL,
	logo: {
		'@type': 'ImageObject',
		url: `${BASE_URL}/logo.png`,
		width: 512,
		height: 512,
	},
} as const

const NEWS_MEDIA_PUBLISHER = {
	'@type': 'NewsMediaOrganization',
	name: 'TRM Sport',
	url: BASE_URL,
	logo: {
		'@type': 'ImageObject',
		url: `${BASE_URL}/logo.png`,
		width: 512,
		height: 512,
	},
} as const

export function websiteJsonLd(siteTitle: string, description?: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: siteTitle,
		url: BASE_URL,
		inLanguage: 'it',
		...(description && { description }),
		publisher: PUBLISHER,
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: `${BASE_URL}/blog?q={search_term_string}`,
			},
			'query-input': 'required name=search_term_string',
		},
	}
}

export function newsArticleJsonLd(post: Sanity.BlogPost) {
	const catSlug = post.categories?.[0]?.slug?.current
	const url = catSlug
		? `${BASE_URL}/${catSlug}/${post.metadata.slug.current}`
		: `${BASE_URL}/${post.metadata.slug.current}`
	const image = post.metadata.ogimage || post.metadata.image
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
		datePublished: post.publishDate,
		dateModified: post._updatedAt || post.publishDate,
		...(post.readTime && {
			wordCount: Math.round(post.readTime * 200),
		}),
		...(image && {
			image: {
				'@type': 'ImageObject',
				url: typeof image === 'string' ? image : `${BASE_URL}/api/og?title=${encodeURIComponent(post.title || post.metadata.title)}`,
				width: 1200,
				height: 630,
			},
		}),
		author: post.authors?.map((author) => ({
			'@type': 'Person',
			name: author.name,
			url: author.slug?.current
				? `${BASE_URL}/autori/${author.slug.current}`
				: `${BASE_URL}/blog?author=${encodeURIComponent(author.name)}`,
		})),
		publisher: NEWS_MEDIA_PUBLISHER,
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
			name: 'Trm Sport',
			url: BASE_URL,
		},
		publisher: PUBLISHER,
	}
}

export function webPageJsonLd(page: {
	title: string
	description?: string
	url: string
	dateModified?: string
}) {
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
			name: 'Trm Sport',
			url: BASE_URL,
		},
		publisher: PUBLISHER,
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
			name: 'Trm Sport',
			url: BASE_URL,
		},
	}
}

export function organizationJsonLd(socialLinks?: string[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'TRM Sport',
		url: BASE_URL,
		logo: {
			'@type': 'ImageObject',
			url: `${BASE_URL}/logo.png`,
			width: 512,
			height: 512,
		},
		...(socialLinks?.length && { sameAs: socialLinks }),
	}
}

export function newsMediaOrganizationJsonLd(socialLinks?: string[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'NewsMediaOrganization',
		name: 'TRM Sport',
		url: BASE_URL,
		logo: {
			'@type': 'ImageObject',
			url: `${BASE_URL}/logo.png`,
			width: 512,
			height: 512,
		},
		...(socialLinks?.length && { sameAs: socialLinks }),
	}
}
