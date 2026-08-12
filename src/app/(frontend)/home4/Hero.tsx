import Link from 'next/link'
import { ArrowRight, Flame, Timer } from 'lucide-react'
import { Img } from '@/ui/primitives/Img'
import TimeAgo from '@/ui/primitives/TimeAgo'
import resolveUrl from '@/lib/resolveUrl'
import { getCategoryColor } from '@/lib/categoryColors'
import { getInitials } from '@/lib/utils'
import type { Home4Post } from './data'

export default function Hero({
	hero,
	latest,
}: {
	hero: Home4Post
	latest: Home4Post[]
}) {
	const cat = hero.categories?.[0]
	const author = hero.authors?.[0]
	const href = resolveUrl(hero, { base: false })
	const rail = latest.filter((p) => p._id !== hero._id).slice(0, 5)

	return (
		<section className="mx-auto max-w-screen-2xl px-4 pt-6 sm:px-6 md:pt-9">
			<div className="grid gap-5 lg:grid-cols-[1.65fr_1fr]">
				{/* ─── Cover article ─────────────────────────────────────── */}
				<Link
					href={href}
					className="group relative isolate block overflow-hidden rounded-xl border border-line bg-surface focus-visible:outline-none"
				>
					<div className="relative aspect-[7/6] w-full sm:aspect-[16/9] lg:aspect-auto lg:h-full lg:min-h-[560px]">
						{hero.metadata?.image?.asset ? (
							<Img
								image={hero.metadata.image}
								width={1400}
								alt={hero.metadata.image.alt || hero.title}
								className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
							/>
						) : (
							<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,174,239,0.18),transparent_55%),linear-gradient(160deg,#0C1F30,#08142296)]" />
						)}

						{/* Cinematic overlays */}
						<div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 via-45% to-transparent" />
						<div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />
						<div className="absolute inset-x-0 top-0 h-px bg-brand/40" />

						{/* Kicker */}
						<div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 sm:p-7">
							{cat ? (
								<span
									className="inline-flex items-center gap-1.5 rounded-[4px] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white"
									style={{ backgroundColor: getCategoryColor(cat) }}
								>
									{cat.title}
								</span>
							) : null}
							<span className="mt-0.5 flex items-center gap-1.5 rounded-[4px] bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80 backdrop-blur-sm">
								In evidenza
							</span>
						</div>

						{/* Content */}
						<div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-9">
							<h1 className="max-w-3xl text-balance font-heading text-[1.55rem] uppercase leading-[1.02] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:text-4xl sm:leading-[0.95] md:text-6xl lg:text-[4.4rem]">
								{hero.title}
							</h1>

							{hero.metadata?.description && (
								<p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-relaxed text-white/75 max-sm:text-[12.5px] sm:text-[15px]">
									{hero.metadata.description}
								</p>
							)}

							<div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-white/70 max-sm:text-[11px]">
								{author && (
									<span className="flex items-center gap-2">
										<span className="grid size-7 place-items-center rounded-full bg-white/15 text-[10px] font-bold text-white backdrop-blur-sm">
											{getInitials(author.name)}
										</span>
										{author.name}
									</span>
								)}
								{hero.publishDate && (
									<span className="flex items-center gap-1.5">
										<Timer className="size-3.5" aria-hidden />
										<TimeAgo dateStr={hero.publishDate} />
									</span>
								)}
								{hero.readTime > 0 && (
									<span>{hero.readTime} min di lettura</span>
								)}
							</div>

							<span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-deep px-4 py-2 text-[11px] font-black uppercase tracking-wider text-white transition hover:bg-brand sm:mt-5">
								Leggi l&apos;articolo
								<ArrowRight
									className="size-3.5 transition-transform group-hover:translate-x-1"
									aria-hidden
								/>
							</span>
						</div>
					</div>
				</Link>

				{/* ─── Ultime notizie rail ─────────────────────────────── */}
				<aside className="flex flex-col rounded-xl border border-line bg-surface/80 p-4 sm:p-5">
					<div className="mb-4 flex items-center justify-between border-b border-line-soft pb-3">
						<h2 className="font-heading text-xl uppercase tracking-wide text-ink">
							Ultime notizie
						</h2>
						<Link
							href="/blog"
							className="group flex items-center gap-1 text-[11px] font-semibold text-accent transition hover:text-white"
						>
							Vedi tutte
							<ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
						</Link>
					</div>

					<ul className="flex flex-1 flex-col gap-1">
						{rail.map((post, i) => {
							const pCat = post.categories?.[0]
							return (
								<li key={post._id}>
									<Link
										href={resolveUrl(post, { base: false })}
										className="group flex gap-3 rounded-lg p-2 transition-colors hover:bg-surface-soft"
									>
										<span className="mt-0.5 shrink-0 text-[11px] font-black tabular-nums text-white/20">
											{String(i + 1).padStart(2, '0')}
										</span>
										<span className="min-w-0 flex-1">
											<span className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
												{post.title}
											</span>
											<span className="mt-1 flex items-center gap-2 text-[10.5px] text-meta">
												{pCat && (
													<span
														className="rounded px-1 py-[1px] text-[8.5px] font-bold uppercase tracking-wider text-white"
														style={{ backgroundColor: getCategoryColor(pCat) }}
													>
														{pCat.title}
													</span>
												)}
												{post.publishDate && (
													<TimeAgo dateStr={post.publishDate} />
												)}
											</span>
										</span>
									</Link>
								</li>
							)
						})}
					</ul>

					<div className="mt-3 flex items-center gap-2 border-t border-line-soft pt-3 text-[10.5px] uppercase tracking-wider text-muted">
						<Flame className="size-3.5 text-accent" aria-hidden />
						Le notizie più calde del giorno
					</div>
				</aside>
			</div>
		</section>
	)
}