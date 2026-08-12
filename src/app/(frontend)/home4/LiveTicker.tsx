'use client'

import Link from 'next/link'
import resolveUrl from '@/lib/resolveUrl'
import { getCategoryColor } from '@/lib/categoryColors'
import type { Home4Post } from './data'

export default function LiveTicker({ posts }: { posts: Home4Post[] }) {
	if (!posts.length) return null

	return (
		<div className="group relative flex items-stretch overflow-hidden border-b border-line-soft bg-[#071120]">
			<div className="relative z-10 flex shrink-0 items-center gap-2 bg-brand px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white sm:px-5 sm:text-[11px]">
				<span className="inline-block size-1.5 animate-pulse rounded-full bg-white" />
				Live
			</div>

			<div className="animate-ticker relative flex flex-1 items-center overflow-hidden">
				<div className="flex min-w-max items-center group-hover:[animation-play-state:paused]">
					{posts.concat(posts).map((post, i) => {
						const cat = post.categories?.[0]
						return (
							<Link
								key={`${post._id}-${i}`}
								href={resolveUrl(post, { base: false })}
								className="flex items-center gap-1.5 whitespace-nowrap px-3.5 py-[7px] text-[11.5px] text-white/70 transition hover:text-white sm:gap-2 sm:px-5 sm:py-2 sm:text-[12.5px]"
							>
								{cat && (
									<span
										className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
										style={{ backgroundColor: getCategoryColor(cat) }}
									>
										{cat.title}
									</span>
								)}
								<span className="font-medium">{post.title}</span>
								<span className="text-white/15" aria-hidden>
									⁃
								</span>
							</Link>
						)
					})}
				</div>
			</div>
		</div>
	)
}