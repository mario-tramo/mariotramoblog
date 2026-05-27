import { fetchSanityLive } from '@/sanity/lib/fetch'
import { groq } from 'next-sanity'
import { Img } from '@/ui/primitives/Img'
import Link from 'next/link'
import { getInitials } from '@/lib/utils'
import moduleProps from '@/lib/moduleProps'

export default async function TeamGrid(props: Sanity.Module) {
	const authors = await fetchSanityLive<Sanity.Person[]>({
		query: groq`*[_type == 'person']|order(name){
			...,
			'articleCount': count(*[_type == 'blog.post' && author._ref == ^._id])
		}`,
	})

	if (!authors?.length) return null

	return (
		<section className="section" {...moduleProps(props)}>
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{authors.map((author) => (
					<Link
						key={author._id}
						href={
							author.slug?.current
								? `/autori/${author.slug.current}`
								: '#'
						}
						className="group flex gap-4 rounded-2xl border border-line bg-surface p-5 transition shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:border-brand/30 hover:shadow-lg"
					>
						<span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-brand text-lg font-bold text-brand-foreground">
							{author.image ? (
								<Img
									className="size-full rounded-full object-cover"
									image={author.image}
									width={128}
									alt={author.name}
								/>
							) : (
								getInitials(author.name)
							)}
						</span>

						<div className="min-w-0">
							<p className="text-base font-bold text-ink group-hover:text-brand">
								{author.name}
							</p>
							{author.articleCount && author.articleCount > 0 && (
								<p className="mt-0.5 text-xs font-medium text-brand">
									{author.articleCount}{' '}
									{author.articleCount === 1
										? 'Articolo'
										: 'Articoli'}
								</p>
							)}
							{author.bio && (
								<p className="mt-1.5 line-clamp-2 text-sm text-muted">
									{author.bio}
								</p>
							)}
						</div>
					</Link>
				))}
			</div>
		</section>
	)
}
