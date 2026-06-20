import { cookies } from 'next/headers'
import { DEFAULT_LANG, langCookieName } from '@/lib/i18n'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import { groq } from 'next-sanity'
import { IMAGE_QUERY } from '@/sanity/lib/queries'
import {
	type CollectionFilter,
	resolveCollectionFilters,
	buildGroqFilterConditions,
	buildGroqFilterParams,
} from '@/lib/resolveCollectionFilters'
import { getTopSlugs } from '@/lib/views'

export type PostsFeedSource = 'latest' | 'trending' | 'manual'

export type PostsFeedConfig = {
	source: PostsFeedSource
	limit?: number
	manualPosts?: { _ref: string }[]
	filters?: CollectionFilter[]
	searchParams?: Record<string, string | string[] | undefined>
}

const POST_PROJECTION = groq`{
	...,
	'title': coalesce(title, metadata.title),
	featured,
	categories[]->,
	authors[]->,
	publishDate,
	language,
	'readTime': round(length(pt::text(body)) / 5 / 180),
	metadata {
		...,
		image { ${IMAGE_QUERY} }
	},
}`

export async function getPostsFeed(
	config: PostsFeedConfig,
): Promise<Sanity.BlogPost[]> {
	const { source, limit = 6, manualPosts, filters, searchParams } = config

	switch (source) {
		case 'manual':
			return getManualPosts(manualPosts)
		case 'trending':
			return getTrendingPosts(limit, filters, searchParams)
		case 'latest':
		default:
			return getLatestPosts(limit, filters, searchParams)
	}
}

async function getLang() {
	const lang = (await cookies()).get(langCookieName)?.value ?? DEFAULT_LANG
	return lang
}

function langCondition(lang: string) {
	return lang ? `&& (!defined(language) || language == '${lang}')` : ''
}

async function getLatestPosts(
	limit: number,
	filters?: CollectionFilter[],
	searchParams?: Record<string, string | string[] | undefined>,
): Promise<Sanity.BlogPost[]> {
	const lang = await getLang()
	const resolvedFilters = resolveCollectionFilters(filters, { searchParams })
	const filterConditions = buildGroqFilterConditions(resolvedFilters)
	const filterParams = buildGroqFilterParams(resolvedFilters)

	return fetchSanityLive<Sanity.BlogPost[]>({
		query: groq`
			*[
				_type == 'blog.post'
				&& metadata.noIndex != true
				${langCondition(lang)}
				${filterConditions}
			]|order(publishDate desc)[0...${limit}]${POST_PROJECTION}
		`,
		params: filterParams,
	})
}

async function getTrendingPosts(
	limit: number,
	filters?: CollectionFilter[],
	searchParams?: Record<string, string | string[] | undefined>,
): Promise<Sanity.BlogPost[]> {
	const topSlugs = await getTopSlugs(limit)

	// Fallback to latest posts if no view data available
	if (!topSlugs.length) {
		return getLatestPosts(limit, filters, searchParams)
	}

	const lang = await getLang()
	const resolvedFilters = resolveCollectionFilters(filters, { searchParams })
	const filterConditions = buildGroqFilterConditions(resolvedFilters)
	const filterParams = buildGroqFilterParams(resolvedFilters)

	const posts = await fetchSanityLive<Sanity.BlogPost[]>({
		query: groq`
			*[
				_type == 'blog.post'
				&& metadata.slug.current in $topSlugs
				&& metadata.noIndex != true
				${langCondition(lang)}
				${filterConditions}
			]${POST_PROJECTION}
		`,
		params: { ...filterParams, topSlugs },
	})

	// Preserve view-count order from Redis
	return topSlugs
		.map((slug) => posts.find((p) => p.metadata?.slug?.current === slug))
		.filter(Boolean) as Sanity.BlogPost[]
}

async function getManualPosts(
	manualPosts?: { _ref: string }[],
): Promise<Sanity.BlogPost[]> {
	if (!manualPosts?.length) return []

	const ids = manualPosts.map((p) => p._ref)

	const posts = await fetchSanityLive<Sanity.BlogPost[]>({
		query: groq`
			*[_type == 'blog.post' && _id in $ids && metadata.noIndex != true]${POST_PROJECTION}
		`,
		params: { ids },
	})

	// Preserve manual order
	return ids
		.map((id) => posts.find((p) => p._id === id))
		.filter(Boolean) as Sanity.BlogPost[]
}
