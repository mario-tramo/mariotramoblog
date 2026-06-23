import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { DEFAULT_LANG, langCookieName } from '@/lib/i18n'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import groq from 'groq'
import { IMAGE_QUERY } from '@/sanity/lib/queries'
import { stegaClean } from '@sanity/client/stega'
import sortFeaturedPosts from './sortFeaturedPosts'
import FilterList from '../BlogList/FilterList'
import PaginatedPosts from './PaginatedPosts'
import PostListWidget from '../PostListWidget'
import FeaturedPostCard from '../FeaturedPostCard'
import Hero from '@/ui/modules/Hero'
import CompactCarousel from '../CompactCarousel'
import {
	type CollectionFilter,
	resolveCollectionFilters,
	buildGroqFilterConditions,
	buildGroqFilterParams,
} from '@/lib/resolveCollectionFilters'
import NoArticlesFound from '../NoArticlesFound'

export default async function BlogFrontpage({
	slides,
	mainPost,
	showFeaturedPostsFirst,
	itemsPerPage = 6,
	filters,
	searchParams,
	page = 1,
	basePath = '/',
	...props
}: Partial<{
	slides: Sanity.HeroSlide[]
	mainPost: 'recent' | 'featured'
	showFeaturedPostsFirst: boolean
	itemsPerPage: number
	filters: CollectionFilter[]
	searchParams: Record<string, string | string[] | undefined>
	page: number
	basePath: string
}>) {
	const lang = (await cookies()).get(langCookieName)?.value ?? DEFAULT_LANG

	const resolvedFilters = resolveCollectionFilters(filters, { searchParams })
	const filterConditions = buildGroqFilterConditions(resolvedFilters)
	const filterParams = buildGroqFilterParams(resolvedFilters)

	// Auto-apply ?categoria from URL (used by FilterList) when no explicit category filter configured
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

	const posts = await fetchSanityLive<Sanity.BlogPost[]>({
		query: groq`
			*[
				_type == 'blog.post'
				&& metadata.noIndex != true
				${!!lang ? `&& (!defined(language) || language == '${lang}')` : ''}
				${filterConditions}
				${urlCategoria ? `&& $urlCategoria in categories[]->.slug.current` : ''}
			]|order(publishDate desc){
				_type,
				_id,
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
			}
		`,
		params: {
			...filterParams,
			...(urlCategoria ? { urlCategoria } : {}),
		},
	})

	// Show rich empty state when a category page has no posts
	if (posts.length === 0 && urlCategoria) {
		return (
			<section className="section space-y-8">
				<NoArticlesFound />
			</section>
		)
	}

	const sorted =
		stegaClean(mainPost) === 'featured'
			? sortFeaturedPosts(posts)
			: posts

	const featuredPosts = sorted.filter((p) => p.featured)
	const editorPick = featuredPosts[0] || sorted[0]
	const topStories = sorted.slice(0, 4)
	const latestPosts = sorted.slice(0, 5)
	const trendingPosts = [
		...featuredPosts,
		...sorted.filter((p) => !p.featured),
	].slice(0, 5)
	const morePosts = sorted.slice(4, 10)
	const remainingPosts = sortFeaturedPosts(
		urlCategoria ? sorted : sorted.slice(10),
		showFeaturedPostsFirst,
	)

	// Server-side pagination
	const currentPage = Math.max(1, page)
	const totalPages = Math.ceil(remainingPosts.length / itemsPerPage)
	const safePage = Math.min(currentPage, Math.max(1, totalPages))
	const paginatedPosts = remainingPosts.slice(
		(safePage - 1) * itemsPerPage,
		safePage * itemsPerPage,
	)

	return (
		<section className="section space-y-8" {...props}>
			<h1 className="sr-only">
				TRM Sport — Notizie di Calcio, Formula 1, Tennis e Sport
			</h1>

			{/* 3-column newspaper layout */}
			<div className="grid grid-cols-12 gap-6 sm:gap-8">
				{/* LEFT SIDEBAR */}
				<aside className="order-2 col-span-12 space-y-6 lg:order-1 lg:col-span-3">
					<PostListWidget
						variant="sidebar-thumbs"
						posts={latestPosts}
						title="ULTIME NOTIZIE"
						showDot
						viewAllHref="/"
						viewAllLabel="Vedi tutte le notizie"
					/>
				</aside>

				{/* CENTER CONTENT */}
				<div className="order-1 col-span-12 space-y-6 lg:order-2 lg:col-span-6">
					{slides?.length ? (
						<Hero slides={slides} _type="hero" _key="blog-frontpage-hero" />
					) : (
						<CompactCarousel posts={topStories} />
					)}
					<PostListWidget
						variant="list"
						posts={morePosts}
						title="ALTRE NOTIZIE"
						viewAllHref="/"
						viewAllLabel="Vedi altre notizie"
					/>
				</div>

				{/* RIGHT SIDEBAR */}
				<aside className="order-3 col-span-12 space-y-6 lg:col-span-3">
					<PostListWidget
						variant="sidebar-numbered"
						posts={trendingPosts}
						title="DI TENDENZA"
						viewAllHref="/"
						viewAllLabel="Vedi tutti i trend"
					/>
					<FeaturedPostCard
						post={editorPick}
						title="SCELTA DELLA REDAZIONE"
					/>
				</aside>
			</div>

			{/* Full-width: Filter + Paginated list */}
			<hr className="my-4" />

			{!urlCategoria && (
				<div className="py-4">
					<Suspense
						fallback={
							<div className="flex flex-wrap gap-2 max-sm:justify-center">
								{Array.from({ length: 6 }).map((_, i) => (
									<div key={i} className="h-8 w-20 rounded-full bg-ink/3" />
								))}
							</div>
						}
					>
						<FilterList navigateToCategory />
					</Suspense>
				</div>
			)}

			<PaginatedPosts
				posts={paginatedPosts}
				currentPage={safePage}
				totalPages={totalPages}
				basePath={basePath ?? '/'}
				searchParams={searchParams}
			/>
		</section>
	)
}
