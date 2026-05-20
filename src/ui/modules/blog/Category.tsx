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
			'inline-block rounded-full border border-ink/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted',
			linked && 'relative z-10 hover:text-ink hover:border-ink/25 transition-colors',
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
