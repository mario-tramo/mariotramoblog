import { cookies } from 'next/headers'
import { DEFAULT_LANG, langCookieName } from '@/lib/i18n'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import groq from 'groq'
import { IMAGE_QUERY } from '@/sanity/lib/queries'
import moduleProps from '@/lib/moduleProps'
import Link from 'next/link'
import Section from '@/ui/primitives/Section'
import { PortableText } from '@portabletext/react'
import { stegaClean } from '@sanity/client/stega'
import FilterList from '@/ui/modules/blog/BlogList/FilterList'
import { Suspense } from 'react'
import PostPreview from '../PostPreview'
import List from './List'
import { cn } from '@/lib/utils'
import ScrollCarousel from '@/ui/primitives/ScrollCarousel'
import ChevronIcon from '@/ui/icons/ChevronIcon'
import NoArticlesFound from '../NoArticlesFound'
import type { PortableTextBlock } from '@portabletext/react'
import {
	type CollectionFilter,
	resolveCollectionFilters,
	buildGroqFilterConditions,
	buildGroqFilterParams,
} from '@/lib/resolveCollectionFilters'

export default async function BlogList({
	pretitle,
	intro,
	layout,
	cardSize,
	limit,
	showFeaturedPostsFirst,
	displayFilters,
	filters,
	category,
	searchParams,
	nested,
	filteredCategory: _filteredCategory,
	...props
}: Partial<{
	pretitle: string
	intro: PortableTextBlock[]
	layout: 'grid' | 'carousel'
	cardSize: 'standard' | 'large'
	limit: number
	showFeaturedPostsFirst: boolean
	displayFilters: boolean
	filters: CollectionFilter[]
	category: string
	filteredCategory: { _ref: string }
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
	const hasExplicitCategoryFilter =
		resolvedFilters.some((f) => f.field === 'category') || !!category
	const rawCategoria = searchParams?.categoria
	const urlCategoria =
		!hasExplicitCategoryFilter &&
			typeof rawCategoria === 'string' &&
			rawCategoria !== 'All'
			? rawCategoria
			: undefined

	const posts = await fetchSanityLive<Sanity.BlogPost[]>({
		query: groq`
			*[
				_type == 'blog.post'
				&& metadata.noIndex != true
				${!!lang ? `&& (!defined(language) || language == '${lang}')` : ''}
				${filterConditions}
				${category ? `&& $category in categories[]->.slug.current` : ''}
				${urlCategoria ? `&& $urlCategoria in categories[]->.slug.current` : ''}
			]|order(
				${showFeaturedPostsFirst ? 'featured desc, ' : ''}
				publishDate desc
			)
			${limit ? `[0...${limit}]` : ''}
			{
				...,
				'title': coalesce(title, metadata.title),
				categories[]->,
				authors[]->,
				metadata{
					...,
					image { ${IMAGE_QUERY} }
				}
			}
		`,
		params: {
			...filterParams,
			...(category ? { category } : {}),
			...(urlCategoria ? { urlCategoria } : {}),
			limit: limit ?? 0,
		},
	})

	// Show rich empty state when a category page has no posts
	if (posts.length === 0 && (urlCategoria || category)) {
		return (
			<Section nested={nested} className="space-y-8" {...moduleProps(props)}>
				<NoArticlesFound />
			</Section>
		)
	}

	const cleanCardSize = stegaClean(cardSize) || 'standard'
	const isLarge = cleanCardSize === 'large'
	const isCarousel = stegaClean(layout) !== 'grid'

	const listClassName = cn(
		'items-stretch gap-x-10 gap-y-12',
		!isCarousel
			? cn(
				'grid',
				isLarge
					? 'md:grid-cols-[repeat(auto-fill,minmax(min(400px,100%),1fr))]'
					: 'md:grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))]',
			)
			: cn(
				'carousel max-xl:full-bleed pb-4 max-xl:px-4',
				isLarge ? '[--size:min(600px,45vw)]' : '[--size:320px]',
			),
	)

	const CarouselWrapper = isCarousel ? ScrollCarousel : 'div'

	return (
		<Section nested={nested} className="space-y-8" {...moduleProps(props)}>
			{(pretitle || intro) && (
				<header className="space-y-4">
					{pretitle && (
						<h2 className="font-heading text-3xl uppercase tracking-tight md:text-5xl">{pretitle}</h2>
					)}
					{intro && (
						<div className="richtext">
							<PortableText value={intro} />
						</div>
					)}
				</header>
			)}

			{displayFilters && !urlCategoria && (
				<Suspense
					fallback={
						<div className="flex flex-wrap gap-1 max-sm:justify-center">
							{Array.from({ length: 6 }).map((_, i) => (
								<div key={i} className="h-8 w-20 rounded-full bg-ink/3" />
							))}
						</div>
					}
				>
					<FilterList />
				</Suspense>
			)}

			<CarouselWrapper>
				<Suspense
					fallback={
						<ul className={listClassName}>
							{Array.from({ length: limit ?? 6 }).map((_, i) => (
								<li key={i}>
									<PostPreview skeleton cardSize={cleanCardSize} />
								</li>
							))}
						</ul>
					}
				>
<List posts={posts} className={listClassName} cardSize={cleanCardSize} />
                {category && (
                    <div className="mt-8 text-center">
                        <Link
                            href={`/blog/${category}`}
                            className="group inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:underline"
                        >
                            Vedi tutti gli articoli
                            <ChevronIcon direction="right" className="size-3.5 shrink-0 transition group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                )}
            </Suspense>
        </CarouselWrapper>
		</Section>
	)
}
