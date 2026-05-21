import Link from 'next/link'
import { Img } from '@/ui/primitives/Img'
import SectionCard from '@/ui/primitives/SectionCard'
import SectionTitle from '@/ui/primitives/SectionTitle'
import ChevronIcon from '@/ui/icons/ChevronIcon'
import resolveUrl from '@/lib/resolveUrl'
import ReadTime from './ReadTime'

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

function timeAgo(dateStr: string) {
	const now = new Date()
	const date = new Date(dateStr + 'T00:00:00')
	const diffMs = now.getTime() - date.getTime()
	const diffH = Math.floor(diffMs / (1000 * 60 * 60))
	const diffD = Math.floor(diffH / 24)

	if (diffH < 1) return 'Ora'
	if (diffH < 24) return `${diffH}h fa`
	if (diffD < 7) return `${diffD}g fa`
	return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
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
							<p className="mb-1 text-[11px] font-medium text-brand">
								{timeAgo(post.publishDate)}
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
						<span className="grid size-7 flex-shrink-0 place-items-center rounded-md bg-brand text-xs font-bold text-brand-foreground">
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
						<p className="text-[10px] font-bold tracking-widest text-brand">
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
					<figure className="size-16 flex-shrink-0 overflow-hidden rounded-lg">
						<Img
							className="size-full object-cover"
							image={post.metadata.image}
							width={128}
							alt={post.title}
						/>
					</figure>
					<div>
						<h3 className="text-sm font-semibold leading-snug">
							<Link href={resolveUrl(post, { base: false })}>
								<span className="absolute inset-0" />
								{post.title}
							</Link>
						</h3>
						<ReadTime value={post.readTime} className="text-[11px] text-muted" />
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
		<SectionCard className="p-5 sm:p-6">
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
					className="mt-6 flex w-full items-center justify-between border-t border-ink/5 pt-4 text-xs font-semibold text-muted transition hover:text-ink"
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
						className="inline-flex h-10 items-center rounded bg-brand px-6 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
					>
						{viewAllLabel}
					</Link>
				</div>
			)}
		</SectionCard>
	)
}
