import { cn } from '@/lib/utils'

export default function SectionCard({
	children,
	className,
	...props
}: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'rounded-xl border border-line-soft bg-surface/80 backdrop-blur-sm',
				className,
			)}
			{...props}
		>
			{children}
		</div>
	)
}
