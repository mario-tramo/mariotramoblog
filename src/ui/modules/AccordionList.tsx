import moduleProps from '@/lib/moduleProps'
import { PortableText } from '@portabletext/react'
import Image from './RichtextModule/Image'
import CustomHTML from './CustomHTML'
import { cn } from '@/lib/utils'
import type { PortableTextBlock } from '@portabletext/react'

export default function AccordionList({
	pretitle,
	intro,
	items,
	layout = 'vertical',
	connect,
	generateSchema: _generateSchema,
	nested,
	...props
}: Partial<{
	pretitle: string
	intro: PortableTextBlock[]
	items: {
		_key: string
		summary: string
		content: PortableTextBlock[]
		open?: boolean
	}[]
	layout: 'vertical' | 'horizontal'
	connect: boolean
	generateSchema: boolean
	nested: boolean
}> &
	Sanity.Module) {
	const Tag = nested ? 'div' : 'section'

	return (
		<Tag
			className={cn(
				!nested && 'section',
				layout === 'horizontal' ? 'grid gap-8 md:grid-cols-2' : 'space-y-8',
			)}
			{...moduleProps(props)}
		>
			<header
				className={cn(
					'space-y-4',
					layout === 'horizontal'
						? 'md:sticky-below-header self-start [--offset:1rem]'
						: 'text-center',
				)}
			>
				{pretitle && (
					<h2 className="font-heading text-3xl uppercase tracking-tight md:text-5xl">{pretitle}</h2>
				)}
				{intro && (
					<div className="richtext">
						<PortableText value={intro} />
					</div>
				)}
			</header>

			<div className="mx-auto w-full max-w-screen-md">
				{items?.map(({ _key, summary, content, open }) => (
					<details
						className="accordion border-line border-b"
						name={connect ? props._key : undefined}
						open={open}
						key={_key}
					>
						<summary className="py-4 font-bold">{summary}</summary>

						<div className="anim-fade-to-b pb-4">
							<div className="richtext">
								<PortableText
									value={content}
									components={{
										types: {
											image: Image,
											'custom-html': ({ value }) => (
												<CustomHTML
													className="has-[table]:md:[grid-column:bleed] has-[table]:md:mx-auto"
													{...value}
												/>
											),
										},
									}}
								/>
							</div>
						</div>
					</details>
				))}
			</div>
		</Tag>
	)
}
