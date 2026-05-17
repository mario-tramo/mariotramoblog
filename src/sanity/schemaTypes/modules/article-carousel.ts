import { defineField, defineType } from 'sanity'
import { PiFilmStripLight } from 'react-icons/pi'

export default defineType({
	name: 'article-carousel',
	title: 'Carosello articoli',
	icon: PiFilmStripLight,
	type: 'object',
	groups: [
		{ name: 'content', title: 'Contenuto', default: true },
		{ name: 'options', title: 'Opzioni' },
	],
	fields: [
		defineField({
			name: 'options',
			title: 'Opzioni modulo',
			type: 'module-options',
			group: 'options',
		}),
		defineField({
			name: 'limit',
			title: 'Numero di articoli',
			type: 'number',
			description:
				'Quanti articoli mostrare nel carosello (default: 5)',
			initialValue: 5,
			validation: (Rule) => Rule.min(1).max(20).integer(),
			group: 'content',
		}),
		defineField({
			name: 'showFeaturedFirst',
			title: 'Articoli in evidenza prima',
			type: 'boolean',
			initialValue: true,
			group: 'content',
		}),
		defineField({
			name: 'filteredCategory',
			title: 'Filtra per categoria',
			description: 'Lascia vuoto per mostrare tutti gli articoli',
			type: 'reference',
			to: [{ type: 'blog.category' }],
			group: 'content',
		}),
	],
	preview: {
		select: {
			limit: 'limit',
			category: 'filteredCategory.title',
		},
		prepare: ({ limit, category }) => ({
			title: 'Carosello articoli',
			subtitle: category
				? `${limit || 5} articoli — ${category}`
				: `${limit || 5} articoli`,
		}),
	},
})
