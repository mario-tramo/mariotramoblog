import { DEFAULT_LANG } from '@/lib/i18n'
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
import PostPreview from './PostPreview6'
import List from '@/ui/modules/blog/BlogList/List'
import { cn } from '@/lib/utils'
import ScrollCarousel from './ScrollCarousel6'
import ChevronIcon from '@/ui/icons/ChevronIcon'
import NoArticlesFound from '@/ui/modules/blog/NoArticlesFound'
import type { PortableTextBlock } from '@portabletext/react'
import {
	type CollectionFilter,
	resolveCollectionFilters,
	buildGroqFilterConditions,
	buildGroqFilterParams,
} from '@/lib/resolveCollectionFilters'
import { getSectionTheme } from '@/lib/sectionBackgrounds'

export default async function BlogList({
	pretitle,
	title,
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
	title: string
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
	const lang = DEFAULT_LANG

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
		tags: ['sanity:posts', 'sanity:feed:latest', ...(category ? [`sanity:category:${category}`] : [])],
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

	// Homepage band clone (src/lib/nuove_sezioni_design.png): themed sections
	// render a left rail (title, accent, intro, CTA) next to a card carousel,
	// regardless of the layout configured in Sanity.
	const sectionLabel = pretitle || title
	const theme = getSectionTheme(sectionLabel)
	if (theme) {
		const viewAllHref = category ? `/${category}` : theme.href
		return (
			<Section nested={nested} className="overflow-hidden" {...moduleProps(props)}>				<div className="grid items-center gap-5 lg:grid-cols-[clamp(145px,18vw,200px)_minmax(0,1fr)] lg:gap-6">

					<header>
						<h2 className="font-heading text-[26px] uppercase leading-[1.05] tracking-[-0.5px] md:text-[30px]">
							{sectionLabel}
						</h2>
						<div
							className="mt-[9px] h-[3px] w-8 rounded-full"
							style={{ backgroundColor: theme.accent }}
						/>
						<div className="mt-[14px] max-w-none text-[13px] leading-[1.5] text-muted sm:max-w-[240px]">
							{intro ? <PortableText value={intro} /> : <p>{theme.intro}</p>}
						</div>
						{viewAllHref && (
							<Link
								href={viewAllHref}
								className="group mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand transition hover:underline"
							>
								Vedi tutti gli articoli
								<ChevronIcon
									direction="right"
									className="size-3 shrink-0 transition group-hover:translate-x-0.5"
								/>
							</Link>
						)}
					</header>

					<ScrollCarousel>
					<ul className="carousel gap-3 pb-2 [--size:170px] sm:gap-4 sm:[--size:190px] lg:[--size:clamp(145px,15vw,240px)]">
							{posts.map((post) => (
								<li key={post._id}>
									<PostPreview post={post} sizes="(max-width: 639px) 80vw, (max-width: 1023px) 30vw, 240px" />
								</li>
							))}
						</ul>
					</ScrollCarousel>
				</div>
			</Section>
		)
	}

	const listClassName = cn(
		'items-stretch gap-4',
		!isCarousel
			? cn(
				'grid',
				isLarge
					? 'md:grid-cols-[repeat(auto-fill,minmax(min(400px,100%),1fr))]'
					: 'md:grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))]',
			)
			: cn(
				'carousel max-xl:full-bleed pb-4 max-xl:px-4',
				isLarge
					? 'max-sm:[--size:88vw] sm:[--size:min(600px,45vw)]'
					: 'max-sm:[--size:82vw] sm:[--size:320px]',
			),
	)

	const CarouselWrapper = isCarousel ? ScrollCarousel : 'div'

	return (
		<Section nested={nested} className="space-y-8" {...moduleProps(props)}>
			{(pretitle || title || intro) && (
				<header className="space-y-4">
					{(pretitle || title) && (
						<h2 className="font-heading text-3xl uppercase tracking-tight md:text-5xl">{pretitle || title}</h2>
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
					{(category || urlCategoria) && (
						<div className="mt-8 text-center">
							<Link
								href={`/${category || urlCategoria}`}
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
