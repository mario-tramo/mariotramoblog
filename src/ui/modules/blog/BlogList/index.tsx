import { cookies } from 'next/headers'
import { DEFAULT_LANG, langCookieName } from '@/lib/i18n'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import { groq } from 'next-sanity'
import { IMAGE_QUERY } from '@/sanity/lib/queries'
import moduleProps from '@/lib/moduleProps'
import Pretitle from '@/ui/primitives/Pretitle'
import { PortableText, stegaClean } from 'next-sanity'
import FilterList from '@/ui/modules/blog/BlogList/FilterList'
import { Suspense } from 'react'
import PostPreview from '../PostPreview'
import List from './List'
import { cn } from '@/lib/utils'
import ScrollCarousel from '@/ui/primitives/ScrollCarousel'
import Link from 'next/link'
import { BLOG_DIR } from '@/lib/env'
import { ChevronRight } from 'lucide-react'
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
	filteredCategory,
	filters,
	searchParams,
	nested,
	...props
}: Partial<{
	pretitle: string
	intro: PortableTextBlock[]
	layout: 'grid' | 'carousel'
	cardSize: 'standard' | 'large'
	limit: number
	showFeaturedPostsFirst: boolean
	displayFilters: boolean
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

	// Legacy: filteredCategory still works if no new filters are configured
	const hasLegacyFilter = !!filteredCategory && !filters?.length

	const posts = await fetchSanityLive<Sanity.BlogPost[]>({
		query: groq`
			*[
				_type == 'blog.post'
				${!!lang ? `&& (!defined(language) || language == '${lang}')` : ''}
				${hasLegacyFilter ? `&& $filteredCategory in categories[]->._id` : ''}
				${filterConditions}
			]|order(
				${showFeaturedPostsFirst ? 'featured desc, ' : ''}
				publishDate desc
			)
			${limit ? `[0...${limit}]` : ''}
			{
				...,
				categories[]->,
				authors[]->,
				metadata{
					...,
					image { ${IMAGE_QUERY} }
				}
			}
		`,
		params: {
			...(hasLegacyFilter
				? { filteredCategory: filteredCategory?._id || '' }
				: {}),
			...filterParams,
			limit: limit ?? 0,
		},
	})

	const cleanCardSize = stegaClean(cardSize) || 'standard'
	const isLarge = cleanCardSize === 'large'
	const isCarousel = stegaClean(layout) !== 'grid'

	const listClassName = cn(
		'items-stretch gap-x-8 gap-y-12',
		!isCarousel
			? cn(
					'grid',
					isLarge
						? 'md:grid-cols-[repeat(auto-fill,minmax(min(400px,100%),1fr))]'
						: 'md:grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))]',
				)
			: cn(
					'carousel max-xl:full-bleed md:overflow-fade-r pb-4 max-xl:px-4',
					isLarge ? '[--size:min(600px,45vw)]' : '[--size:320px]',
				),
	)

	const CarouselWrapper = isCarousel ? ScrollCarousel : 'div'

	return (
		<section className={cn(!nested && 'section', 'space-y-8')} {...moduleProps(props)}>
			{(pretitle || intro) && (
				<header className={cn(intro ? 'richtext' : 'flex items-end justify-between border-b-2 border-ink/10 pb-3')}>
					{pretitle && !intro ? (
						<>
							<h2 className="text-2xl font-extrabold tracking-tight">{pretitle}</h2>
							{filteredCategory?.slug?.current && (
								<Link
									href={`/${BLOG_DIR}?categoria=${filteredCategory.slug.current}`}
									className="flex items-center gap-1 text-sm font-semibold text-brand transition-colors hover:text-brand/80"
								>
									Vedi tutti
									<ChevronRight className="size-4" />
								</Link>
							)}
						</>
					) : (
						<>
							<Pretitle>{pretitle}</Pretitle>
							{intro && <PortableText value={intro} />}
						</>
					)}
				</header>
			)}

			{displayFilters && !filteredCategory && (
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
				</Suspense>
			</CarouselWrapper>
		</section>
	)
}
