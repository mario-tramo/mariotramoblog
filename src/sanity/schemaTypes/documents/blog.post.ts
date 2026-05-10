import { defineArrayMember, defineField, defineType } from 'sanity'
import { VscEdit } from 'react-icons/vsc'
import { imageBlock, admonition } from '../fragments'

export default defineType({
	name: 'blog.post',
	title: 'Articolo blog',
	icon: VscEdit,
	type: 'document',
	groups: [
		{ name: 'content', title: 'Contenuto', default: true },
		{ name: 'options', title: 'Opzioni' },
		{ name: 'metadata', title: 'SEO e Metadati' },
	],
	fields: [
		defineField({
			name: 'body',
			title: 'Corpo dell\'articolo',
			description: 'Il contenuto principale dell\'articolo. Puoi aggiungere testo, immagini, avvisi e codice.',
			type: 'array',
			of: [
				{ type: 'block' },
				imageBlock,
				admonition,
				defineArrayMember({
					title: 'Blocco di codice',
					type: 'code',
					options: {
						withFilename: true,
					},
				}),
				{ type: 'custom-html' },
			],
			group: 'content',
		}),
		defineField({
			name: 'categories',
			title: 'Categorie',
			description: 'Categorie dell\'articolo (es. Calcio, Tennis, Formula 1)',
			type: 'array',
			of: [
				{
					type: 'reference',
					to: [{ type: 'blog.category' }],
				},
			],
			group: 'content',
		}),
		defineField({
			name: 'author',
			title: 'Autore',
			description: 'Chi ha scritto questo articolo',
			type: 'reference',
			to: [{ type: 'person' }],
			group: 'content',
		}),
		defineField({
			name: 'publishDate',
			title: 'Data di pubblicazione',
			description: 'Data in cui l\'articolo viene pubblicato',
			type: 'date',
			validation: (Rule) => Rule.required(),
			group: 'content',
		}),
		defineField({
			name: 'featured',
			title: 'In evidenza',
			description: 'Metti in risalto questo articolo nella homepage del blog',
			type: 'boolean',
			group: 'options',
			initialValue: false,
		}),
		defineField({
			name: 'hideTableOfContents',
			title: 'Nascondi indice',
			description: 'Nasconde l\'indice automatico dei contenuti dall\'articolo',
			type: 'boolean',
			group: 'options',
			initialValue: false,
		}),
		defineField({
			name: 'metadata',
			type: 'metadata',
			group: 'metadata',
		}),
		defineField({
			name: 'language',
			type: 'string',
			readOnly: true,
			hidden: true,
		}),
	],
	preview: {
		select: {
			featured: 'featured',
			title: 'metadata.title',
			publishDate: 'publishDate',
			language: 'language',
			image: 'metadata.image',
		},
		prepare: ({ featured, title, publishDate, image, language }) => ({
			title: [featured && '★', title].filter(Boolean).join(' '),
			subtitle: [language && `[${language}] `, publishDate]
				.filter(Boolean)
				.join(''),
			media: image,
		}),
	},
	orderings: [
		{
			title: 'Data',
			name: 'date',
			by: [{ field: 'publishDate', direction: 'desc' }],
		},
		{
			title: 'Titolo',
			name: 'metadata.title',
			by: [{ field: 'title', direction: 'asc' }],
		},
	],
})
