'use client'

import { tabbedContentStore } from './store'
import TabbedContent from '.'
import { cn } from '@/lib/utils'

export default function TabList({
	tabs,
}: React.ComponentProps<typeof TabbedContent>) {
	const { active, setActive } = tabbedContentStore()

	function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
		const tabsLen = tabs?.length ?? 0
		if (tabsLen < 2) return

		switch (e.key) {
			case 'ArrowLeft': {
				e.preventDefault()
				setActive(active > 0 ? active - 1 : tabsLen - 1)
				break
			}
			case 'ArrowRight': {
				e.preventDefault()
				setActive(active < tabsLen - 1 ? active + 1 : 0)
				break
			}
			case 'Home': {
				e.preventDefault()
				setActive(0)
				break
			}
			case 'End': {
				e.preventDefault()
				setActive(tabsLen - 1)
				break
			}
		}
	}

	return (
		<div className="max-md:full-bleed no-scrollbar flex overflow-x-auto" role="tablist" onKeyDown={onKeyDown}>
			{tabs?.map((tab, key) => (
				<button
					type="button"
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
					tabIndex={key === active ? 0 : -1}
				>
					{tab.label}
				</button>
			))}
		</div>
	)
}
