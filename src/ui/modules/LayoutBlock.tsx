import moduleProps from '@/lib/moduleProps'
import Modules from '@/ui/modules'
import { stegaClean } from 'next-sanity'
import { cn } from '@/lib/utils'
import { bgClasses } from '@/lib/bgClasses'

const gridClasses: Record<string, string> = {
	'1': 'grid-cols-1',
	'2': 'lg:grid-cols-2',
	'2-wide-left': 'lg:grid-cols-[2fr_1fr]',
	'2-wide-right': 'lg:grid-cols-[1fr_2fr]',
	'3': 'lg:grid-cols-3',
	'3-wide-center': 'lg:grid-cols-[1fr_2fr_1fr]',
}

const alignClasses: Record<string, string> = {
	start: 'items-start',
	center: 'items-center',
	end: 'items-end',
	stretch: 'items-stretch',
}

const gapClasses: Record<string, string> = {
	none: 'gap-0',
	small: 'gap-4',
	medium: 'gap-8',
	large: 'gap-12 lg:gap-16',
}

const paddingYClasses: Record<string, string> = {
	none: 'py-0',
	small: 'py-4 md:py-8',
	medium: 'py-8 md:py-20',
	large: 'py-12 md:py-28',
}

export default function LayoutBlock({
	layout,
	verticalAlign,
	gap,
	background,
	customBgColor,
	fullBleed,
	paddingY,
	rounded,
	column1,
	column2,
	column3,
	...props
}: Sanity.LayoutBlock) {
	const cleanLayout = stegaClean(layout) || '1'
	const cleanAlign = stegaClean(verticalAlign) || 'start'
	const cleanGap = stegaClean(gap) || 'medium'
	const cleanBg = stegaClean(background) || 'none'
	const cleanPaddingY = stegaClean(paddingY) || 'medium'
	const isFullBleed = stegaClean(fullBleed)
	const isRounded = stegaClean(rounded)
	const cleanCustomBg = stegaClean(customBgColor)

	const hasBg = cleanBg !== 'none'
	const isCustomBg = cleanBg === 'custom' && cleanCustomBg

	const columns = [column1]
	if (cleanLayout !== '1') columns.push(column2)
	if (cleanLayout === '3' || cleanLayout === '3-wide-center')
		columns.push(column3)

	const bgClass = hasBg && !isCustomBg ? bgClasses[cleanBg] : ''
	const customStyle = isCustomBg
		? { backgroundColor: cleanCustomBg }
		: undefined

	if (isFullBleed && hasBg) {
		return (
			<section
				className={cn(
					bgClass,
					paddingYClasses[cleanPaddingY],
					isRounded && 'rounded-2xl overflow-hidden',
				)}
				style={customStyle}
				{...moduleProps(props)}
			>
				<div
					className={cn(
						'mx-auto max-w-screen-2xl px-8 max-md:px-3',
						'grid',
						gridClasses[cleanLayout],
						cleanLayout !== '1' && gapClasses[cleanGap],
						cleanLayout !== '1' && alignClasses[cleanAlign],
					)}
				>
					{columns.map((columnModules, i) => (
						<div key={i} className="min-w-0 space-y-8">
							<Modules modules={columnModules} nested />
						</div>
					))}
				</div>
			</section>
		)
	}

	return (
		<section
			className={cn(
				'section',
				bgClass,
				hasBg && paddingYClasses[cleanPaddingY],
				isRounded && 'rounded-2xl overflow-hidden',
			)}
			style={customStyle}
			{...moduleProps(props)}
		>
			<div
				className={cn(
					'grid',
					gridClasses[cleanLayout],
					cleanLayout !== '1' && gapClasses[cleanGap],
					cleanLayout !== '1' && alignClasses[cleanAlign],
				)}
			>
				{columns.map((columnModules, i) => (
					<div key={i} className="min-w-0 space-y-8">
						<Modules modules={columnModules} nested />
					</div>
				))}
			</div>
		</section>
	)
}
