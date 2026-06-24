import { defineField, defineType } from 'sanity'
import { TfiLayoutCtaCenter } from 'react-icons/tfi'

const LAYOUT_OPTIONS = [
	{
		title: '1 colonna (piena larghezza)',
		value: '1',
	},
	{
		title: '2 colonne (50/50)',
		value: '2',
	},
	{
		title: '2 colonne (largo + stretto)',
		value: '2-wide-left',
	},
	{
		title: '2 colonne (stretto + largo)',
		value: '2-wide-right',
	},
	{
		title: '3 colonne (33/33/33)',
		value: '3',
	},
	{
		title: '3 colonne (stretto + largo + stretto)',
		value: '3-wide-center',
	},
]

const BACKGROUND_OPTIONS = [
	{ title: 'Nessuno', value: 'none' },
	{ title: 'Superficie (cards)', value: 'surface' },
	{ title: 'Soft (respiro)', value: 'soft' },
	{ title: 'Contrasto (quasi nero)', value: 'contrast' },
	{ title: 'Accento', value: 'accent' },
	{ title: 'Scuro', value: 'dark' },
	{ title: 'Personalizzato', value: 'custom' },
]

const PADDING_OPTIONS = [
	{ title: 'Nessuno', value: 'none' },
	{ title: 'Piccolo', value: 'small' },
	{ title: 'Medio', value: 'medium' },
	{ title: 'Grande', value: 'large' },
]

const GAP_OPTIONS = [
	{ title: 'Nessuno', value: 'none' },
	{ title: 'Piccolo', value: 'small' },
	{ title: 'Medio', value: 'medium' },
	{ title: 'Grande', value: 'large' },
]

const layoutLabels: Record<string, string> = {
	'1': '1 colonna',
	'2': '2 colonne',
	'2-wide-left': '2 col (largo + stretto)',
	'2-wide-right': '2 col (stretto + largo)',
	'3': '3 colonne',
	'3-wide-center': '3 col (stretto + largo + stretto)',
}

function columnTitle(index: number) {
	const labels = ['Prima', 'Seconda', 'Terza']
	return `${labels[index]} colonna`
}

function contentModules() {
	return [
		{ type: 'article-carousel' },
		{ type: 'hero' },
		{ type: 'richtext-module' },
		{ type: 'card-list' },
		{ type: 'accordion-list' },
		{ type: 'blog-list' },
		{ type: 'callout' },
		{ type: 'editorial-banner' },
		{ type: 'standings' },
		{ type: 'custom-html' },
		{ type: 'posts-feed' },
		{ type: 'divider' },
		{ type: 'search-module' },
	]
}

export default defineType({
	name: 'layout-block',
	title: 'Layout',
	icon: TfiLayoutCtaCenter,
	type: 'object',
	groups: [
		{ name: 'content', title: 'Contenuto', default: true },
		{ name: 'layout', title: 'Layout' },
		{ name: 'stile', title: 'Stile' },
		{ name: 'options', title: 'Opzioni' },
	],
	fields: [
		defineField({
			name: 'options',
			title: 'Opzioni modulo',
			type: 'module-options',
			group: 'options',
		}),

		// --- Layout ---
		defineField({
			name: 'layout',
			title: 'Disposizione colonne',
			type: 'string',
			description:
				'Scegli come dividere lo spazio. Su mobile tutte le colonne si impilano in verticale.',
			options: {
				list: LAYOUT_OPTIONS,
				layout: 'radio',
			},
			initialValue: '1',
			group: 'layout',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'verticalAlign',
			title: 'Allineamento verticale',
			type: 'string',
			description:
				'Come allineare le colonne quando hanno altezze diverse',
			options: {
				list: [
					{ title: 'In alto', value: 'start' },
					{ title: 'Al centro', value: 'center' },
					{ title: 'In basso', value: 'end' },
					{ title: 'Stessa altezza', value: 'stretch' },
				],
				layout: 'radio',
			},
			initialValue: 'start',
			group: 'layout',
			hidden: ({ parent }) => parent?.layout === '1',
		}),
		defineField({
			name: 'gap',
			title: 'Spazio tra colonne',
			type: 'string',
			options: {
				list: GAP_OPTIONS,
				layout: 'radio',
			},
			initialValue: 'medium',
			group: 'layout',
			hidden: ({ parent }) => parent?.layout === '1',
		}),

		// --- Stile ---
		defineField({
			name: 'background',
			title: 'Sfondo',
			type: 'string',
			options: {
				list: BACKGROUND_OPTIONS,
				layout: 'radio',
			},
			initialValue: 'none',
			group: 'stile',
		}),
		defineField({
			name: 'customBgColor',
			title: 'Colore personalizzato',
			type: 'string',
			description: 'Codice colore HEX (es. #1a1a2e)',
			group: 'stile',
			hidden: ({ parent }) => parent?.background !== 'custom',
		}),
		defineField({
			name: 'fullBleed',
			title: 'Sfondo a tutta larghezza',
			type: 'boolean',
			description:
				'Estendi lo sfondo a tutta larghezza della pagina (il contenuto resta centrato)',
			initialValue: false,
			group: 'stile',
			hidden: ({ parent }) =>
				!parent?.background || parent?.background === 'none',
		}),
		defineField({
			name: 'paddingY',
			title: 'Spaziatura verticale',
			type: 'string',
			options: {
				list: PADDING_OPTIONS,
				layout: 'radio',
			},
			initialValue: 'medium',
			group: 'stile',
		}),
		defineField({
			name: 'rounded',
			title: 'Angoli arrotondati',
			type: 'boolean',
			initialValue: false,
			group: 'stile',
			hidden: ({ parent }) =>
				!parent?.background || parent?.background === 'none',
		}),

		// --- Contenuto colonne ---
		defineField({
			name: 'column1',
			title: columnTitle(0),
			type: 'array',
			description: 'Moduli da mostrare nella prima colonna',
			of: contentModules(),
			group: 'content',
		}),
		defineField({
			name: 'column2',
			title: columnTitle(1),
			type: 'array',
			description: 'Moduli da mostrare nella seconda colonna',
			of: contentModules(),
			group: 'content',
			hidden: ({ parent }) => parent?.layout === '1',
		}),
		defineField({
			name: 'column3',
			title: columnTitle(2),
			type: 'array',
			description: 'Moduli da mostrare nella terza colonna',
			of: contentModules(),
			group: 'content',
			hidden: ({ parent }) => {
				const layout = parent?.layout
				return layout !== '3' && layout !== '3-wide-center'
			},
		}),
	],
	preview: {
		select: {
			layout: 'layout',
			background: 'background',
			col1: 'column1',
			col2: 'column2',
			col3: 'column3',
		},
		prepare: ({ layout, background, col1, col2, col3 }) => {
			const layoutLabel = layoutLabels[layout] || '1 colonna'
			const totalModules =
				(col1?.length || 0) + (col2?.length || 0) + (col3?.length || 0)
			const bgLabel =
				background && background !== 'none' ? ` · sfondo ${background}` : ''

			return {
				title: `Layout — ${layoutLabel}`,
				subtitle: `${totalModules} ${totalModules === 1 ? 'modulo' : 'moduli'}${bgLabel}`,
			}
		},
	},
})
