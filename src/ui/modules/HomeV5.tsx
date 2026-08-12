import Link from 'next/link'
import { Suspense } from 'react'
import { cn } from '@/lib/utils'
import { getPostsFeed } from '@/lib/getPostsFeed'
import CompactCarousel from '@/ui/modules/blog/CompactCarousel'
import FeaturedPostCard from '@/ui/modules/blog/FeaturedPostCard'
import PostListWidget from '@/ui/modules/blog/PostListWidget'
import PostPreview from '@/app/(frontend)/home6/PostPreview6'
import PostPreviewBytes from '@/ui/modules/blog/PostPreviewBytes'
import ScrollCarousel from '@/app/(frontend)/home6/ScrollCarousel6'
import BlogList from '@/app/(frontend)/home6/BlogList6'
import EditorialBanner from './EditorialBanner'
import Standings from './Standings'
import NewsletterSubscribe from '@/ui/features/newsletter'
import { getCategoryColor } from '@/lib/categoryColors'
import resolveUrl from '@/lib/resolveUrl'
import ChevronIcon from '@/ui/icons/ChevronIcon'
import TimeAgo from '@/ui/primitives/TimeAgo'
import { Img } from '@/ui/primitives/Img'

function SectionTag({
	num,
	title,
	accent,
	className,
}: {
	num: string
	title: string
	accent: string
	className?: string
}) {
	return (
		<div className={cn('flex flex-wrap items-end justify-between gap-x-4 gap-y-3', className)}>
			<div className="flex min-w-0 items-baseline gap-3">
				<span
					className="font-heading text-4xl leading-none tracking-tighter opacity-30 md:text-7xl"
					style={{ color: accent }}
				>
					{num}
				</span>
				<h2 className="font-heading text-2xl uppercase leading-none tracking-tight sm:text-3xl md:text-5xl">
					{title}
				</h2>
			</div>
			<span
				className="hidden h-1 w-16 shrink-0 rounded-full sm:block"
				style={{ backgroundColor: accent }}
			/>
		</div>
	)
}

function BandSkeleton() {
	return (
		<div className="flex items-center gap-6">
			<div className="hidden w-[200px] shrink-0 md:block">
				<div className="animate-pulse h-7 w-32 rounded bg-white/10" />
				<div className="animate-pulse mt-4 h-3 w-full max-w-[150px] rounded bg-white/10" />
				<div className="animate-pulse mt-2 h-3 w-24 rounded bg-white/10" />
			</div>
			<div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
				{[...Array(6)].map((_, i) => (
					<div key={i} className="animate-pulse aspect-[1.35/1] rounded-[5px] bg-white/10" />
				))}
			</div>
		</div>
	)
}

export default async function HomeV5() {
	// All feeds are independent: resolve them concurrently instead of
	// serially awaiting each one (hero/bento/bytes share the 'latest' query;
	// different limits produce distinct cache keys so they cannot dedupe).
	const [hero, bento, trending, bytes] = await Promise.all([
		getPostsFeed({ source: 'latest', limit: 5 }),
		getPostsFeed({ source: 'latest', limit: 5, filters: [] }),
		getPostsFeed({ source: 'trending', limit: 5 }),
		getPostsFeed({ source: 'latest', limit: 8 }),
	])
	const bentoLead = bento[0]
	const bentoThumbs = bento.slice(1, 5)
	const trendingLead = trending[0]
	const trendingList = trending.slice(0, 5)

	return (
		<div className="space-y-10 md:space-y-16">
			<h1 className="sr-only">
				TRM Sport — Analisi, Notizie e Fantacalcio in tempo reale
			</h1>

			{/* ── HERO: full-bleed cinematic carousel ─────────────── */}
			<section className="section !pt-4 !pb-2 md:!pb-4">
				<div className="overflow-hidden rounded-2xl">
					<CompactCarousel posts={hero} />
				</div>
			</section>

			{/* ── BENTO: lead feature + thumbs ────────────────────── */}
			<section className="section space-y-6 !py-2">
				<SectionTag num="01" title="Oggi" accent="#00AEEF" />
				<div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-6">
					{bentoLead ? (
						<FeaturedPostCard
							post={bentoLead}
							title="SCELTA DELLA REDAZIONE"
							readTimeLabel="min"
						/>
					) : null}
					<PostListWidget
						posts={bentoThumbs}
						variant="sidebar-thumbs"
						title="LE PIÙ RECENTI"
						showDot
						viewAllHref="/"
						viewAllLabel="Tutte le notizie"
					/>
				</div>
			</section>

			{/* ── RANKED TRENDING: numbered rail + featured ───────── */}
			{trendingLead && (
				<section className="section space-y-6 !py-2">
					<SectionTag num="02" title="In cima" accent="#E53935" />
					<div className="grid gap-4 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-6">
						{trendingLead && (
							<div className="group relative aspect-[16/9] overflow-hidden rounded-xl">
								<Img
									className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
									image={trendingLead.metadata.image}
									sizes="(max-width: 1023px) 100vw, 50vw"
									quality={90}
									alt={trendingLead.title}
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
								<div className="absolute inset-x-0 bottom-0 space-y-1.5 p-5">
									{trendingLead.categories?.[0] && (
										<span
											className="inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
											style={{ backgroundColor: getCategoryColor(trendingLead.categories[0]) }}
										>
											{trendingLead.categories[0].title}
										</span>
									)}
									<h3 className="line-clamp-2 text-xl font-bold leading-tight text-white sm:text-2xl">
										<Link href={resolveUrl(trendingLead, { base: false })}>
											<span className="absolute inset-0" />
											{trendingLead.title}
										</Link>
									</h3>
								</div>
							</div>
						)}
						<div className="space-y-1">
							{trendingList.map((post, i) => (
								<Link
									key={post._id}
									href={resolveUrl(post, { base: false })}
									className="group flex items-center gap-3 rounded-md border-b border-line-soft py-2 transition last:border-0 sm:gap-4"
								>
									<span className="w-8 shrink-0 text-center font-heading text-3xl leading-none text-ink/25 transition group-hover:text-brand sm:w-12 sm:text-5xl">
										{i + 1}
									</span>
									<div className="min-w-0">
										<h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:underline">
											{post.title}
										</h3>
										<p className="mt-0.5 text-[11px] text-meta">
											<TimeAgo dateStr={post.publishDate} />
										</p>
									</div>
								</Link>
							))}
						</div>
					</div>
				</section>
			)}

			{/* ── BRIEFS: vertical short-form reel ─────────────── */}
			{bytes.length > 0 && (
				<section className="space-y-6 !py-2 overflow-hidden">
					<div className="section">
						<SectionTag num="03" title="Racconti brevi" accent="#35B86B" />
					</div>
					<div className="px-4 sm:px-6 lg:px-8">
						<ScrollCarousel>
							<ul className="carousel max-xl:full-bleed gap-3 pb-2 sm:gap-4 [--size:190px] sm:[--size:200px] lg:[--size:220px]">
								{bytes.map((post) => (
									<li key={post._id} className="[&_a]:w-[--size]">
										<PostPreviewBytes post={post} sizes="(max-width: 639px) 190px, 220px" />
									</li>
								))}
							</ul>
						</ScrollCarousel>
					</div>
				</section>
			)}

			{/* ── PROUD ESCAPADE: weekly opinion/analysis highlight ── */}
			{bytes[0] ? (
				<section className="section !py-2">
					<SectionTag num="04" title="Angolo analisi" accent="#A855F7" />
					<EditorialBanner
						preset="analisi-violet"
						category={bytes[0].categories?.[0]?.title}
						title={bytes[0].title}
						subtitle={bytes[0].metadata?.description}
						author={bytes[0].authors?.[0]?.name}
						ctaText="LEGGI"
						ctaLink={{ _type: 'link', label: 'Leggi', type: 'internal', internal: bytes[0] }}
					/>
				</section>
			) : null}

			{/* ── CLASSIFICA: Serie A live ───────────────────────── */}
			<section className="space-y-6 overflow-hidden">
				<div className="section !pb-2">
					<SectionTag num="05" title="Classifica" accent="#F28C28" />
				</div>
				<div className="px-4 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-screen-xl overflow-hidden rounded-2xl border border-line-soft bg-surface">
						<Suspense fallback={<div className="animate-pulse h-64 bg-white/10" />}>
							<Standings competition="SA" inline mobileRows="5" desktopRows="5" />
						</Suspense>
					</div>
					<div className="mx-auto mt-4 max-w-screen-xl text-right">
						<Link
							href="/classifiche"
							className="group inline-flex items-center gap-1.5 text-xs font-semibold text-brand transition hover:underline"
						>
							Tutte le classifiche
							<ChevronIcon direction="right" className="size-3.5 transition group-hover:translate-x-0.5" />
						</Link>
					</div>
				</div>
			</section>

			{/* ── CALCIO: full-bleed themed band ─────────────────── */}
			<div className={cn('bg-section-calcio w-full')}>
				<div className="section-full py-10 md:py-16">
					<Suspense fallback={<BandSkeleton />}>
						<BlogList
							_type="blog-list"
							_key="home5-calcio"
							title="Calcio"
							category="calcio"
							layout="carousel"
							limit={6}
							nested
						/>
					</Suspense>
				</div>
			</div>

			{/* ── TENNIS: full-bleed themed band ─────────────────── */}
			<div className={cn('bg-section-tennis w-full')}>
				<div className="section-full py-10 md:py-16">
					<Suspense fallback={<BandSkeleton />}>
						<BlogList
							_type="blog-list"
							_key="home5-tennis"
							title="Tennis"
							category="tennis"
							layout="carousel"
							limit={6}
							nested
						/>
					</Suspense>
				</div>
			</div>

			{/* ── FULL GRID: latest cards ────────────────────────── */}
			{bytes.length > 0 && (
				<section className="section space-y-6 !py-2">
					<SectionTag num="06" title="Ultime dal mondo" accent="#00AEEF" />
					<ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{bytes.slice(0, 6).map((post) => (
							<li key={post._id}>										<PostPreview post={post} />

							</li>
						))}
					</ul>
				</section>
			)}

			{/* ── NEWSLETTER magnet ──────────────────────────────── */}
			<section className="section border-t border-line-soft">
				<div className="mx-auto max-w-screen-lg">
					<NewsletterSubscribe variant="inline" />
				</div>
			</section>
		</div>
	)
}