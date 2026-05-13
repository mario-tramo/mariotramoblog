import Link from 'next/link'
import { Img } from '@/ui/Img'
import SectionCard from '@/ui/SectionCard'
import resolveUrl from '@/lib/resolveUrl'

function getInitials(name?: string) {
	if (!name) return '??'
	return name
		.split(' ')
		.map((w) => w[0])
		.join('')
		.toUpperCase()
		.slice(0, 2)
}

interface FeaturedPostCardProps {
	post?: Sanity.BlogPost
	title: string
	byLabel?: string
	readTimeLabel?: string
}

export default function FeaturedPostCard({
	post,
	title,
	byLabel = 'Di',
	readTimeLabel = 'min di lettura',
}: FeaturedPostCardProps) {
	if (!post) return null

	const author = post.authors?.[0]

	return (
		<SectionCard className="overflow-hidden">
			<div className="p-4 pb-3 sm:p-5 sm:pb-3">
				<h3 className="text-xs font-bold tracking-widest text-brand">
					{title}
				</h3>
			</div>

			<Link
				href={resolveUrl(post, { base: false })}
				className="group block"
			>
				<div className="aspect-[4/3]">
					<Img
						className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
						image={post.metadata.image}
						width={600}
						alt={post.metadata.title}
					/>
				</div>

				<div className="p-4 sm:p-5">
					<h3 className="font-extrabold leading-snug group-hover:underline">
						{post.metadata.title}
					</h3>

					{author && (
						<div className="mt-3 flex items-center gap-2 text-[11px] text-muted">
							<span className="grid size-6 place-items-center rounded-full bg-surface-2 text-[10px] font-bold">
								{getInitials(author.name)}
							</span>
							{byLabel} {author.name}
							{post.readTime > 0 && (
								<>
									<span>&#8226;</span>
									{post.readTime} {readTimeLabel}
								</>
							)}
						</div>
					)}
				</div>
			</Link>
		</SectionCard>
	)
}
