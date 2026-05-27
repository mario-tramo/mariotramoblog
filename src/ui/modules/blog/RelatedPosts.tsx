import Link from 'next/link'
import { Img } from '@/ui/primitives/Img'
import resolveUrl from '@/lib/resolveUrl'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import { groq } from 'next-sanity'
import { IMAGE_QUERY } from '@/sanity/lib/queries'
import ReadTime from './ReadTime'
import SectionTitle from '@/ui/primitives/SectionTitle'
import SectionCard from '@/ui/primitives/SectionCard'
import { ChevronRight } from 'lucide-react'

export default async function RelatedPosts({
	post,
	variant = 'full',
}: {
	post: Sanity.BlogPost
	variant?: 'full' | 'sidebar' | 'mobile-collapsible'
}) {
	const categoryIds = post.categories?.map((c) => c._id) ?? []
	const tagIds = post.tags?.map((t) => t._id) ?? []

	if (!categoryIds.length && !tagIds.length) return null

	const limit = variant === 'sidebar' || variant === 'mobile-collapsible' ? 4 : 3

	const related = await fetchSanityLive<Sanity.BlogPost[]>({
		query: groq`
			*[
				_type == 'blog.post'
				&& _id != $postId
				&& (
					count(categories[@._ref in $categoryIds]) > 0
					|| count(tags[@._ref in $tagIds]) > 0
				)
			]|order(
				count(tags[@._ref in $tagIds]) desc,
				count(categories[@._ref in $categoryIds]) desc,
				publishDate desc
			)[0...${limit}]{
				_type,
				_id,
				'title': coalesce(title, metadata.title),
				publishDate,
				'readTime': round(length(pt::text(body)) / 5 / 180),
				categories[]->{ _id, title, slug },
				metadata {
					...,
					image { ${IMAGE_QUERY} }
				},
			}
		`,
		params: { postId: post._id, categoryIds, tagIds },
	})

	if (!related?.length) return null

	const firstCategory = (r: Sanity.BlogPost) => r.categories?.[0]

	if (variant === 'mobile-collapsible') {
		return (
			<details className="group rounded-2xl border border-ink/10 bg-surface-light">
				<summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-black uppercase tracking-wider text-brand">
					Articoli correlati
					<ChevronRight className="size-5 rotate-90 text-brand transition-transform group-open:rotate-270" />
				</summary>
				<div className="px-5 pb-5">
					<hr className="mb-4 border-ink/10" />
					<ul className="space-y-5">
						{related.map((r) => (
							<li key={r._id} className="group/item relative">
								<Link
									href={resolveUrl(r, { base: false })}
									className="block"
								>
									<figure className="relative overflow-hidden rounded-xl">
										<Img
											className="aspect-[16/10] w-full object-cover"
											image={r.metadata.image}
											width={320}
											alt={r.title}
										/>
										{firstCategory(r) && (
											<span className="absolute top-2 left-2 rounded-full bg-canvas/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-brand backdrop-blur-sm">
												{firstCategory(r)!.title}
											</span>
										)}
									</figure>
									<div className="mt-2.5">
										<p className="line-clamp-2 text-sm font-semibold leading-snug group-hover/item:underline">
											{r.title}
										</p>
										<ReadTime
											value={r.readTime}
											className="mt-1 text-[11px] text-muted"
										/>
									</div>
								</Link>
							</li>
						))}
					</ul>
				</div>
			</details>
		)
	}

	if (variant === 'sidebar') {
		const big = related.slice(0, 2)
		const small = related.slice(2)

		return (
			<SectionCard className="bg-surface-light p-5 sm:p-6">
				<SectionTitle className="mb-5">ARTICOLI CORRELATI</SectionTitle>
				<ul className="space-y-5">
					{/* Big cards — vertical image + text */}
					{big.map((r) => (
						<li key={r._id} className="group relative">
							<Link
								href={resolveUrl(r, { base: false })}
								className="block"
							>
								<figure className="relative overflow-hidden rounded-xl">
									<Img
										className="aspect-[16/10] w-full object-cover"
										image={r.metadata.image}
										width={380}
										alt={r.title}
									/>
									{firstCategory(r) && (
										<span className="absolute top-2 left-2 rounded-full bg-canvas/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-brand backdrop-blur-sm">
											{firstCategory(r)!.title}
										</span>
									)}
								</figure>
								<div className="mt-2.5">
									<p className="line-clamp-2 text-sm font-semibold leading-snug group-hover:underline">
										{r.title}
									</p>
									<ReadTime
										value={r.readTime}
										className="mt-1 text-[11px] text-muted"
									/>
								</div>
							</Link>
						</li>
					))}

					{/* Small cards — horizontal thumbnail + text */}
					{small.map((r) => (
						<li key={r._id} className="group relative">
							<Link
								href={resolveUrl(r, { base: false })}
								className="flex gap-3"
							>
								<figure className="relative w-28 flex-shrink-0 overflow-hidden rounded-lg">
									<Img
										className="aspect-[16/10] w-full object-cover"
										image={r.metadata.image}
										width={140}
										alt={r.title}
									/>
									{firstCategory(r) && (
										<span className="absolute top-1 left-1 rounded-full bg-canvas/80 px-1.5 py-px text-[8px] font-semibold uppercase tracking-widest text-brand backdrop-blur-sm">
											{firstCategory(r)!.title}
										</span>
									)}
								</figure>
								<div className="min-w-0 py-0.5">
									<p className="line-clamp-3 text-[13px] font-semibold leading-snug group-hover:underline">
										{r.title}
									</p>
									<ReadTime
										value={r.readTime}
										className="mt-1 text-[11px] text-muted"
									/>
								</div>
							</Link>
						</li>
					))}
				</ul>
			</SectionCard>
		)
	}

	return (
		<section className="mx-auto mt-16 max-w-[820px] px-4 pb-12 sm:px-6">
			<SectionTitle className="mb-6">ARTICOLI CORRELATI</SectionTitle>

			<div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
				{related.map((r) => (
					<Link
						key={r._id}
						href={resolveUrl(r, { base: false })}
						className="group overflow-hidden rounded-xl bg-surface transition hover:bg-surface-light"
					>
						<div className="aspect-[16/10] overflow-hidden">
							<Img
								className="size-full object-cover transition duration-500 group-hover:scale-105"
								image={r.metadata.image}
								width={400}
								alt={r.title}
							/>
						</div>
						<div className="p-4">
							<h3 className="line-clamp-2 text-sm font-semibold leading-snug transition group-hover:text-brand">
								{r.title}
							</h3>
							<ReadTime
								value={r.readTime}
								className="mt-2 text-[11px] text-muted"
							/>
						</div>
					</Link>
				))}
			</div>
		</section>
	)
}
