import moduleProps from '@/lib/moduleProps'
import Pretitle from '@/ui/primitives/Pretitle'
import { PortableText, stegaClean } from 'next-sanity'
import CTAList from '@/ui/primitives/CTAList'
import { Img } from '@/ui/primitives/Img'
import { cn } from '@/lib/utils'
import type { PortableTextBlock } from '@portabletext/react'

export default function CardList({
	pretitle,
	intro,
	cards,
	ctas,
	layout,
	columns = 3,
	visualSeparation,
	nested,
	...props
}: Partial<{
	pretitle: string
	intro: PortableTextBlock[]
	ctas: Sanity.CTA[]
	cards: Partial<{
		image: Sanity.Image
		content: PortableTextBlock[]
		ctas: Sanity.CTA[]
	}>[]
	layout: 'grid' | 'carousel'
	columns: number
	visualSeparation: boolean
	nested: boolean
}> &
	Sanity.Module) {
	const isCarousel = stegaClean(layout) === 'carousel'
	const Tag = nested ? 'div' : 'section'

	return (
		<Tag className={cn(!nested && 'section', 'space-y-12')} {...moduleProps(props)}>
			{(pretitle || intro) && (
				<header className="richtext text-center">
					<Pretitle>{pretitle}</Pretitle>
					<PortableText value={intro} />
					<CTAList className="justify-center" ctas={ctas} />
				</header>
			)}

			<div
				className={cn(
					'items-stretch gap-8',
					isCarousel
						? 'carousel max-md:full-bleed md:overflow-fade-r pb-4 max-md:px-4'
						: [
								'grid *:h-full max-md:pb-4',
								columns
									? 'md:grid-cols-[repeat(var(--col,3),minmax(0,1fr))]'
									: 'sm:grid-cols-[repeat(auto-fill,minmax(var(--size,300px),1fr))]',
							],
				)}
				style={
					columns
						? ({
								'--col': columns,
							} as React.CSSProperties)
						: undefined
				}
			>
				{cards?.map((card, key) => (
					<article
						className={cn(
							'flex flex-col gap-4',
							visualSeparation && 'rounded-xl bg-surface p-6',
						)}
						key={key}
					>
						{card.image && (
							<figure>
								<Img
									className="aspect-video w-full object-cover"
									image={card.image}
									width={600}
								/>
							</figure>
						)}

						<div className="richtext grow">
							<PortableText value={card.content} />
						</div>
						<CTAList className="mt-auto" ctas={card.ctas} />
					</article>
				))}
			</div>
		</Tag>
	)
}
