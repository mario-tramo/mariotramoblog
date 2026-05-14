import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { DEFAULT_LANG, langCookieName } from '@/lib/i18n'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import { groq } from 'next-sanity'
import { IMAGE_QUERY } from '@/sanity/lib/queries'
import { stegaClean } from 'next-sanity'
import sortFeaturedPosts from './sortFeaturedPosts'
import FilterList from '../BlogList/FilterList'
import Pagination from './Pagination'
import PostPreview from '../PostPreview'
import NewsletterSubscribe from '@/ui/features/newsletter'
import PostListWidget from '../PostListWidget'
import FeaturedPostCard from '../FeaturedPostCard'
import Hero from '@/ui/modules/Hero'

export default async function BlogFrontpage({
	slides,
	mainPost,
	showFeaturedPostsFirst,
	itemsPerPage = 6,
	categoria,
	page = 1,
}: Partial<{
	slides: Sanity.HeroSlide[]
	mainPost: 'recent' | 'featured'
	showFeaturedPostsFirst: boolean
	itemsPerPage: number
	categoria: string
	page: number
}>) {
	const lang = (await cookies()).get(langCookieName)?.value ?? DEFAULT_LANG

	const posts = await fetchSanityLive<Sanity.BlogPost[]>({
		query: groq`
			*[
				_type == 'blog.post'
				${!!lang ? `&& (!defined(language) || language == '${lang}')` : ''}
				${categoria ? `&& $categoria in categories[]->.slug.current` : ''}
			]|order(publishDate desc){
				_type,
				_id,
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
		params: { categoria: categoria ?? '' },
	})

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
		sorted.slice(4),
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
		<section className="section space-y-8">
			{/* 3-column newspaper layout */}
			<div className="grid grid-cols-12 gap-6 sm:gap-8">
				{/* LEFT SIDEBAR */}
				<aside className="order-2 col-span-12 space-y-6 lg:order-1 lg:col-span-3">
					<PostListWidget
						variant="sidebar-thumbs"
						posts={latestPosts}
						title="ULTIME NOTIZIE"
						showDot
						viewAllHref="/blog"
						viewAllLabel="Vedi tutte le notizie"
					/>
					<NewsletterSubscribe variant="compact" />
				</aside>

				{/* CENTER CONTENT */}
				<div className="order-1 col-span-12 space-y-6 lg:order-2 lg:col-span-6">
					{slides?.length ? (
						<Hero slides={slides} _type="hero" _key="blog-frontpage-hero" />
					) : (
						<PostListWidget
							variant="grid"
							posts={topStories}
							title="ARTICOLI IN EVIDENZA"
							viewAllHref="/blog"
							viewAllLabel="Vedi tutti"
						/>
					)}
					<PostListWidget
						variant="list"
						posts={morePosts}
						title="ALTRE NOTIZIE"
						viewAllHref="/blog"
						viewAllLabel="Vedi altre notizie"
					/>
				</div>

				{/* RIGHT SIDEBAR */}
				<aside className="order-3 col-span-12 space-y-6 lg:col-span-3">
					<PostListWidget
						variant="sidebar-numbered"
						posts={trendingPosts}
						title="DI TENDENZA"
						viewAllHref="/blog"
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
					<FilterList />
				</Suspense>
			</div>

			<div className="relative space-y-12">
				<ul
					id="blog-list"
					className="grid scroll-mt-[calc(var(--header-height)+1rem)] gap-x-8 gap-y-12 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
				>
					{paginatedPosts.length > 0 ? (
						paginatedPosts.map((post) => (
							<li className="anim-fade" key={post._id}>
								<PostPreview post={post} />
							</li>
						))
					) : (
						<li>Nessun articolo trovato...</li>
					)}
				</ul>

				<Pagination
					currentPage={safePage}
					totalPages={totalPages}
					basePath="/blog"
				/>
			</div>
		</section>
	)
}
