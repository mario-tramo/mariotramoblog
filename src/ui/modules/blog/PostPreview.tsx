import { Img } from '@/ui/primitives/Img'
import Link from 'next/link'
import resolveUrl from '@/lib/resolveUrl'
import Authors from './Authors'
import Date from '@/ui/primitives/Date'
import Categories from './Categories'
import { cn } from '@/lib/utils'

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
			<div className="group relative isolate flex h-full flex-col overflow-hidden rounded-2xl bg-surface">
				{/* Large image with overlay content */}
				<figure className="relative aspect-[4/3] overflow-hidden">
					<Img
						className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
						image={post?.metadata.image}
						width={800}
						alt={post?.title}
					/>

					{post?.featured && (
						<span className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
							In evidenza
						</span>
					)}

					{/* Gradient overlay */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

					{/* Content overlaid on image */}
					<div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5">
						{post?.categories?.[0] && (
							<span className="w-fit rounded bg-brand px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-foreground">
								{post.categories[0].title}
							</span>
						)}

						<div className={cn('text-lg font-bold leading-snug text-white', skeleton && 'skeleton-2')}>
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
		<div className="group relative isolate flex h-full flex-col gap-2 rounded-2xl bg-surface p-4 transition">
			<figure className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-ink/3">
				<Img
					className="aspect-video w-full object-cover transition-all group-hover:scale-105 group-hover:brightness-110"
					image={post?.metadata.image}
					width={700}
					alt={post?.title}
				/>

				{post?.featured && (
					<span className="absolute top-2 right-2 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
						In evidenza
					</span>
				)}
			</figure>

			{post?.categories?.[0] && (
				<p className="text-[10px] font-bold tracking-widest text-brand">
					{post.categories[0].title.toUpperCase()}
				</p>
			)}

			<div className={cn('text-lg font-bold leading-snug', skeleton && 'skeleton-2')}>
				<Link
					className="group-hover:underline"
					href={resolveUrl(post, { base: false })}
				>
					<span className="absolute inset-0" />
					{post?.title}
				</Link>
			</div>

			<div className="grow">
				<p className="line-clamp-2 text-sm text-muted empty:h-[2lh]">
					{post?.metadata.description}
				</p>
			</div>

			<div className="mt-auto flex flex-wrap items-center text-sm">
				{post?.authors?.length ? (
					<Authors
						className="flex flex-wrap items-center gap-2"
						authors={post.authors}
					/>
				) : skeleton ? (
					<Authors
						className="flex flex-wrap items-center gap-2"
						skeleton
					/>
				) : (
					<div className="flex items-center gap-2">
						<span className="bg-accent/3 grid aspect-square w-[1.7em] shrink-0 place-content-center overflow-hidden rounded-full text-[10px] font-bold text-accent/40">
							TM
						</span>
						<span>Redazione</span>
					</div>
				)}
			</div>

			<div className="space-y-2 border-t border-ink/5 pt-2 text-sm empty:skeleton">
				<Date value={post?.publishDate} />
				<Categories
					className="relative z-10 flex flex-wrap gap-x-2"
					categories={post?.categories}
					linked
				/>
			</div>
		</div>
	)
}
