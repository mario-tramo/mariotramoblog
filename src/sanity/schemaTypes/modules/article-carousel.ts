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
			name: 'filters',
			title: 'Filtri configurabili',
			description:
				'Configura filtri statici o dinamici (da parametri URL) per categoria, tag o autore',
			type: 'array',
			of: [{ type: 'collection-filter' }],
			group: 'content',
		}),
	],
	preview: {
		select: {
			limit: 'limit',
		},
		prepare: ({ limit }) => ({
			title: 'Carosello articoli',
			subtitle: `${limit || 5} articoli`,
		}),
	},
})
