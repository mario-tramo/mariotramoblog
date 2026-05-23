import { Suspense } from 'react'
import { stegaClean } from 'next-sanity'
import { cn } from '@/lib/utils'
import moduleProps from '@/lib/moduleProps'
import { getPostsFeed, type PostsFeedSource } from '@/lib/getPostsFeed'
import { type CollectionFilter } from '@/lib/resolveCollectionFilters'
import PostPreview from './blog/PostPreview'
import PostListWidget from './blog/PostListWidget'
import ScrollCarousel from '@/ui/primitives/ScrollCarousel'

type PostsFeedLayout = 'carousel' | 'grid' | 'list' | 'numbered' | 'thumbs'

export default async function PostsFeed({
	title,
	source = 'latest',
	layout = 'carousel',
	limit = 6,
	manualPosts,
	filters,
	viewAllHref,
	viewAllLabel,
	searchParams,
	nested,
	...props
}: Partial<{
	title: string
	source: PostsFeedSource
	layout: PostsFeedLayout
	limit: number
	manualPosts: { _ref: string }[]
	filters: CollectionFilter[]
	viewAllHref: string
	viewAllLabel: string
	searchParams: Record<string, string | string[] | undefined>
	nested: boolean
}> &
	Sanity.Module) {
	const cleanSource = stegaClean(source)
	const cleanLayout = stegaClean(layout)
	const cleanLimit = stegaClean(limit)

	const posts = await getPostsFeed({
		source: cleanSource,
		limit: cleanLimit,
		manualPosts,
		filters,
		searchParams,
	})

	if (!posts?.length) return null

	// Widget layouts delegate to PostListWidget
	if (
		cleanLayout === 'list' ||
		cleanLayout === 'numbered' ||
		cleanLayout === 'thumbs'
	) {
		const variantMap = {
			list: 'list',
			numbered: 'sidebar-numbered',
			thumbs: 'sidebar-thumbs',
		} as const

		return (
			<section
				className={cn(!nested && 'section', 'space-y-6')}
				{...moduleProps(props)}
			>
				<PostListWidget
					variant={variantMap[cleanLayout]}
					posts={posts}
					title={title || ''}
					limit={cleanLimit}
					viewAllHref={viewAllHref}
					viewAllLabel={viewAllLabel}
				/>
			</section>
		)
	}

	// Grid layout
	if (cleanLayout === 'grid') {
		return (
			<section
				className={cn(!nested && 'section', 'space-y-6')}
				{...moduleProps(props)}
			>
				{title && (
					<header className="border-b-2 border-ink/10 pb-3">
						<h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
							{title}
						</h2>
					</header>
				)}

				<ul className="grid gap-x-8 gap-y-12 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
					{posts.map((post) => (
						<li key={post._id} className="anim-fade">
							<PostPreview post={post} />
						</li>
					))}
				</ul>
			</section>
		)
	}

	// Carousel layout (default)
	return (
		<section
			className={cn(!nested && 'section', 'space-y-6')}
			{...moduleProps(props)}
		>
			{title && (
				<header className="border-b-2 border-ink/10 pb-3">
					<h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
						{title}
					</h2>
				</header>
			)}

			<ScrollCarousel>
				<Suspense
					fallback={
						<ul className="carousel max-xl:full-bleed md:overflow-fade-r pb-4 max-xl:px-4 [--size:320px]">
							{Array.from({ length: cleanLimit }).map((_, i) => (
								<li key={i}>
									<PostPreview skeleton />
								</li>
							))}
						</ul>
					}
				>
					<ul className="carousel max-xl:full-bleed md:overflow-fade-r pb-4 max-xl:px-4 gap-4 [--size:320px]">
						{posts.map((post) => (
							<li key={post._id} className="anim-fade">
								<PostPreview post={post} />
							</li>
						))}
					</ul>
				</Suspense>
			</ScrollCarousel>
		</section>
	)
}
