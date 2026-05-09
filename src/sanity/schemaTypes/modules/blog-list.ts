import { defineField, defineType } from 'sanity'
import { VscEdit } from 'react-icons/vsc'
import { getBlockText } from '@/lib/utils'

export default defineType({
	name: 'blog-list',
	title: 'Lista articoli',
	icon: VscEdit,
	type: 'object',
	groups: [
		{ name: 'content', title: 'Contenuto', default: true },
		{ name: 'filtering', title: 'Filtri' },
		{ name: 'options', title: 'Opzioni' },
	],
	fields: [
		defineField({
			name: 'options',
			title: 'Opzioni modulo',
			type: 'module-options',
			description: 'Impostazioni generali del modulo (visibilita, ancoraggio)',
			group: 'options',
		}),
		defineField({
			name: 'pretitle',
			title: 'Sopratitolo',
			type: 'string',
			description: 'Testo breve mostrato sopra il titolo della sezione',
			group: 'content',
		}),
		defineField({
			name: 'intro',
			title: 'Introduzione',
			type: 'array',
			description: 'Testo introduttivo mostrato sopra la lista degli articoli',
			of: [{ type: 'block' }],
			group: 'content',
		}),
		defineField({
			name: 'layout',
			title: 'Layout',
			type: 'string',
			description: 'Disposizione visiva degli articoli',
			options: {
				list: [
					{ title: 'Griglia', value: 'grid' },
					{ title: 'Carosello', value: 'carousel' },
				],
				layout: 'radio',
			},
			initialValue: 'carousel',
			group: 'options',
		}),
		defineField({
			name: 'showFeaturedPostsFirst',
			title: 'Mostra prima i post in evidenza',
			type: 'boolean',
			initialValue: true,
			group: 'filtering',
		}),
		defineField({
			name: 'displayFilters',
			title: 'Mostra i filtri per categoria',
			description: 'Permette il filtraggio dei post per categoria nella pagina',
			type: 'boolean',
			initialValue: false,
			group: 'filtering',
			hidden: ({ parent }) => !!parent.filteredCategory,
		}),
		defineField({
			name: 'limit',
			title: 'Numero di post da mostrare',
			description: 'Lascia vuoto per mostrare tutti i post',
			type: 'number',
			initialValue: 6,
			validation: (Rule) => Rule.min(1).integer(),
			group: 'filtering',
		}),
		defineField({
			name: 'filteredCategory',
			title: 'Filtra i post per categoria',
			description: 'Lascia vuoto per mostrare tutti i post',
			type: 'reference',
			to: [{ type: 'blog.category' }],
			group: 'filtering',
		}),
	],
	preview: {
		select: {
			intro: 'intro',
		},
		prepare: ({ intro }) => ({
			title: getBlockText(intro),
			subtitle: 'Blog list',
		}),
	},
})
