import { BASE_URL, BLOG_DIR } from './env'

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

export function blogPostingJsonLd(
	post: Sanity.BlogPost & { ogimage?: string },
) {
	const url = `${BASE_URL}/${BLOG_DIR}/${post.metadata.slug.current}`

	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: post.metadata.title,
		description: post.metadata.description,
		url,
		datePublished: post.publishDate,
		dateModified: post._updatedAt || post.publishDate,
		...(post.metadata.image && {
			image: post.ogimage || post.metadata.image,
		}),
		author: post.authors?.map((author) => ({
			'@type': 'Person',
			name: author.name,
		})),
		publisher: {
			'@type': 'Organization',
			name: 'Mario Tramo',
			url: BASE_URL,
		},
	}
}

export function breadcrumbJsonLd(
	items: { name: string; url: string }[],
) {
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
