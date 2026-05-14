import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

export default function Loading({
	className,
	children,
}: ComponentProps<'div'>) {
	return (
		<aside className={cn('flex items-center gap-2', className)}>
			<Loader2 className="size-4 animate-spin" />
			{children || 'Caricamento...'}
		</aside>
	)
}
