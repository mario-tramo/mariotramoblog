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
			<div className="group relative isolate flex h-full flex-col overflow-hidden rounded-xl bg-surface">
				<figure className="relative aspect-[16/9] overflow-hidden">
					<Img
						className="size-full object-cover transition-transform duration-500 group-hover:scale-103"
						image={post?.metadata.image}
						width={800}
						alt={post?.title}
					/>

					{/* Gradient overlay */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

					{/* Content overlaid on image */}
					<div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4">
						{post?.categories?.[0] && (
							<span
								className="w-fit rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
								style={{ backgroundColor: getCategoryColor(post.categories[0]) }}
							>
								{post.categories[0].title}
							</span>
						)}

						<div className={cn('text-base font-bold leading-snug text-white sm:text-lg', skeleton && 'skeleton-2')}>
							<Link
								className="group-hover:underline"
								href={resolveUrl(post, { base: false })}
							>
								<span className="absolute inset-0" />
								{post?.title}
							</Link>
						</div>
					</div>
				</figure>
			</div>
		)
	}

	return (
		<article
			className="group relative isolate flex h-full flex-col overflow-hidden rounded-xl border border-ink/5 bg-surface transition"
		>
			<figure className="relative aspect-[16/9] overflow-hidden bg-ink/3">
				<Img
					className="size-full object-cover transition-transform duration-500 group-hover:scale-103"
					image={post?.metadata.image}
					width={700}
					alt={post?.title}
				/>

				{post?.featured && (
					<span className="absolute top-2 right-2 rounded bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
						In evidenza
					</span>
				)}
			</figure>

			<div className="flex flex-1 flex-col gap-2 p-4">
				{post?.categories?.[0] && (
					<p
						className="text-[10px] font-bold uppercase tracking-widest"
						style={{ color: getCategoryColor(post.categories[0]) }}
					>
						{post.categories[0].title}
					</p>
				)}

				<h3 className={cn('text-base font-bold leading-snug', skeleton && 'skeleton-2')}>
					<Link
						className="group-hover:underline"
						href={resolveUrl(post, { base: false })}
					>
						<span className="absolute inset-0" />
						{post?.title}
					</Link>
				</h3>

				<p className="line-clamp-2 text-sm leading-relaxed text-muted empty:hidden">
					{post?.metadata.description}
				</p>

				<div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted">
					<span>{post?.publishDate && timeAgo(post.publishDate)}</span>
					{post?.authors?.[0] && (
						<span className="font-medium text-ink/70">{post.authors[0].name}</span>
					)}
				</div>
			</div>
		</article>
	)
}
