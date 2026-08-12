import { Img } from '@/ui/primitives/Img'
import TimeAgo from '@/ui/primitives/TimeAgo'
import Link from 'next/link'
import resolveUrl from '@/lib/resolveUrl'
import { cn } from '@/lib/utils'
import { getCategoryColor } from '@/lib/categoryColors'

export default function PostPreview({
	post,
	skeleton,
	cardSize = 'standard',
	sizes,
}: {
	post?: Sanity.BlogPost
	skeleton?: boolean
	cardSize?: 'standard' | 'large'
	sizes?: string
}) {
	if (!post && !skeleton) return null

	if (cardSize === 'large') {
		return (
			<div className="post-preview group relative isolate flex h-full flex-col overflow-hidden rounded-md">
				<figure className="relative aspect-[16/9] overflow-hidden">
					<Img
						className="size-full object-cover transition-transform duration-[180ms] ease-out group-hover:scale-[1.02]"
					image={post?.metadata?.image}
					sizes={sizes || '(max-width: 639px) 100vw, (max-width: 1023px) 65vw, 800px'}
					quality={88}
					alt={post?.metadata?.image?.alt || post?.title || ''}
				/>

				{/* Cinematic gradient overlay */}
					<div className="absolute inset-0 bg-gradient-to-b from-transparent from-30% to-black/80" />

					{/* Content overlaid on image */}
					<div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 text-center sm:items-start sm:text-left p-5 sm:p-6">
						{post?.categories?.[0] && (
							<span
								className="w-fit rounded-[3px] px-1.5 py-1 text-[9px] font-bold uppercase tracking-[0.2px] text-white"
								style={{ backgroundColor: getCategoryColor(post.categories[0]) }}
							>
								{post.categories[0].title}
							</span>
						)}

						<h3 className={cn('font-body text-base font-bold leading-[1.25] tracking-[-0.2px] text-white sm:text-[20px]', skeleton && 'skeleton-2')}>
							<Link
								className="group-hover:underline"
								href={resolveUrl(post, { base: false })}
							>
								<span className="absolute inset-0" />
								{post?.title}
							</Link>
						</h3>

						{post?.metadata?.description && (
							<p className="line-clamp-1 text-sm text-white/60">
								{post?.metadata?.description}
							</p>
						)}
					</div>
				</figure>
			</div>
		)
	}

	return (
		<article
			data-sanity-id="PostPreview"
			className="post-preview group relative isolate flex h-full flex-col overflow-hidden rounded-md border border-line bg-surface shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-all duration-[180ms] ease-out hover:-translate-y-[3px] hover:border-[rgba(0,174,239,0.40)] hover:bg-surface-soft"
		>
			<figure className="relative aspect-[16/9] overflow-hidden bg-ink/3">
				<Img
					className="size-full object-cover transition-transform duration-[180ms] ease-out group-hover:scale-[1.02]"
					image={post?.metadata?.image}
					sizes={sizes || '(max-width: 639px) 85vw, (max-width: 1023px) 33vw, 400px'}
					quality={88}
					alt={post?.metadata?.image?.alt || post?.title || ''}
				/>

				{/* cinematic overlay */}
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent from-40% to-black/75" />

				{post?.categories?.[0] && (
					<span
						className="absolute top-2 right-2 rounded-[3px] px-1.5 py-1 text-[9px] font-bold uppercase tracking-[0.2px] text-white"
						style={{ backgroundColor: getCategoryColor(post.categories[0]) }}
					>
						{post.categories[0].title}
					</span>
				)}
			</figure>

			<div className="flex flex-1 flex-col p-3.5">
				<h3 className={cn('font-body line-clamp-3 text-[15px] font-bold leading-[1.3] tracking-[-0.2px] text-ink', skeleton && 'skeleton-2')}>
					<Link
						className="group-hover:underline"
						href={resolveUrl(post, { base: false })}
					>
						<span className="absolute inset-0" />
						{post?.title}
					</Link>
				</h3>

				<p className="mt-2.5 line-clamp-2 text-[13px] leading-[1.45] text-[#8D9EAC] empty:hidden">
					{post?.metadata?.description}
				</p>

				<div className="mt-auto flex items-center gap-1.5 pt-2.5 text-[11px] text-meta">
					{post?.publishDate && (
						<span>
							<TimeAgo dateStr={post.publishDate} />
						</span>
					)}
					{post?.publishDate && post?.authors?.[0] && <span>·</span>}
					{post?.authors?.[0] && <span>{post.authors[0].name}</span>}
				</div>
			</div>
		</article>
	)
}
