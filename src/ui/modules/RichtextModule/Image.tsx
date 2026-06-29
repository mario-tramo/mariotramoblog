'use client'

import { useRef } from 'react'
import { Img } from '@/ui/primitives/Img'
import { urlFor } from '@/sanity/lib/image'
import { stegaClean } from '@sanity/client/stega'
import { cn } from '@/lib/utils'
import { useLightbox } from '@/ui/features/Lightbox'
import Lightbox from '@/ui/features/Lightbox'
import { Expand } from 'lucide-react'

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
	const { open, image, openLightbox, closeLightbox } = useLightbox()
	const imgRef = useRef<HTMLDivElement>(null)

	const src = value?.asset ? urlFor(value).width(1920).url() : ''

	return (
		<>
			<figure
				data-sanity-id="image"
				className={cn(
					'max-lg:full-bleed group relative space-y-2 text-center md:[grid-column:bleed]!',
					floatClass,
				)}
			>
				<div
					ref={imgRef}
					className="relative cursor-pointer"
					onClick={() =>
						openLightbox({
							src,
							alt: value.caption || value.alt || '',
							caption: value.caption,
						})
					}
					role="button"
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault()
							openLightbox({
								src,
								alt: value.caption || value.alt || '',
								caption: value.caption,
							})
						}
					}}
				>
					<Img
						className="bg-accent/3 mx-auto max-h-svh w-auto text-[0px]"
						image={value}
						width={1500}
						alt={value.caption || value.alt || ''}
					/>

					<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
						<div className="rounded-full bg-canvas/70 backdrop-blur-sm p-2.5">
							<Expand className="size-5 text-ink" />
						</div>
					</div>
				</div>

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

			{open && image && <Lightbox image={image} onClose={closeLightbox} />}
		</>
	)
}
