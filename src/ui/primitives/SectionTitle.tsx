import { cn } from '@/lib/utils'

export default function SectionTitle({
	className,
	children,
	showDot,
	...props
}: { showDot?: boolean } & React.ComponentProps<'h2'>) {
	if (!children) return null

	return (
		<div className={cn('flex items-center gap-2', className)}>
			<span className="text-sm text-brand" aria-hidden="true">✦</span>
			<h2
				className="text-xs font-bold tracking-widest text-ink"
				{...props}
			>
				{children}
			</h2>
		</div>
	)
}
