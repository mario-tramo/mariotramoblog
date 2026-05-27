import { cn } from '@/lib/utils'

export default function SectionCard({
	children,
	className,
	...props
}: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'rounded-2xl border border-ink/10 bg-surface-light/30 shadow-lg shadow-black/10 backdrop-blur-xl backdrop-saturate-150',
				className,
			)}
			{...props}
		>
			{children}
		</div>
	)
}
