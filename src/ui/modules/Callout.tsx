import { PortableText } from 'next-sanity'
import CTAList from '@/ui/primitives/CTAList'
import Code from './RichtextModule/Code'
import type { PortableTextBlock } from '@portabletext/types'

export default function Callout({
	content,
	ctas,
}: Partial<{
	content: PortableTextBlock[]
	ctas: Sanity.CTA[]
}>) {
	return (
		<section className="section text-center">
			<div className="section bg-accent/3 max-w-screen-lg rounded">
				<div className="richtext mx-auto max-w-screen-sm text-balance">
					<PortableText
						value={content}
						components={{
							types: {
								code: ({ value }) => (
									<Code
										value={value}
										className="mx-auto max-w-max"
										theme="snazzy-light"
									/>
								),
							},
						}}
					/>
					<CTAList className="!mt-8 justify-center" ctas={ctas} />
				</div>
			</div>
		</section>
	)
}
