import { Suspense } from 'react'
import { PortableText, stegaClean } from 'next-sanity'
import { cn } from '@/lib/utils'
import moduleProps from '@/lib/moduleProps'
import { getPostsFeed, type PostsFeedSource } from '@/lib/getPostsFeed'
import { type CollectionFilter } from '@/lib/resolveCollectionFilters'
import PostPreview from './blog/PostPreview'
import PostListWidget from './blog/PostListWidget'
import ScrollCarousel from '@/ui/primitives/ScrollCarousel'
import type { PortableTextBlock } from '@portabletext/react'

type PostsFeedLayout = 'carousel' | 'grid' | 'list' | 'numbered' | 'thumbs'

export default async function PostsFeed({
	title,
	intro,
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
	intro: PortableTextBlock[]
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
				{(title || intro) && (
					<header className={cn(intro ? 'space-y-2 border-b-2 border-line pb-3' : 'border-b-2 border-line pb-3')}>
						{title && (
							<h2 className="font-heading text-4xl uppercase tracking-tight md:text-5xl">
								{title}
							</h2>
						)}
						{intro && (
							<div className="text-sm leading-relaxed text-muted">
								<PortableText value={intro} />
							</div>
						)}
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
			className={cn(!nested && 'section', 'space-y-6 overflow-hidden')}
			{...moduleProps(props)}
		>
			{(title || intro) && (
				<header className={cn(intro ? 'space-y-2 border-b border-line-soft pb-4' : 'border-b border-line-soft pb-4')}>
					{title && (
						<h2 className="font-heading text-3xl uppercase tracking-tight md:text-5xl">
							{title}
						</h2>
					)}
					{intro && (
						<div className="text-sm leading-relaxed text-muted">
							<PortableText value={intro} />
						</div>
					)}
				</header>
			)}

			<ScrollCarousel>
				<Suspense
					fallback={
						<ul className="carousel max-xl:full-bleed justify-center pb-4 max-xl:px-4 [--size:320px]">
							{Array.from({ length: cleanLimit }).map((_, i) => (
								<li key={i}>
									<PostPreview skeleton />
								</li>
							))}
						</ul>
					}
				>
					<ul className="carousel max-xl:full-bleed justify-center pb-4 max-xl:px-4 gap-4 [--size:320px]">
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
