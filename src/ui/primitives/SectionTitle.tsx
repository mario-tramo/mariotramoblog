import { cn } from '@/lib/utils'

export default function SectionTitle({
	className,
	children,
	...props
}: { showDot?: boolean } & React.ComponentProps<'h2'>) {
	if (!children) return null

	return (
		<div className={cn('flex items-center gap-3', className)}>
			<span className="h-6 w-1 rounded-full bg-brand shadow-[0_0_8px_rgba(198,40,40,0.4)]" aria-hidden="true" />
			<h2
				className="text-xs font-extrabold uppercase tracking-[0.2em] text-ink sm:text-sm"
				{...props}
			>
				{children}
			</h2>
		</div>
	)
}
