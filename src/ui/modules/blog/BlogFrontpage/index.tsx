import { cookies } from 'next/headers'
import { DEFAULT_LANG, langCookieName } from '@/lib/i18n'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import { groq } from 'next-sanity'
import { IMAGE_QUERY } from '@/sanity/lib/queries'
import { stegaClean } from 'next-sanity'
import sortFeaturedPosts from './sortFeaturedPosts'
import { Suspense } from 'react'
import FilterList from '../BlogList/FilterList'
import Paginated from './Paginated'
import PostPreview from '../PostPreview'
import NewsletterSubscribe from '@/ui/features/newsletter'
import PostListWidget from '../PostListWidget'
import FeaturedPostCard from '../FeaturedPostCard'

export default async function BlogFrontpage({
	mainPost,
	showFeaturedPostsFirst,
	itemsPerPage,
	categoria,
}: Partial<{
	mainPost: 'recent' | 'featured'
	showFeaturedPostsFirst: boolean
	itemsPerPage: number
	categoria: string
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
	const remainingPosts = sorted.slice(4)

	return (
		<section className="section space-y-5">
			{/* 3-column newspaper layout */}
			<div className="grid grid-cols-12 gap-4 sm:gap-5">
				{/* LEFT SIDEBAR */}
				<aside className="order-2 col-span-12 space-y-4 sm:space-y-5 lg:order-1 lg:col-span-3">
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
				<div className="order-1 col-span-12 space-y-4 sm:space-y-5 lg:order-2 lg:col-span-6">
					<PostListWidget
						variant="grid"
						posts={topStories}
						title="ARTICOLI IN EVIDENZA"
						viewAllHref="/blog"
						viewAllLabel="Vedi tutti"
					/>
					<PostListWidget
						variant="list"
						posts={morePosts}
						title="ALTRE NOTIZIE"
						viewAllHref="/blog"
						viewAllLabel="Vedi altre notizie"
					/>
				</div>

				{/* RIGHT SIDEBAR */}
				<aside className="order-3 col-span-12 space-y-4 sm:space-y-5 lg:col-span-3">
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
			<hr />

			<FilterList />

			<Suspense
				fallback={
					<ul className="grid gap-x-8 gap-y-12 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
						{Array.from({ length: itemsPerPage ?? 6 }).map(
							(_, i) => (
								<li key={i}>
									<PostPreview skeleton />
								</li>
							),
						)}
					</ul>
				}
			>
				<Paginated
					posts={sortFeaturedPosts(remainingPosts, showFeaturedPostsFirst)}
					itemsPerPage={itemsPerPage}
				/>
			</Suspense>
		</section>
	)
}
