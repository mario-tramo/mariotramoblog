import { cn } from '@/lib/utils'

export default function SectionCard({
	children,
	className,
	...props
}: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'rounded-2xl border border-ink/8 bg-surface/50',
				className,
			)}
			{...props}
		>
			{children}
		</div>
	)
}
