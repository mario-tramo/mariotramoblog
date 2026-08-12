import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Img } from '@/ui/primitives/Img'
import TimeAgo from '@/ui/primitives/TimeAgo'
import resolveUrl from '@/lib/resolveUrl'
import { getCategoryColor } from '@/lib/categoryColors'
import { cn } from '@/lib/utils'
import type { SectionTheme } from '@/lib/sectionBackgrounds'
import type { Home4Post } from './data'

export type MatrixItem = {
	theme: SectionTheme
	kicker: string
	title: string
	href: string
	posts: Home4Post[]
}

export default function SportMatrix({ items }: { items: MatrixItem[] }) {
	return (
		<section className="section" data-module>
			<div className="mb-8 flex items-end justify-between gap-4">
				<div>
					<span className="text-[11px] font-black uppercase tracking-[0.22em] text-accent">
						Anche su TRM Sport
					</span>
<h2 className="mt-2 font-heading text-4xl uppercase leading-[0.9] tracking-tight text-ink sm:text-5xl md:text-6xl">
					I mondi paralleli
				</h2>
				</div>
				<p className="hidden max-w-sm text-sm leading-relaxed text-muted lg:block">
					Dai box alla terra rossa, dal parquet al circuito: ogni sport ha la
					sua voce, qui su TRM Sport.
				</p>
			</div>

			<div className="grid gap-5 md:grid-cols-2">
				{items.map(({ theme, kicker, title, href, posts }) => {
					const [lead, ...rest] = posts
					return (
						<article
							key={href}
							className={cn('relative overflow-hidden rounded-xl p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-7', theme.bg)}
						>
							<div className="flex items-start justify-between gap-3">
								<div>
									<span
										className="text-[10px] font-black uppercase tracking-[0.22em]"
										style={{ color: theme.accent }}
									>
										{kicker}
									</span>
									<h3 className="mt-1 font-heading text-[28px] uppercase leading-[0.95] tracking-tight text-white sm:text-4xl">
										{title}
									</h3>
									<div
										className="mt-2 h-[3px] w-10 rounded-full"
										style={{ backgroundColor: theme.accent }}
									/>
								</div>
								<Link
									href={href}
									className="group mt-1 flex shrink-0 items-center gap-1 text-[11px] font-bold uppercase tracking-wider transition hover:opacity-85"
									style={{ color: theme.accent }}
								>
									Tutto
									<ArrowRight
										className="size-3.5 transition-transform group-hover:translate-x-1"
										aria-hidden
									/>
								</Link>
							</div>

							{lead && (
								<Link
									href={resolveUrl(lead, { base: false })}
									className="group mt-5 flex items-center gap-4 rounded-lg border border-white/10 bg-black/25 p-3 transition-colors hover:border-white/25"
								>
									{lead.metadata?.image?.asset && (
										<div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-md bg-white/5">
											<Img
												image={lead.metadata.image}
												width={192}
												alt={lead.metadata.image.alt || lead.title}
												className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
											/>
										</div>
									)}
									<div className="min-w-0">
										<span
											className="mb-1 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
											style={{ backgroundColor: getCategoryColor(lead.categories?.[0]) }}
										>
											{lead.categories?.[0]?.title}
										</span>
										<h4 className="line-clamp-2 text-[14px] font-bold leading-snug text-white">
											{lead.title}
										</h4>
										<span className="mt-1 block text-[10.5px] text-white/50">
											{lead.publishDate && <TimeAgo dateStr={lead.publishDate} />}
										</span>
									</div>
								</Link>
							)}

							{rest.length > 0 && (
								<ul className="mt-3 space-y-1">
									{rest.slice(0, 2).map((post) => (
										<li key={post._id}>
											<Link
												href={resolveUrl(post, { base: false })}
												className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/5"
											>
												<span className="size-0.5 rounded-full bg-white/30" aria-hidden />
												<span className="min-w-0 flex-1 line-clamp-1 text-[12.5px] font-medium text-white/80 transition-colors group-hover:text-white">
													{post.title}
												</span>
												<span className="shrink-0 text-[10px] text-white/40">
													{post.readTime > 0 ? `${post.readTime} min` : ''}
												</span>
											</Link>
										</li>
									))}
								</ul>
							)}
						</article>
					)
				})}
			</div>
		</section>
	)
}