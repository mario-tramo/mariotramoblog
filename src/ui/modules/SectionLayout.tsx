import moduleProps from '@/lib/moduleProps'
import Modules from '@/ui/modules'
import { stegaClean } from 'next-sanity'
import { cn } from '@/lib/utils'

type SectionLayoutProps = Partial<{
	layout: '1' | '2' | '2-asymmetric' | '3'
	verticalAlign: 'start' | 'center' | 'end' | 'stretch'
	column1: Sanity.Module[]
	column2: Sanity.Module[]
	column3: Sanity.Module[]
}> &
	Sanity.Module

const gridClasses: Record<string, string> = {
	'1': 'grid-cols-1',
	'2': 'lg:grid-cols-2',
	'2-asymmetric': 'lg:grid-cols-[2fr_1fr]',
	'3': 'lg:grid-cols-3',
}

const alignClasses: Record<string, string> = {
	start: 'items-start',
	center: 'items-center',
	end: 'items-end',
	stretch: 'items-stretch',
}

export default function SectionLayout({
	layout,
	verticalAlign,
	column1,
	column2,
	column3,
	...props
}: SectionLayoutProps) {
	const cleanLayout = stegaClean(layout) || '2'
	const cleanAlign = stegaClean(verticalAlign) || 'start'

	const columns = [column1]
	if (cleanLayout !== '1') columns.push(column2)
	if (cleanLayout === '3') columns.push(column3)

	return (
		<section className="section" {...moduleProps(props)}>
			<div
				className={cn(
					'grid gap-8',
					gridClasses[cleanLayout],
					alignClasses[cleanAlign],
				)}
			>
				{columns.map((columnModules, i) => (
					<div key={i} className="min-w-0 space-y-8">
						<Modules modules={columnModules} />
					</div>
				))}
			</div>
		</section>
	)
}
