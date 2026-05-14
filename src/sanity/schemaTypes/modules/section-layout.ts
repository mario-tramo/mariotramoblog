import { defineField, defineType } from 'sanity'
import { TfiLayoutColumn3 } from 'react-icons/tfi'

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
		value: '2-asymmetric',
	},
	{
		title: '3 colonne (33/33/33)',
		value: '3',
	},
	{
		title: '3 colonne (stretto + largo + stretto)',
		value: '3-asymmetric',
	},
]

const layoutLabels: Record<string, string> = {
	'1': '1 colonna',
	'2': '2 colonne',
	'2-asymmetric': '2 col (largo + stretto)',
	'3': '3 colonne',
	'3-asymmetric': '3 col (stretto + largo + stretto)',
}

function columnTitle(index: number) {
	const labels = ['Prima', 'Seconda', 'Terza']
	return `${labels[index]} colonna`
}

function columnModules() {
	return [
		{ type: 'hero' },
		{ type: 'blog-list' },
		{ type: 'card-list' },
		{ type: 'richtext-module' },
		{ type: 'newsletter-block' },
		{ type: 'standings' },
		{ type: 'accordion-list' },
		{ type: 'callout' },
		{ type: 'custom-html' },
	]
}

export default defineType({
	name: 'section-layout',
	title: 'Sezione a colonne',
	icon: TfiLayoutColumn3,
	type: 'object',
	groups: [
		{ name: 'content', title: 'Contenuto', default: true },
		{ name: 'layout', title: 'Layout' },
		{ name: 'options', title: 'Opzioni' },
	],
	fields: [
		defineField({
			name: 'options',
			title: 'Opzioni modulo',
			type: 'module-options',
			description:
				'Impostazioni generali del modulo (visibilita, ancoraggio)',
			group: 'options',
		}),

		// --- Layout ---
		defineField({
			name: 'layout',
			title: 'Disposizione colonne',
			type: 'string',
			description:
				'Scegli come dividere lo spazio della sezione. Su mobile tutte le colonne si impilano in verticale.',
			options: {
				list: LAYOUT_OPTIONS,
				layout: 'radio',
			},
			initialValue: '2',
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
		}),

		// --- Contenuto colonne ---
		defineField({
			name: 'column1',
			title: columnTitle(0),
			type: 'array',
			description: 'Moduli da mostrare nella prima colonna',
			of: columnModules(),
			group: 'content',
		}),
		defineField({
			name: 'column2',
			title: columnTitle(1),
			type: 'array',
			description: 'Moduli da mostrare nella seconda colonna',
			of: columnModules(),
			group: 'content',
			hidden: ({ parent }) => parent?.layout === '1',
		}),
		defineField({
			name: 'column3',
			title: columnTitle(2),
			type: 'array',
			description: 'Moduli da mostrare nella terza colonna',
			of: columnModules(),
			group: 'content',
			hidden: ({ parent }) => {
				const layout = parent?.layout
				return layout !== '3' && layout !== '3-asymmetric'
			},
		}),
	],
	preview: {
		select: {
			layout: 'layout',
			col1: 'column1',
			col2: 'column2',
			col3: 'column3',
		},
		prepare: ({ layout, col1, col2, col3 }) => {
			const layoutLabel = layoutLabels[layout] || '2 colonne'
			const totalModules =
				(col1?.length || 0) + (col2?.length || 0) + (col3?.length || 0)

			return {
				title: `Sezione a colonne — ${layoutLabel}`,
				subtitle: `${totalModules} ${totalModules === 1 ? 'modulo' : 'moduli'} inseriti`,
			}
		},
	},
})
