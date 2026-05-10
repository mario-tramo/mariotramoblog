import { defineField, defineType } from 'sanity'
import { VscLayers } from 'react-icons/vsc'

export default defineType({
	name: 'hero-slide',
	title: 'Slide Hero',
	icon: VscLayers,
	type: 'object',
	fields: [
		defineField({
			name: 'title',
			title: 'Titolo',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'description',
			title: 'Descrizione',
			type: 'text',
			rows: 3,
		}),
		defineField({
			name: 'author',
			title: 'Autore',
			type: 'reference',
			to: [{ type: 'person' }],
		}),
		defineField({
			name: 'cta',
			title: 'Call-to-action',
			type: 'cta',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'image',
			title: 'Immagine di sfondo',
			type: 'image',
			options: { hotspot: true },
			validation: (Rule) => Rule.required(),
		}),
	],
	preview: {
		select: {
			title: 'title',
			media: 'image',
			author: 'author.name',
		},
		prepare: ({ title, media, author }) => ({
			title,
			subtitle: author ? `di ${author}` : undefined,
			media,
		}),
	},
})
