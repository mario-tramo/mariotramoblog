import { cookies } from 'next/headers'
import { DEFAULT_LANG, langCookieName } from '@/lib/i18n'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import groq from 'groq'
import { cn } from '@/lib/utils'
import Section from '@/ui/primitives/Section'
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
	filters,
	searchParams,
	nested,
	...props
}: Partial<{
	limit: number
	showFeaturedFirst: boolean
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

	const posts = await fetchSanityLive<
		{
			_id: string
			title: string
			description: string | null
			slug: string
			publishDate: string
			imageUrl: string | null
			lqip: string | null
			hotspot: { x: number; y: number } | null
			authors: { name: string; imageUrl: string | null }[] | null
			categories: { title: string }[]
		}[]
	>({
		query: groq`
			*[
				_type == 'blog.post'
				&& metadata.noIndex != true
				&& featured == true
				${!!lang ? `&& (!defined(language) || language == '${lang}')` : ''}
				${filterConditions}
				${urlCategoria ? `&& $urlCategoria in categories[]->.slug.current` : ''}
			]|order(
				${showFeaturedFirst ? 'featured desc, ' : ''}
				publishDate desc
			)[0...${limit}]{
				_id,
				'title': coalesce(title, metadata.title),
				'description': metadata.description,
				'slug': '/' + coalesce(categories[0]->slug.current, '') + '/' + coalesce(metadata.slug.current, ''),
				publishDate,
				'imageUrl': metadata.image.asset->url,
				'lqip': metadata.image.asset->metadata.lqip,
				'hotspot': metadata.image.hotspot{ x, y },
				'authors': authors[]->{ name, 'imageUrl': image.asset->url },
				categories[]->{ title },
			}
		`,
		params: {
			...filterParams,
			...(urlCategoria ? { urlCategoria } : {}),
		},
	})

	if (!posts?.length) return null

	return (
		<Section nested={nested} className={cn(!nested && '!pt-2 !pb-4 md:!pt-2 md:!pb-8', 'overflow-hidden')} {...props}>
			<Carousel posts={posts} />
		</Section>
	)
}
