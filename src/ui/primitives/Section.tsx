import { cn } from '@/lib/utils'

export default function Section({
	nested,
	className,
	children,
	...props
}: {
	nested?: boolean
	className?: string
	children?: React.ReactNode
} & Record<string, unknown>) {
	const Tag = nested ? 'div' : 'section'

	return (
		<Tag className={cn(!nested && 'section', className)} {...props}>
			{children}
		</Tag>
	)
}
