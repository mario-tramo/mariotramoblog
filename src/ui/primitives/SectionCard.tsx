import { cn } from '@/lib/utils'

export default function SectionCard({
	children,
	className,
	...props
}: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'rounded-xl border border-line bg-surface shadow-[0_10px_30px_rgba(0,0,0,0.35)]',
				className,
			)}
			{...props}
		>
			{children}
		</div>
	)
}
