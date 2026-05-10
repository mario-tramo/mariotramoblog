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
			description: 'Titolo principale mostrato sulla slide (es. "Serie A 2024/25")',
			type: 'string',
			validation: (Rule) => Rule.required().max(80).warning('Titolo troppo lungo, potrebbe essere troncato'),
		}),
		defineField({
			name: 'description',
			title: 'Descrizione',
			description: 'Testo breve sotto il titolo (facoltativo)',
			type: 'text',
			rows: 3,
		}),
		defineField({
			name: 'author',
			title: 'Autore',
			description: 'Autore o firma associata a questa slide (facoltativo)',
			type: 'reference',
			to: [{ type: 'person' }],
		}),
		defineField({
			name: 'cta',
			title: 'Pulsante',
			description: 'Pulsante di azione sulla slide (es. "Leggi di più")',
			type: 'cta',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'image',
			title: 'Immagine di sfondo',
			description: 'Immagine principale della slide. Usa immagini orizzontali (16:9 consigliato)',
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
