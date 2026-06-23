'use client'

import { Img } from '@/ui/primitives/Img'
import Link from 'next/link'
import resolveUrl from '@/lib/resolveUrl'
import { Play } from 'lucide-react'

export default function PostPreviewBytes({
	post,
	skeleton,
}: {
	post?: Sanity.BlogPost
	skeleton?: boolean
}) {
	if (!post && !skeleton) return null

	if (skeleton) {
		return (
			<div
				data-sanity-id="PostPreviewBytes"
				className="w-29 shrink-0 animate-pulse rounded-lg bg-surface-light lg:w-49"
				style={{ aspectRatio: '9 / 16' }}
			/>
		)
	}

	return (
		<Link
			data-sanity-id="PostPreviewBytes"
			href={resolveUrl(post, { base: false })}
			className="group/byte relative block w-29 shrink-0 overflow-hidden rounded-lg lg:w-49"
			style={{ aspectRatio: '9 / 16' }}
		>
			<figure className="absolute inset-0">
				<Img
					className="size-full object-cover transition-transform duration-300 group-hover/byte:scale-108"
					image={post?.metadata?.image}
					width={400}
					alt={post?.metadata?.image?.alt || post?.title || ''}
				/>
			</figure>

			<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

			<div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
				<div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 shadow-lg transition-transform duration-300 group-hover/byte:scale-110 lg:h-12 lg:w-12">
					<Play size={14} fill="white" className="ml-0.5 text-white lg:h-6 lg:w-6" />
				</div>
			</div>

			<div className="absolute bottom-0 left-0 right-0 z-10 p-3 lg:p-4">
				{post?.categories?.[0] && (
					<p className="mb-1 text-[10px] font-medium leading-none text-blue-400 lg:mb-2 lg:text-sm">
						{post.categories[0].title}
					</p>
				)}
				<h3 className="text-xs font-medium leading-snug text-white line-clamp-3 lg:text-lg lg:font-bold">
					{post?.title}
				</h3>
			</div>
		</Link>
	)
}
