import Link from 'next/link'
import { Img } from '@/ui/Img'
import resolveUrl from '@/lib/resolveUrl'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import { groq } from 'next-sanity'
import { IMAGE_QUERY } from '@/sanity/lib/queries'

export default async function RelatedPosts({
	post,
}: {
	post: Sanity.BlogPost
}) {
	const categoryIds = post.categories?.map((c) => c._id) ?? []

	if (!categoryIds.length) return null

	const related = await fetchSanityLive<Sanity.BlogPost[]>({
		query: groq`
			*[
				_type == 'blog.post'
				&& _id != $postId
				&& count(categories[@._ref in $categoryIds]) > 0
			]|order(publishDate desc)[0...3]{
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
		params: { postId: post._id, categoryIds },
	})

	if (!related?.length) return null

	return (
		<section className="mx-auto mt-14 max-w-[820px] px-4 pb-10 sm:px-6">
			<h2 className="mb-4 text-xs font-bold tracking-widest text-brand">
				ARTICOLI CORRELATI
			</h2>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{related.map((r) => (
					<Link
						key={r._id}
						href={resolveUrl(r, { base: false })}
						className="group overflow-hidden rounded-xl border border-border bg-surface transition hover:border-brand/50"
					>
						<div className="aspect-[16/10] overflow-hidden">
							<Img
								className="size-full object-cover transition duration-500 group-hover:scale-105"
								image={r.metadata.image}
								width={400}
								alt={r.metadata.title}
							/>
						</div>
						<div className="p-3">
							<h3 className="line-clamp-2 text-sm font-semibold leading-snug transition group-hover:text-brand">
								{r.metadata.title}
							</h3>
							{r.readTime > 0 && (
								<p className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted">
									{r.readTime} min di lettura
									<svg
										className="size-3"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={2}
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</p>
							)}
						</div>
					</Link>
				))}
			</div>
		</section>
	)
}
