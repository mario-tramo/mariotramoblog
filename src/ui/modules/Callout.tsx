import { PortableText } from '@portabletext/react'
import CTAList from '@/ui/primitives/CTAList'
import { cn } from '@/lib/utils'
import type { PortableTextBlock } from '@portabletext/react'

export default function Callout({
	content,
	ctas,
	nested,
	...props
}: Partial<{
	content: PortableTextBlock[]
	ctas: Sanity.CTA[]
	nested: boolean
}>) {
	const Tag = nested ? 'div' : 'section'

	return (
		<Tag className={cn(!nested && 'section', 'text-center')} {...props}>
			<div className={cn(!nested && 'section', 'bg-accent/3 max-w-screen-lg rounded')}>
				<div className="richtext mx-auto max-w-screen-sm text-balance">
					<PortableText value={content} />
					<CTAList className="!mt-8 justify-center" ctas={ctas} />
				</div>
			</div>
		</Tag>
	)
}
