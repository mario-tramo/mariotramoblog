import Link from 'next/link'
import { BLOG_DIR } from '@/lib/env'
import { cn } from '@/lib/utils'

export default function Category({
	value,
	label,
	linked,
}: {
	value?: Sanity.BlogCategory
	label?: string
	linked?: boolean
}) {
	const props = {
		className: cn(
			'inline-block rounded-full bg-brand px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-foreground',
			linked && 'relative z-10 hover:opacity-80 transition-opacity',
			!linked && 'pointer-events-none',
		),
		children: <span>{label || value?.title}</span>,
	}

	return linked ? (
		<Link
			href={{
				pathname: `/${BLOG_DIR}`,
				query: { categoria: value?.slug?.current },
			}}
			{...props}
		/>
	) : (
		<div {...props} />
	)
}
