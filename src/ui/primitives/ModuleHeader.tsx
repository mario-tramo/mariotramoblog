import { PortableText } from '@portabletext/react'
import CTAList from '@/ui/primitives/CTAList'
import type { PortableTextBlock } from '@portabletext/react'
import type { ComponentProps } from 'react'

type ModuleHeaderProps = ComponentProps<'header'> & {
	pretitle?: string
	intro?: PortableTextBlock[]
	ctas?: Sanity.CTA[]
}

export default function ModuleHeader({
	pretitle,
	intro,
	ctas,
	className,
	children,
	...props
}: ModuleHeaderProps) {
	if (!pretitle && !intro && !ctas) return null

	return (
		<header className={className} {...props}>
			{pretitle && (
				<h2 className="font-heading text-3xl uppercase tracking-tight md:text-5xl">
					{pretitle}
				</h2>
			)}
			{intro && <PortableText value={intro} />}
			{ctas && <CTAList className="justify-center" ctas={ctas} />}
			{children}
		</header>
	)
}
