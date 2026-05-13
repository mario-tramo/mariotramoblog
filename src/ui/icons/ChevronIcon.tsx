import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ChevronIcon({
	direction = 'right',
	className,
	...props
}: { direction?: 'left' | 'right' } & React.ComponentProps<'svg'>) {
	const Icon = direction === 'left' ? ChevronLeft : ChevronRight
	return <Icon className={cn('size-4', className)} {...props} />
}
