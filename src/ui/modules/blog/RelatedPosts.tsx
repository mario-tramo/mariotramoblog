import Link from 'next/link'
import { Img } from '@/ui/primitives/Img'
import resolveUrl from '@/lib/resolveUrl'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import { groq } from 'next-sanity'
import { IMAGE_QUERY } from '@/sanity/lib/queries'
import ReadTime from './ReadTime'
import SectionTitle from '@/ui/primitives/SectionTitle'

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
			<SectionTitle className="mb-4">ARTICOLI CORRELATI</SectionTitle>

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
