import { defineField, defineType } from 'sanity'
import { VscFileMedia } from 'react-icons/vsc'

export default defineType({
	name: 'media.asset',
	title: 'Media',
	type: 'document',
	icon: VscFileMedia,
	fields: [
		defineField({
			name: 'title',
			title: 'Titolo',
			type: 'string',
			description: 'Nome descrittivo dell\'asset (es. "Hero homepage", "Avatar autore")',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'image',
			title: 'Immagine',
			type: 'image',
			options: {
				hotspot: true,
				metadata: ['lqip'],
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'alt',
			title: 'Testo alternativo',
			type: 'string',
			description: 'Descrizione dell\'immagine per accessibilità e SEO',
		}),
		defineField({
			name: 'category',
			title: 'Categoria',
			type: 'string',
			options: {
				list: [
					{ title: 'Hero / Banner', value: 'hero' },
					{ title: 'Background', value: 'background' },
					{ title: 'Avatar / Profilo', value: 'avatar' },
					{ title: 'Icona', value: 'icon' },
					{ title: 'Social / OG', value: 'social' },
					{ title: 'Generico', value: 'generic' },
				],
			},
		}),
		defineField({
			name: 'tags',
			title: 'Tag',
			type: 'array',
			of: [{ type: 'string' }],
			options: {
				layout: 'tags',
			},
			description: 'Tag per trovare velocemente gli asset (es. "tech", "travel", "food")',
		}),
	],
	preview: {
		select: {
			title: 'title',
			subtitle: 'category',
			media: 'image',
		},
	},
	orderings: [
		{
			title: 'Titolo',
			name: 'titleAsc',
			by: [{ field: 'title', direction: 'asc' }],
		},
		{
			title: 'Categoria',
			name: 'categoryAsc',
			by: [{ field: 'category', direction: 'asc' }],
		},
	],
})
