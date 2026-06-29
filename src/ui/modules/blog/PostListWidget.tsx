import Link from 'next/link'
import { Img } from '@/ui/primitives/Img'
import SectionCard from '@/ui/primitives/SectionCard'
import SectionTitle from '@/ui/primitives/SectionTitle'
import ChevronIcon from '@/ui/icons/ChevronIcon'
import resolveUrl from '@/lib/resolveUrl'
import ReadTime from './ReadTime'
import { getCategoryColor } from '@/lib/categoryColors'
import TimeAgo from '@/ui/primitives/TimeAgo'

export type PostListVariant =
	| 'sidebar-thumbs'
	| 'sidebar-numbered'
	| 'grid'
	| 'list'

interface PostListWidgetProps {
	posts: Sanity.BlogPost[]
	variant: PostListVariant
	title: string
	limit?: number
	viewAllHref?: string
	viewAllLabel?: string
	/** Show pulsing dot before the title (sidebar-thumbs) */
	showDot?: boolean
	/** CTA button style: 'link' for text arrow, 'outline' for bordered, 'brand' for filled */
	ctaStyle?: 'link' | 'outline' | 'brand'
}

/** sidebar-thumbs: small thumbnail + time ago + title */
function SidebarThumbs({
	posts,
	limit,
}: {
	posts: Sanity.BlogPost[]
	limit: number
}) {
	return (
		<ul className="space-y-5">
			{posts.slice(0, limit).map((post) => (
				<li key={post._id} className="group relative">
					<Link
						href={resolveUrl(post, { base: false })}
						className="flex gap-3"
					>
						<figure className="size-16 flex-shrink-0 overflow-hidden rounded-lg">
							<Img
								className="size-full object-cover"
								image={post.metadata.image}
								width={128}
								alt={post.title}
							/>
						</figure>
						<div className="min-w-0">
							<p
								className="mb-1 text-[11px] font-medium"
								style={{ color: getCategoryColor(post.categories?.[0]) }}
							>
								<TimeAgo dateStr={post.publishDate} />
							</p>
							<p className="line-clamp-2 text-sm font-medium leading-snug group-hover:underline">
								{post.title}
							</p>
						</div>
					</Link>
				</li>
			))}
		</ul>
	)
}

/** sidebar-numbered: ranked list with number badge */
function SidebarNumbered({
	posts,
	limit,
}: {
	posts: Sanity.BlogPost[]
	limit: number
}) {
	return (
		<ol className="space-y-4">
			{posts.slice(0, limit).map((post, i) => (
				<li key={post._id} className="group relative">
					<Link
						href={resolveUrl(post, { base: false })}
						className="flex gap-3"
					>
						<span
							className="grid size-7 flex-shrink-0 place-items-center rounded-md text-xs font-bold text-white"
							style={{ backgroundColor: getCategoryColor(post.categories?.[0]) }}
						>
							{i + 1}
						</span>
						<div>
							<p className="text-[13px] font-medium leading-snug group-hover:underline">
								{post.title}
							</p>
							<ReadTime value={post.readTime} className="text-[11px] text-muted" />
						</div>
					</Link>
				</li>
			))}
		</ol>
	)
}

/** grid: 2x2 or 4-col card grid with images + category tag */
function Grid({
	posts,
	limit,
}: {
	posts: Sanity.BlogPost[]
	limit: number
}) {
	return (
		<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
			{posts.slice(0, limit).map((post) => (
				<article key={post._id} className="group relative space-y-3">
					<div className="aspect-[4/3] overflow-hidden rounded-lg">
						<Img
							className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
							image={post.metadata.image}
							width={400}
							alt={post.title}
						/>
					</div>

					{post.categories?.[0] && (
						<p
							className="text-[10px] font-bold tracking-widest"
							style={{ color: getCategoryColor(post.categories[0]) }}
						>
							{post.categories[0].title.toUpperCase()}
						</p>
					)}

					<h3 className="text-xs font-semibold leading-snug">
						<Link href={resolveUrl(post, { base: false })}>
							<span className="absolute inset-0" />
							<span className="line-clamp-2">
								{post.title}
							</span>
						</Link>
					</h3>

					<ReadTime value={post.readTime} className="text-[11px] text-muted" />
				</article>
			))}
		</div>
	)
}

/** list: compact 2-col list with small thumbnails */
function List({
	posts,
	limit,
}: {
	posts: Sanity.BlogPost[]
	limit: number
}) {
	return (
		<div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
			{posts.slice(0, limit).map((post) => (
				<article key={post._id} className="group relative flex gap-3">
					<figure className="size-20 flex-shrink-0 overflow-hidden rounded-lg sm:size-24">
						<Img
							className="size-full object-cover"
							image={post.metadata.image}
							width={128}
							alt={post.title}
						/>
					</figure>
					<div className="min-w-0">
						<h3 className="text-sm font-semibold leading-snug">
							<Link href={resolveUrl(post, { base: false })}>
								<span className="absolute inset-0" />
								{post.title}
							</Link>
						</h3>
						{post.metadata?.description && (
							<p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
								{post.metadata.description}
							</p>
						)}
						<ReadTime value={post.readTime} className="mt-1 text-[11px] text-muted" />
					</div>
				</article>
			))}
		</div>
	)
}

const VARIANT_DEFAULTS: Record<
	PostListVariant,
	{ limit: number; ctaStyle: PostListWidgetProps['ctaStyle'] }
> = {
	'sidebar-thumbs': { limit: 5, ctaStyle: 'link' },
	'sidebar-numbered': { limit: 5, ctaStyle: 'outline' },
	grid: { limit: 4, ctaStyle: 'link' },
	list: { limit: 6, ctaStyle: 'brand' },
}

const RENDERERS: Record<
	PostListVariant,
	React.FC<{ posts: Sanity.BlogPost[]; limit: number }>
> = {
	'sidebar-thumbs': SidebarThumbs,
	'sidebar-numbered': SidebarNumbered,
	grid: Grid,
	list: List,
}

export default function PostListWidget({
	posts,
	variant,
	title,
	limit,
	viewAllHref,
	viewAllLabel,
	showDot = false,
	ctaStyle,
}: PostListWidgetProps) {
	if (!posts?.length) return null

	const defaults = VARIANT_DEFAULTS[variant]
	const effectiveLimit = limit ?? defaults.limit
	const effectiveCtaStyle = ctaStyle ?? defaults.ctaStyle
	const Renderer = RENDERERS[variant]

	return (
		<SectionCard data-sanity-id="PostListWidget" className="p-5 sm:p-6">
			{/* Header */}
			<div className="mb-5 flex items-center justify-between">
				<SectionTitle showDot={showDot}>{title}</SectionTitle>

				{viewAllHref && effectiveCtaStyle === 'link' && (
					<Link
						href={viewAllHref}
						className="hidden text-xs text-muted transition hover:text-ink sm:block"
					>
						{viewAllLabel}
					</Link>
				)}
			</div>

			{/* List */}
			<Renderer posts={posts} limit={effectiveLimit} />

			{/* Footer CTA */}
			{viewAllHref && effectiveCtaStyle === 'link' && (
				<Link
					href={viewAllHref}
					className="mt-6 flex w-full items-center justify-between border-t border-line-soft pt-4 text-xs font-semibold text-muted transition hover:text-ink"
				>
					{viewAllLabel}
					<ChevronIcon className="size-3.5" />
				</Link>
			)}

			{viewAllHref && effectiveCtaStyle === 'outline' && (
				<Link
					href={viewAllHref}
					className="mt-6 block w-full rounded-lg bg-ink/5 py-2 text-center text-xs font-semibold transition hover:bg-ink/10"
				>
					{viewAllLabel}
				</Link>
			)}

			{viewAllHref && effectiveCtaStyle === 'brand' && (
				<div className="mt-6 grid place-items-center">
					<Link
						href={viewAllHref}
						className="inline-flex h-10 items-center rounded bg-brand-deep px-6 text-sm font-semibold text-white transition hover:opacity-90"
					>
						{viewAllLabel}
					</Link>
				</div>
			)}
		</SectionCard>
	)
}
