import { defineField, defineType } from 'sanity'
import { BsBarChartSteps } from 'react-icons/bs'
import { count } from '@/lib/utils'

export default defineType({
	name: 'breadcrumbs',
	title: 'Breadcrumb',
	icon: BsBarChartSteps,
	type: 'object',
	fields: [
		defineField({
			name: 'crumbs',
			title: 'Percorso',
			type: 'array',
			of: [{ type: 'link', initialValue: { type: 'internal' } }],
			description: 'La pagina corrente viene inclusa automaticamente',
		}),
		defineField({
			name: 'hideCurrent',
			title: 'Nascondi pagina corrente',
			type: 'boolean',
			description: 'Non mostrare la pagina corrente nel percorso',
			initialValue: false,
		}),
	],
	preview: {
		select: {
			crumbs: 'crumbs',
		},
		prepare: ({ crumbs }) => ({
			title: count(crumbs, 'crumb') + ' + Current page',
			subtitle: 'Breadcrumbs',
		}),
	},
})
