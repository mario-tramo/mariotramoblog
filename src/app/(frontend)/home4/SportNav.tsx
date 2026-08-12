'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export type NavItem = { label: string; href: string; accent?: string }

export default function SportNav({ items }: { items: NavItem[] }) {
	const pathname = usePathname()

	return (
		<nav
			aria-label="Categorie sport"
			className="sticky top-[var(--header-height)] z-40 border-b border-line-soft bg-surface-contrast/90 backdrop-blur-md"
		>
			<ul className="no-scrollbar mx-auto flex max-w-screen-2xl items-center gap-1 overflow-x-auto px-4 text-sm sm:px-6">
				{items.map((item) => {
					const active = pathname === item.href
					return (
						<li key={item.href} className="shrink-0">
							<Link
								href={item.href}
								className={cn(
									'relative block whitespace-nowrap px-3 py-3 text-[12px] font-medium transition-colors sm:px-3.5 sm:text-[13px]',
									active
										? 'text-white'
										: 'text-white/55 hover:text-white',
								)}
								style={
									active && item.accent
										? { color: item.accent }
										: undefined
								}
							>
								{item.label}
								<span
									className={cn(
										'absolute inset-x-3 -bottom-px h-0.5 rounded-full transition-opacity',
										active ? 'opacity-100' : 'opacity-0',
									)}
									style={{
										backgroundColor: item.accent ?? 'var(--color-accent)',
									}}
								/>
							</Link>
						</li>
					)
				})}
				<li className="ml-auto hidden shrink-0 lg:block">
					<Link
						href="/classifiche"
						className="flex items-center gap-1.5 px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-accent transition hover:text-white"
					>
						<span className="inline-block size-1.5 animate-pulse rounded-full bg-red-500" />
						Classifiche live
					</Link>
				</li>
			</ul>
		</nav>
	)
}