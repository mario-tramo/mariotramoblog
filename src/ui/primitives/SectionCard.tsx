import { cn } from '@/lib/utils'

export default function SectionCard({
	children,
	className,
	...props
}: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'rounded-xl border border-ink/8 bg-surface',
				className,
			)}
			{...props}
		>
			{children}
		</div>
	)
}
