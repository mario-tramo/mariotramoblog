import { cn } from '@/lib/utils'
import { stegaClean } from 'next-sanity'

export default function Pretitle({
	className,
	children,
}: React.ComponentProps<'p'>) {
	if (!children) return null

	return (
		<p className={cn('text-[11px] font-bold uppercase tracking-[0.15em] text-accent', className)}>
			{stegaClean(children)}
		</p>
	)
}
