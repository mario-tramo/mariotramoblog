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
				{ type: 'quoteBlock' },
				defineArrayMember({
					title: 'Blocco di codice',
					type: 'code',
					options: {
						withFilename: true,
					},
				}),
				{ type: 'custom-html' },
				{ type: 'videoEmbed' },
				{ type: 'socialEmbed' },
			],
			validation: (Rule) => Rule.required().min(1).error('Il corpo dell\'articolo è obbligatorio'),
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
			validation: (Rule) => Rule.required().min(1).warning('Aggiungi almeno una categoria per organizzare l\'articolo'),
			group: 'content',
		}),
		defineField({
			name: 'authors',
			title: 'Autori',
			description: 'Chi ha scritto questo articolo',
			type: 'array',
			of: [{ type: 'reference', to: [{ type: 'person' }] }],
			validation: (Rule) => Rule.required().min(1).warning('Aggiungi almeno un autore'),
			group: 'content',
		}),
		defineField({
			name: 'publishDate',
			title: 'Data di pubblicazione',
			description: 'Data e ora in cui l\'articolo viene pubblicato sul sito',
			type: 'datetime',
			options: {
				dateFormat: 'DD/MM/YYYY',
				timeFormat: 'HH:mm',
				timeStep: 1,
			},
			validation: (Rule) => Rule.required().error('La data di pubblicazione è obbligatoria'),
			group: 'content',
		}),
		defineField({
			name: 'featured',
			title: 'In evidenza',
			description: 'Metti in risalto questo articolo nella homepage del blog (verrà mostrato per primo)',
			type: 'boolean',
			group: 'options',
			initialValue: false,
		}),
		defineField({
			name: 'hideTableOfContents',
			title: 'Nascondi indice dei contenuti',
			description: 'Se attivo, nasconde l\'indice automatico generato dai titoli dell\'articolo',
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
