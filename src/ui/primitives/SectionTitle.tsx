import { cn } from '@/lib/utils'

export default function SectionTitle({
	className,
	children,
	showDot,
	...props
}: { showDot?: boolean } & React.ComponentProps<'h3'>) {
	if (!children) return null

	return (
		<div className={cn('flex items-center gap-2', className)}>
			{showDot && <span className="size-2 rounded-full bg-brand" />}
			<h3
				className="text-xs font-bold tracking-widest text-brand"
				{...props}
			>
				{children}
			</h3>
		</div>
	)
}
