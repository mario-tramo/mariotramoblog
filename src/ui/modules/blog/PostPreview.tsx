import { Img } from '@/ui/primitives/Img'
import Link from 'next/link'
import resolveUrl from '@/lib/resolveUrl'
import { cn } from '@/lib/utils'
import { getCategoryColor } from '@/lib/categoryColors'

function timeAgo(dateStr: string) {
	const now = new globalThis.Date()
	const date = new globalThis.Date(dateStr + 'T00:00:00')
	const diffMs = now.getTime() - date.getTime()
	const diffH = Math.floor(diffMs / (1000 * 60 * 60))
	const diffD = Math.floor(diffH / 24)

	if (diffH < 1) return 'Ora'
	if (diffH < 24) return `${diffH}h fa`
	if (diffD < 7) return `${diffD}g fa`
	return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
}

export default function PostPreview({
	post,
	skeleton,
	cardSize = 'standard',
}: {
	post?: Sanity.BlogPost
	skeleton?: boolean
	cardSize?: 'standard' | 'large'
}) {
	if (!post && !skeleton) return null

	if (cardSize === 'large') {
		return (
			<div className="group relative isolate flex h-full flex-col overflow-hidden rounded-xl">
				<figure className="relative aspect-[16/9] overflow-hidden">
					<Img
						className="size-full object-cover transition-transform duration-600 group-hover:scale-105"
						image={post?.metadata.image}
						width={800}
						alt={post?.title}
					/>

					{/* Cinematic gradient overlay */}
					<div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 via-40% to-transparent" />

					{/* Content overlaid on image */}
					<div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 sm:p-6">
						{post?.categories?.[0] && (
							<span
								className="w-fit rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white"
								style={{ backgroundColor: getCategoryColor(post.categories[0]) }}
							>
								{post.categories[0].title}
							</span>
						)}

						<h3 className={cn('text-base font-bold leading-snug text-white sm:text-lg', skeleton && 'skeleton-2')}>
							<Link
								className="group-hover:underline"
								href={resolveUrl(post, { base: false })}
							>
								<span className="absolute inset-0" />
								{post?.title}
							</Link>
						</h3>

						{post?.metadata.description && (
							<p className="line-clamp-1 text-sm text-white/60">
								{post.metadata.description}
							</p>
						)}
					</div>
				</figure>
			</div>
		)
	}

	return (
		<article
			className="group relative isolate flex h-full flex-col overflow-hidden rounded-xl border border-line-soft bg-surface transition-all duration-400"
		>
			<figure className="relative aspect-[16/9] overflow-hidden bg-ink/3">
				<Img
					className="size-full object-cover transition-transform duration-600 group-hover:scale-105"
					image={post?.metadata.image}
					width={700}
					alt={post?.title}
				/>

				{post?.featured && (
					<span className="absolute top-2.5 right-2.5 rounded bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
						In evidenza
					</span>
				)}
			</figure>

			<div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
				{post?.categories?.[0] && (
					<p
						className="text-[10px] font-bold uppercase tracking-[0.15em]"
						style={{ color: getCategoryColor(post.categories[0]) }}
					>
						{post.categories[0].title}
					</p>
				)}

				<h3 className={cn('text-sm font-semibold leading-snug', skeleton && 'skeleton-2')}>
					<Link
						className="group-hover:underline"
						href={resolveUrl(post, { base: false })}
					>
						<span className="absolute inset-0" />
						{post?.title}
					</Link>
				</h3>

				<p className="line-clamp-2 text-[13px] leading-relaxed text-muted empty:hidden">
					{post?.metadata.description}
				</p>

				<div className="mt-auto flex items-center justify-between border-t border-line-soft pt-3 text-[11px] text-muted">
					<span>{post?.publishDate && timeAgo(post.publishDate)}</span>
					{post?.authors?.[0] && (
						<span className="font-medium text-ink/60">{post.authors[0].name}</span>
					)}
				</div>
			</div>
		</article>
	)
}
