import { BASE_URL, BLOG_DIR } from './env'

const PUBLISHER = {
	'@type': 'Organization',
	name: 'Mario Tramo',
	url: BASE_URL,
	logo: {
		'@type': 'ImageObject',
		url: `${BASE_URL}/favicon.ico`,
	},
} as const

export function websiteJsonLd(siteTitle: string, description?: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: siteTitle,
		url: BASE_URL,
		...(description && { description }),
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

export function webPageJsonLd(page: Sanity.PageBase) {
	const url = `${BASE_URL}/${page.metadata.slug.current === 'index' ? '' : page.metadata.slug.current}`
	return {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: page.metadata.title,
		description: page.metadata.description,
		url,
		publisher: PUBLISHER,
	}
}

export function blogPostingJsonLd(post: Sanity.BlogPost) {
	const url = `${BASE_URL}/${BLOG_DIR}/${post.metadata.slug.current}`
	const image = post.metadata.ogimage || post.metadata.image

	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: post.metadata.title,
		description: post.metadata.description,
		url,
		datePublished: post.publishDate,
		dateModified: post._updatedAt || post.publishDate,
		...(image && {
			image: {
				'@type': 'ImageObject',
				url: typeof image === 'string' ? image : `${BASE_URL}/api/og?title=${encodeURIComponent(post.metadata.title)}`,
				width: 1200,
				height: 630,
			},
		}),
		author: post.authors?.map((author) => ({
			'@type': 'Person',
			name: author.name,
			url: `${BASE_URL}/blog?author=${author._id}`,
		})),
		publisher: PUBLISHER,
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': url,
		},
		...(post.categories?.length && {
			articleSection: post.categories[0].title,
			keywords: post.categories.map((c) => c.title).join(', '),
		}),
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

export function personJsonLd(author: Sanity.Person & { slug?: { current: string } }) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: author.name,
		url: `${BASE_URL}/blog?author=${author._id}`,
	}
}
