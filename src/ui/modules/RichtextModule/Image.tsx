import { Img } from '@/ui/primitives/Img'
import { stegaClean } from 'next-sanity'
import { cn } from '@/lib/utils'

export default function Image({
	value,
}: {
	value: Sanity.Image &
		Partial<{
			caption: string
			source: string
			float: 'left' | 'right'
		}>
}) {
	const floatClass = stegaClean(value.float) === 'left' ? 'float-left' : stegaClean(value.float) === 'right' ? 'float-right' : ''

	return (
		<figure
			className={cn('max-lg:full-bleed space-y-2 text-center md:[grid-column:bleed]!', floatClass)}
		>
			<Img
				className="bg-accent/3 mx-auto max-h-svh w-auto text-[0px]"
				image={value}
				width={1500}
			/>

			{value.caption && (
				<figcaption className="text-ink/50 px-4 text-sm text-balance italic">
					{value.caption}

					{value.source && (
						<>
							{' ('}
							<a href={value.source} className="image-source link">
								Source
							</a>
							{')'}
						</>
					)}
				</figcaption>
			)}
		</figure>
	)
}
