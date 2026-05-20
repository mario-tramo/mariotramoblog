import { defineField, defineType } from 'sanity'
import { TfiLayoutGrid3Alt } from 'react-icons/tfi'

export default defineType({
	name: 'latest-news',
	title: 'Ultime Notizie',
	icon: TfiLayoutGrid3Alt,
	type: 'object',
	fields: [
		defineField({
			name: 'options',
			title: 'Opzioni modulo',
			type: 'module-options',
		}),
		defineField({
			name: 'title',
			title: 'Titolo sezione',
			type: 'string',
			initialValue: 'Latest News',
		}),
		defineField({
			name: 'limit',
			title: 'Numero articoli',
			type: 'number',
			initialValue: 6,
			validation: (Rule) => Rule.min(2).max(12),
		}),
	],
	preview: {
		select: { title: 'title', limit: 'limit' },
		prepare: ({ title, limit }) => ({
			title: title || 'Ultime Notizie',
			subtitle: `${limit || 6} articoli`,
		}),
	},
})
