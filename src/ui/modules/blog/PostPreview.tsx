import { Img } from '@/ui/Img'
import Link from 'next/link'
import resolveUrl from '@/lib/resolveUrl'
import Authors from './Authors'
import Date from '@/ui/Date'
import Categories from './Categories'
import { cn } from '@/lib/utils'

export default function PostPreview({
	post,
	skeleton,
}: {
	post?: Sanity.BlogPost
	skeleton?: boolean
}) {
	if (!post && !skeleton) return null

	return (
		<div className="group relative isolate flex h-full flex-col space-y-2 rounded-2xl border border-border bg-surface p-3 transition hover:border-brand/30">
			<figure className="relative aspect-video overflow-hidden rounded-lg bg-ink/3">
				<Img
					className="aspect-video w-full object-cover transition-all group-hover:scale-105 group-hover:brightness-110"
					image={post?.metadata.image}
					width={700}
					alt={post?.metadata.title}
				/>

				{post?.featured && (
					<span className="absolute top-2 right-2 rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-bold text-brand-foreground shadow-md">
						In evidenza
					</span>
				)}
			</figure>

			{post?.categories?.[0] && (
				<p className="text-[10px] font-bold tracking-widest text-brand">
					{post.categories[0].title.toUpperCase()}
				</p>
			)}

			<div className={cn('text-base font-bold leading-snug', skeleton && 'skeleton-2')}>
				<Link
					className="group-hover:underline"
					href={resolveUrl(post, { base: false })}
				>
					<span className="absolute inset-0" />
					{post?.metadata.title}
				</Link>
			</div>

			<div className="grow">
				<p className="line-clamp-2 text-sm text-muted empty:h-[2lh]">
					{post?.metadata.description}
				</p>
			</div>

			{(post?.authors?.length || skeleton) && (
				<Authors
					className="flex flex-wrap items-center gap-4 text-sm"
					authors={post?.authors}
					skeleton={skeleton}
				/>
			)}

			<div className="flex flex-wrap gap-x-4 border-t border-border pt-2 text-sm empty:skeleton">
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
