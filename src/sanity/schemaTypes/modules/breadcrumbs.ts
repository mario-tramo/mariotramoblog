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
			title: 'Voci del percorso',
			type: 'array',
			of: [{ type: 'link', initialValue: { type: 'internal' } }],
			description: 'Pagine da mostrare nel percorso di navigazione (es. Home > Blog > Articolo). La pagina corrente viene aggiunta automaticamente.',
		}),
		defineField({
			name: 'hideCurrent',
			title: 'Nascondi pagina corrente',
			type: 'boolean',
			description: 'Se attivo, non mostra la pagina corrente come ultima voce del percorso',
			initialValue: false,
		}),
	],
	preview: {
		select: {
			crumbs: 'crumbs',
		},
		prepare: ({ crumbs }) => ({
			title: count(crumbs, 'voce', 'voci') + ' + Pagina corrente',
			subtitle: 'Breadcrumbs',
		}),
	},
})
