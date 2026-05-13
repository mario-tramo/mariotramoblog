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
import { cn, getInitials } from '@/lib/utils'
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
			{/* Header */}
			<header className="mx-auto max-w-[820px] space-y-4 px-4 pt-6 sm:px-6 sm:pt-10">
				{/* Category tag */}
				{post.categories?.[0] && (
					<Categories
						className="flex flex-wrap gap-2"
						categories={[post.categories[0]]}
						linked
					/>
				)}

				<h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
					{post.metadata.title}
				</h1>

				{post.metadata.description && (
					<p className="text-lg leading-relaxed text-muted">
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
									By {firstAuthor.name}
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

				{/* Hero image */}
				{post.metadata.image && (
					<figure className="overflow-hidden rounded-2xl border border-border">
						<Img
							className="aspect-video w-full object-cover"
							image={post.metadata.image}
							width={820}
							alt={post.metadata.title}
							loading="eager"
						/>
					</figure>
				)}
			</header>

			{/* Body */}
			<div
				className={cn(
					'mx-auto max-w-[820px] px-4 sm:px-6',
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

			{/* Footer nav */}
			<div className="mx-auto mt-10 flex max-w-[820px] items-center justify-between border-t border-border px-4 pt-6 sm:px-6">
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

			{/* Related posts */}
			<RelatedPosts post={post} />
		</article>
	)
}
