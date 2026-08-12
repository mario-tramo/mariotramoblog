import Link from 'next/link'
import { ArrowRight, TrendingUp } from 'lucide-react'
import { Img } from '@/ui/primitives/Img'
import PostPreview from '@/ui/modules/blog/PostPreview'
import TimeAgo from '@/ui/primitives/TimeAgo'
import resolveUrl from '@/lib/resolveUrl'
import { getCategoryColor } from '@/lib/categoryColors'
import type { Home4Post } from './data'

export default function MostRead({
	trending,
	picks,
}: {
	trending: Home4Post[]
	picks: Home4Post[]
}) {
	return (
		<section className="section" data-module>
			<div className="mb-8 flex flex-wrap items-end justify-between gap-4">
				<div>
					<span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-accent">
						<TrendingUp className="size-3.5" aria-hidden />
						Classifiche di lettura
					</span>
					<h2 className="mt-2 font-heading text-4xl uppercase leading-[0.9] tracking-tight text-ink sm:text-5xl md:text-6xl">
						Le più lette
					</h2>
				</div>
				<div className="h-[3px] w-24 rounded-full bg-gradient-to-r from-accent to-transparent" />
			</div>

			<div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
				{/* Numbered ranking */}
				<ol className="space-y-5">
					{trending.map((post, i) => {
						const cat = post.categories?.[0]
						return (
							<li key={post._id}>
								<Link
									href={resolveUrl(post, { base: false })}
									className="group flex items-stretch gap-3 sm:gap-4"
								>
									<span className="font-heading text-4xl leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(242,246,248,0.22)] sm:text-5xl">
										{String(i + 1).padStart(2, '0')}
									</span>
									<div className="flex flex-1 items-center gap-3 border-b border-line-soft pb-5 sm:gap-4">
										{post.metadata?.image?.asset && (
											<div className="relative aspect-[4/3] w-[72px] shrink-0 overflow-hidden rounded-md bg-surface-soft sm:w-24">
												<Img
													image={post.metadata.image}
													width={160}
													alt={post.metadata.image.alt || post.title}
													className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
												/>
											</div>
										)}
										<div className="min-w-0 flex-1">
											{cat && (
												<span
													className="mb-1 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
													style={{ backgroundColor: getCategoryColor(cat) }}
												>
													{cat.title}
												</span>
											)}
											<h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-ink transition-colors group-hover:text-accent">
												{post.title}
											</h3>
											<span className="mt-1 block text-[11px] text-meta">
												{post.readTime > 0 && `${post.readTime} min · `}
												{post.publishDate && <TimeAgo dateStr={post.publishDate} />}
											</span>
										</div>
									</div>
								</Link>
							</li>
						)
					})}
				</ol>

				{/* Editorial picks */}
				<div>
					<div className="mb-4 flex items-center justify-between">
						<h3 className="text-[11px] font-black uppercase tracking-[0.22em] text-muted">
							Scelte dalla redazione
						</h3>
						<Link
							href="/blog"
							className="group flex items-center gap-1 text-[11px] font-semibold text-accent transition hover:text-white"
						>
							Tutto il blog
							<ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
						</Link>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						{picks.map((post) => (
							<PostPreview key={post._id} post={post} />
						))}
					</div>
				</div>
			</div>
		</section>
	)
}