import { defineField, defineType } from 'sanity'
import { VscTag } from 'react-icons/vsc'

export default defineType({
	name: 'blog.category',
	title: 'Categoria blog',
	type: 'document',
	icon: VscTag,
	fields: [
		defineField({
			name: 'title',
			title: 'Titolo',
			type: 'string',
			description: 'Nome della categoria (es. Calcio, Tennis, Formula 1)',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			description: 'Percorso URL generato automaticamente dal titolo',
			options: {
				source: 'title',
			},
			validation: (Rule) => Rule.required(),
		}),
	],
})
