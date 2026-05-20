import Link from 'next/link'
import { Img } from '@/ui/primitives/Img'
import resolveUrl from '@/lib/resolveUrl'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import { groq } from 'next-sanity'
import { IMAGE_QUERY } from '@/sanity/lib/queries'
import ReadTime from './ReadTime'
import SectionTitle from '@/ui/primitives/SectionTitle'
import SectionCard from '@/ui/primitives/SectionCard'

export default async function RelatedPosts({
	post,
	variant = 'full',
}: {
	post: Sanity.BlogPost
	variant?: 'full' | 'sidebar'
}) {
	const categoryIds = post.categories?.map((c) => c._id) ?? []
	const tagIds = post.tags?.map((t) => t._id) ?? []

	if (!categoryIds.length && !tagIds.length) return null

	const limit = variant === 'sidebar' ? 4 : 3

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
				publishDate,
				'readTime': round(length(pt::text(body)) / 5 / 180),
				metadata {
					...,
					image { ${IMAGE_QUERY} }
				},
			}
		`,
		params: { postId: post._id, categoryIds, tagIds },
	})

	if (!related?.length) return null

	if (variant === 'sidebar') {
		return (
			<SectionCard className="p-5 sm:p-6">
				<SectionTitle className="mb-5">ARTICOLI CORRELATI</SectionTitle>
				<ul className="space-y-5">
					{related.map((r) => (
						<li key={r._id} className="group relative">
							<Link
								href={resolveUrl(r, { base: false })}
								className="flex gap-3"
							>
								<figure className="size-14 flex-shrink-0 overflow-hidden rounded-lg">
									<Img
										className="size-full object-cover"
										image={r.metadata.image}
										width={112}
										alt={r.metadata.title}
									/>
								</figure>
								<div className="min-w-0">
									<p className="line-clamp-2 text-[13px] font-medium leading-snug group-hover:underline">
										{r.metadata.title}
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
								alt={r.metadata.title}
							/>
						</div>
						<div className="p-4">
							<h3 className="line-clamp-2 text-sm font-semibold leading-snug transition group-hover:text-brand">
								{r.metadata.title}
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
