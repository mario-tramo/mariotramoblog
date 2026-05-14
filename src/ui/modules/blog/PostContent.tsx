import { Suspense } from 'react'
import moduleProps from '@/lib/moduleProps'
import Link from 'next/link'
import { Img } from '@/ui/primitives/Img'
import Date from '@/ui/primitives/Date'
import Categories from './Categories'
import ReadTime from './ReadTime'
import ShareBar from './ShareBar'
import TableOfContents from '@/ui/modules/RichtextModule/TableOfContents'
import Content from '@/ui/modules/RichtextModule/Content'
import RelatedPosts from './RelatedPosts'
import ChevronIcon from '@/ui/icons/ChevronIcon'
import NewsletterSubscribe from '@/ui/features/newsletter'
import { cn, getInitials } from '@/lib/utils'
import { RelatedPostsSkeleton } from '@/ui/skeletons/PostContentSkeleton'
import css from './PostContent.module.css'

export default function PostContent({
	post,
	...props
}: { post?: Sanity.BlogPost } & Sanity.Module) {
	if (!post) return null

	const showTOC = !post.hideTableOfContents && !!post.headings?.length
	const firstAuthor = post.authors?.[0]

	return (
		<article {...moduleProps(props)}>
			{/* Breadcrumb */}
			<nav
				aria-label="Navigazione breadcrumb"
				className="mx-auto max-w-screen-xl px-4 pt-4 sm:px-6"
			>
				<ol className="flex flex-wrap items-center gap-1 text-xs text-muted">
					<li>
						<Link href="/" className="transition hover:text-ink">
							Home page
						</Link>
					</li>
					<li aria-hidden="true">&gt;</li>
					<li>
						<Link
							href="/blog"
							className="transition hover:text-ink"
						>
							Notizie
						</Link>
					</li>
					{post.categories?.[0] && (
						<>
							<li aria-hidden="true">&gt;</li>
							<li>
								<Link
									href={`/blog?categoria=${post.categories[0].slug.current}`}
									className="transition hover:text-ink"
								>
									{post.categories[0].title}
								</Link>
							</li>
						</>
					)}
					<li aria-hidden="true">&gt;</li>
					<li className="truncate text-ink/50">
						{post.metadata.title}
					</li>
				</ol>
			</nav>

			{/* 2-column layout */}
			<div className="mx-auto grid max-w-screen-xl gap-8 px-4 pt-6 sm:px-6 lg:grid-cols-[1fr_320px]">
				{/* Main content */}
				<div className="min-w-0">
					{/* Header */}
					<header className="space-y-4">
						{/* Category tag */}
						{post.categories?.[0] && (
							<Categories
								className="flex flex-wrap gap-2"
								categories={[post.categories[0]]}
								linked
							/>
						)}

						<h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
							{post.metadata.title}
						</h1>

						{post.metadata.description && (
							<p className="text-base leading-relaxed text-muted sm:text-lg">
								{post.metadata.description}
							</p>
						)}

						{/* Author bar + share */}
						<div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-border py-4 text-sm text-muted">
							{firstAuthor && (
								<div className="flex items-center gap-2">
									<span className="grid size-9 place-items-center rounded-full bg-brand text-xs font-bold text-brand-foreground">
										{firstAuthor.image ? (
											<Img
												className="size-full rounded-full object-cover"
												image={firstAuthor.image}
												width={72}
												alt={firstAuthor.name}
											/>
										) : (
											getInitials(firstAuthor.name)
										)}
									</span>
									<div className="leading-tight">
										<p className="text-sm font-semibold text-ink">
											Di {firstAuthor.name}
										</p>
										<p className="text-xs">
											<Date value={post.publishDate} />
											{' \u2022 '}
											<ReadTime value={post.readTime} />
										</p>
									</div>
								</div>
							)}

							<ShareBar title={post.metadata.title} />
						</div>
					</header>

					{/* Hero image */}
					{post.metadata.image && (
						<figure className="mt-6 overflow-hidden rounded-xl border border-border">
							<Img
								className="aspect-video w-full object-cover"
								image={post.metadata.image}
								width={900}
								alt={post.metadata.title}
								loading="eager"
							/>
						</figure>
					)}

					{/* Body */}
					<div
						className={cn(
							'mt-8 grid gap-8',
							showTOC && 'lg:grid-cols-[1fr_auto]',
						)}
					>
						{showTOC && (
							<aside className="lg:sticky-below-header mx-auto w-full max-w-lg self-start [--offset:1rem] lg:order-1 lg:w-3xs">
								<TableOfContents headings={post.headings} />
							</aside>
						)}

						<Content
							value={post.body}
							className={cn(css.body, 'grid max-w-screen-md')}
						>
							<hr />
						</Content>
					</div>

					{/* Tags */}
					{post.categories && post.categories.length > 0 && (
						<div className="mt-8 flex flex-wrap items-center gap-2 border-t border-border pt-6">
							<span className="text-xs font-bold uppercase tracking-widest text-muted">
								Etichette
							</span>
							<Categories
								className="flex flex-wrap gap-2"
								categories={post.categories}
								linked
							/>
						</div>
					)}

					{/* Footer nav */}
					<div className="mt-8 flex items-center justify-between border-t border-border pt-6">
						{post.categories?.[0] && (
							<Link
								href={`/blog?categoria=${post.categories[0].slug.current}`}
								className="inline-flex items-center gap-2 text-sm text-brand hover:underline"
							>
								<ChevronIcon direction="left" />
								{post.categories[0].title}
							</Link>
						)}
						<Link
							href="/blog"
							className="text-sm text-muted transition hover:text-ink"
						>
							Blog
						</Link>
					</div>
				</div>

				{/* Sidebar */}
				<aside className="space-y-5 max-lg:order-last lg:sticky-below-header lg:self-start lg:[--offset:1rem]">
					{/* Related stories */}
					<Suspense fallback={<RelatedPostsSkeleton />}>
						<RelatedPosts post={post} variant="sidebar" />
					</Suspense>

					{/* Newsletter */}
					<NewsletterSubscribe variant="compact" />
				</aside>
			</div>
		</article>
	)
}
