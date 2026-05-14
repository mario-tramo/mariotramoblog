'use client'

import { useBlogFilters } from '../store'
import { usePageState } from '@/lib/usePagination'
import { cn } from '@/lib/utils'
import css from './FilterList.module.css'

export default function Filter({
	label,
	value = 'All',
}: {
	label: string
	value?: 'All' | string
}) {
	const { category, setCategory } = useBlogFilters()
	const { setPage } = usePageState()

	return (
		<button
			className={cn(
				css.filter,
				'rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest transition-colors',
				category === value
					? 'bg-ink/10 text-ink'
					: 'text-muted hover:text-ink',
			)}
			onClick={() => {
				setCategory(value)
				setPage(1)
			}}
		>
			{label}
		</button>
	)
}
