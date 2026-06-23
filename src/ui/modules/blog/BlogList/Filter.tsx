'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useBlogFilters } from '../store'
import { cn } from '@/lib/utils'
import css from './FilterList.module.css'


export default function Filter({
	label,
	value = 'All',
	navigateToCategory,
}: {
	label: string
	value?: 'All' | string
	navigateToCategory?: boolean
}) {
	const pathname = usePathname()

	if (navigateToCategory) {
		const isActive = value === 'All' ? pathname === '/' : pathname === `/${value}`
		const href = value === 'All' ? '/' : `/${value}`

		return (
			<Link
				href={href}
				className={cn(
					css.filter,
					'rounded-full border px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest transition-colors',
					isActive
						? 'border-brand bg-brand text-brand-foreground'
						: 'border-brand/40 text-muted hover:border-brand/60 hover:text-ink',
				)}
				aria-label={`Filtra per ${label}`}
			>
				{label}
			</Link>
		)
	}

	return <ClientFilter label={label} value={value} />
}

function ClientFilter({
	label,
	value = 'All',
}: {
	label: string
	value?: 'All' | string
}) {
	const { category, setCategory } = useBlogFilters()

	return (
		<button
			type="button"
			className={cn(
				css.filter,
				'rounded-full border px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest transition-colors',
				category === value
					? 'border-brand bg-brand text-brand-foreground'
					: 'border-brand/40 text-muted hover:border-brand/60 hover:text-ink',
			)}
			aria-label={`Filtra per ${label}`}
			aria-pressed={category === value}
			onClick={() => setCategory(value)}
		>
			{label}
		</button>
	)
}
