'use client'

import { tabbedContentStore } from './store'
import TabbedContent from '.'
import { cn } from '@/lib/utils'

export default function TabList({
	tabs,
}: React.ComponentProps<typeof TabbedContent>) {
	const { active, setActive } = tabbedContentStore()

	return (
		<div className="max-md:full-bleed no-scrollbar flex overflow-x-auto" role="tablist">
			{tabs?.map((tab, key) => (
				<button
					className={cn(
						'shrink-0 grow basis-[min(150px,80vw)] rounded-t border-b p-2 transition-all',
						key === active
							? 'border-accent border-b-2'
							: 'text-ink/50 hover:text-ink border-line',
					)}
					onClick={() => setActive(key)}
					key={key}
					role="tab"
					aria-selected={key === active}
					aria-controls={`tabpanel-${key}`}
					id={`tab-${key}`}
				>
					{tab.label}
				</button>
			))}
		</div>
	)
}
