import { cookies } from 'next/headers'
import { DEFAULT_LANG, langCookieName } from '@/lib/i18n'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import { groq } from 'next-sanity'
import { BLOG_DIR } from '@/lib/env'
import Carousel from './Carousel'
import {
	type CollectionFilter,
	resolveCollectionFilters,
	buildGroqFilterConditions,
	buildGroqFilterParams,
} from '@/lib/resolveCollectionFilters'

export default async function ArticleCarousel({
	limit = 5,
	showFeaturedFirst,
	filteredCategory,
	filters,
	searchParams,
}: Partial<{
	limit: number
	showFeaturedFirst: boolean
	filteredCategory: Sanity.BlogCategory
	filters: CollectionFilter[]
	searchParams: Record<string, string | string[] | undefined>
	nested: boolean
}> &
	Sanity.Module) {
	const lang = (await cookies()).get(langCookieName)?.value ?? DEFAULT_LANG

	// Resolve dynamic filters (new system)
	const resolvedFilters = resolveCollectionFilters(filters, { searchParams })
	const filterConditions = buildGroqFilterConditions(resolvedFilters)
	const filterParams = buildGroqFilterParams(resolvedFilters)

	// Auto-apply ?categoria from URL when no explicit category filter configured
	const hasExplicitCategoryFilter = resolvedFilters.some(
		(f) => f.field === 'category',
	)
	const rawCategoria = searchParams?.categoria
	const urlCategoria =
		!hasExplicitCategoryFilter &&
		typeof rawCategoria === 'string' &&
		rawCategoria !== 'All'
			? rawCategoria
			: undefined

	// Legacy: filteredCategory still works if no new filters are configured
	const hasLegacyFilter = !!filteredCategory && !filters?.length

	const posts = await fetchSanityLive<
		{
			_id: string
			title: string
			description: string | null
			slug: string
			publishDate: string
			imageUrl: string | null
			lqip: string | null
			author: { name: string } | null
			categories: { title: string }[]
		}[]
	>({
		query: groq`
			*[
				_type == 'blog.post'
				${!!lang ? `&& (!defined(language) || language == '${lang}')` : ''}
				${hasLegacyFilter ? `&& $filteredCategory in categories[]->._id` : ''}
				${filterConditions}
				${urlCategoria ? `&& $urlCategoria in categories[]->.slug.current` : ''}
			]|order(
				${showFeaturedFirst ? 'featured desc, ' : ''}
				publishDate desc
			)[0...${limit}]{
				_id,
				'title': metadata.title,
				'description': metadata.description,
				'slug': '/${BLOG_DIR}/' + metadata.slug.current,
				publishDate,
				'imageUrl': metadata.image.asset->url,
				'lqip': metadata.image.asset->metadata.lqip,
				'author': author->{ name },
				categories[]->{ title },
			}
		`,
		params: {
			...(hasLegacyFilter
				? { filteredCategory: filteredCategory?._id || '' }
				: {}),
			...filterParams,
			...(urlCategoria ? { urlCategoria } : {}),
		},
	})

	if (!posts?.length) return null

	return <Carousel posts={posts} />
}
