import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getCategoryColor } from '@/lib/categoryColors'

export default function Category({
	value,
	label,
	linked,
}: {
	value?: Sanity.BlogCategory
	label?: string
	linked?: boolean
}) {
	const color = getCategoryColor(value)

	const props = {
		className: cn(
			'inline-block rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white transition-colors',
			linked && 'relative z-10 hover:brightness-125',
			!linked && 'pointer-events-none',
		),
		style: {
			backgroundColor: color,
		},
		children: <span>{label || value?.title}</span>,
	}

	return linked ? (
		<Link
			href={`/${value?.slug?.current}`}
			{...props}
		/>
	) : (
		<div {...props} />
	)
}
