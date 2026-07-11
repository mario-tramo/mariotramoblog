'use client'

import { PortableText } from '@portabletext/react'
import AnchoredHeading from './AnchoredHeading'
import { cn } from '@/lib/utils'

import Image from './Image'
import Admonition from './Admonition'
import CustomHTML from '@/ui/modules/CustomHTML'
import { QuoteBlock } from '@/ui/blog/blocks/quote-block'
import { SocialEmbed } from '@/ui/blog/blocks/social-embed'
import type { PortableTextBlock } from '@portabletext/react'
import { addAutoLinkMarks } from '@/lib/autoLink'
import { BASE_URL } from '@/lib/env'

/** Render a hyperlink annotation from the rich-text body. */
function LinkMark({
	value,
	children,
}: {
	value?: { href?: string }
	children: React.ReactNode
}) {
	const href = value?.href ?? '';
	if (!href) return <>{children}</>

	const isSpecial = /^(mailto:|tel:|#)/i.test(href)
	const isAbsolute = /^https?:\/\//i.test(href)
	const isInternal =
		!isAbsolute || href.startsWith(BASE_URL) || href.includes('www.trmsport.com')
	const openInNewTab = isAbsolute && !isInternal && !isSpecial

	return (
		<a
			href={href}
			{...(openInNewTab && { target: '_blank', rel: 'noopener noreferrer' })}
		>
			{children}
		</a>
	)
}

export default function Content({
	value,
	className,
	children,
	autoLink = false,
}: { value: PortableTextBlock[]; autoLink?: boolean } & React.ComponentProps<'div'>) {
	const blocks = autoLink ? addAutoLinkMarks(value as never) : value

	return (
		<div
			className={cn(
				'richtext w-full space-y-6 [&>:first-child]:!mt-0',
				className,
			)}
		>
			<PortableText
				value={blocks}
				components={{
					marks: {
						link: LinkMark,
					},
					block: {
						normal: ({ children }) => <p>{children}</p>,
						h2: (node) => <AnchoredHeading as="h2" {...node} />,
						h3: (node) => <AnchoredHeading as="h3" {...node} />,
						h4: (node) => <AnchoredHeading as="h4" {...node} />,
						h5: (node) => <AnchoredHeading as="h5" {...node} />,
						h6: (node) => <AnchoredHeading as="h6" {...node} />,
					},
					types: {
						image: Image,
						admonition: Admonition,
						quoteBlock: QuoteBlock,
						socialEmbed: SocialEmbed,
						'custom-html': ({ value }) => (
							<CustomHTML
								data-sanity-id="custom-html"
								className="has-[table]:md:[grid-column:bleed] has-[table]:md:mx-auto"
								{...value}
							/>
						),
					},
				}}
			/>

			{children}
		</div>
	)
}
