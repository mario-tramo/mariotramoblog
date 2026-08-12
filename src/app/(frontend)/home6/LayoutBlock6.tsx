import moduleProps from '@/lib/moduleProps'
import Modules from './Modules6'
import { stegaClean } from '@sanity/client/stega'
import { cn } from '@/lib/utils'
import { bgClasses } from '@/lib/bgClasses'
import { getSectionTheme } from '@/lib/sectionBackgrounds'

function firstLabel(modules?: Sanity.Module[]) {
	for (const m of modules ?? []) {
		const { pretitle, title } = (m ?? {}) as {
			pretitle?: string
			title?: string
		}
		if (pretitle || title) return pretitle || title
	}
	return undefined
}

function themeForColumn(modules?: Sanity.Module[]) {
	for (const m of modules ?? []) {
		const { pretitle, title } = (m ?? {}) as {
			pretitle?: string
			title?: string
		}
		const theme = getSectionTheme(pretitle || title)
		if (theme) return theme
	}
	return undefined
}

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
	none: 'pt-2 pb-0',
	small: 'pt-3 pb-6 md:pt-5 md:pb-10',
	medium: 'pt-5 pb-10 md:pt-12 md:pb-24',
	large: 'pt-8 pb-16 md:pt-16 md:pb-32',
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

	// Hardcoded section themes (homepage bands) win over Sanity options.
	// One distinct theme across columns → themed band on the whole block;
	// multiple distinct themes → one themed panel per column.
	const columnThemes = columns.map((col) => themeForColumn(col) || getSectionTheme(firstLabel(col)))
	const distinctThemes = new Set(
		columnThemes.filter(Boolean).map((t) => t!.bg),
	)
	const hasUnthemedColumn = columns.some(
		(column, i) => (column?.length ?? 0) > 0 && !columnThemes[i],
	)
	const splitThemes = distinctThemes.size > 1 || (distinctThemes.size > 0 && hasUnthemedColumn)
	const blockTheme = !splitThemes ? columnThemes.find(Boolean) : undefined

	const hasSectionTheme = !!blockTheme || splitThemes
	const bgClass = !hasSectionTheme && hasBg && !isCustomBg
		? bgClasses[cleanBg]
		: ''
	const customStyle =
		isCustomBg && !blockTheme && !splitThemes
			? { backgroundColor: cleanCustomBg }
			: undefined

	const renderColumn = (columnModules: Sanity.Module[] | undefined, i: number) => (
		<div
			key={i}
			className={cn(
				'min-w-0 space-y-8',
				splitThemes && i === 0 && 'lg:pr-8',
				splitThemes && i > 0 && 'lg:border-l lg:border-white/10 lg:pl-8',
			)}
		>
			<Modules modules={columnModules} nested />
		</div>
	)

	const backgroundLayer = (hasBg || hasSectionTheme) && (
		<div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
			{hasSectionTheme ? (
				splitThemes ? (
					<div className={cn('grid size-full', gridClasses[cleanLayout], 'max-lg:grid-cols-1')}>
						{columns.map((_, i) => (
							<div
								key={i}
								className={cn(
									'size-full min-h-full',
									columnThemes[i]?.bg,
									i > 0 && 'border-l border-white/10',
								)}
							/>
						))}
					</div>
				) : (
					<div className={cn('size-full', blockTheme?.bg)} />
				)
			) : (
				<div className={cn('size-full', bgClass)} />
			)}
		</div>
	)

	if (isFullBleed || blockTheme || splitThemes) {
		return (
			<section
				className={cn(
					'relative min-h-[250px] w-full overflow-hidden',
					blockTheme || splitThemes
						? 'py-8 md:py-12'
						: paddingYClasses[cleanPaddingY],
					isRounded && 'rounded-2xl',
				)}
				style={customStyle}
				{...moduleProps(props)}
			>
				{backgroundLayer}
				<div
					className={cn(
						'relative z-10 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8',
						'grid',
						gridClasses[cleanLayout],
						cleanLayout !== '1' &&
							(splitThemes ? 'gap-0' : gapClasses[cleanGap]),
						cleanLayout !== '1' &&
							(splitThemes
								? 'items-stretch'
								: blockTheme
									? 'items-center'
									: alignClasses[cleanAlign]),
					)}
				>
					{columns.map(renderColumn)}
				</div>
			</section>
		)
	}

	return (
		<section
			className={cn(
				'section relative w-full overflow-hidden',
				(hasBg || blockTheme) && paddingYClasses[cleanPaddingY],
				isRounded && 'rounded-2xl',
			)}
			style={customStyle}
			{...moduleProps(props)}
		>
			{backgroundLayer}
			<div
				className={cn(
					'relative z-10 grid',
					gridClasses[cleanLayout],
					cleanLayout !== '1' && gapClasses[cleanGap],
					cleanLayout !== '1' && alignClasses[cleanAlign],
				)}
			>
				{columns.map(renderColumn)}
			</div>
		</section>
	)
}
