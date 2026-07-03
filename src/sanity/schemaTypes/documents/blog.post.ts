import { defineArrayMember, defineField, defineType } from 'sanity'
import { VscEdit } from 'react-icons/vsc'
import { imageBlock, admonition, publishAt } from '../fragments'
import { PortableTextCharCount } from '@/sanity/ui/PortableTextCharCount'

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
			name: 'title',
			title: 'Titolo',
			description: 'Il titolo principale dell\'articolo e rilevante per SEO. Usa un titolo chiaro e accattivante.',
			type: 'string',
			validation: (Rule) => Rule.required().error('Il titolo è obbligatorio'),
			group: 'content',
		}),
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
			components: {
				input: PortableTextCharCount,
			},
			validation: (Rule) => Rule.required().min(1).error('Il corpo dell\'articolo è obbligatorio'),
			group: 'content',
		}),
		defineField({
			name: 'categories',
			title: 'Categorie',
			description: 'Categorie dell\'articolo (es. Calcio, Tennis, Formula 1). Fondamentale per la navigazione, le URL, la sitemap e il article:section di Open Graph.',
			type: 'array',
			of: [
				{
					type: 'reference',
					to: [{ type: 'blog.category' }],
				},
			],
			validation: (Rule) => Rule.required().min(1).error('Ogni articolo deve avere almeno una categoria — determina la URL, la sezione OG e la sitemap XML'),
			group: 'content',
		}),
		defineField({
			name: 'tags',
			title: 'Tag',
			description:
				'Tag specifici dell\'articolo (es. Champions League, Jannik Sinner, VAR). Usa 3-8 tag per articolo.',
			type: 'array',
			of: [
				{
					type: 'reference',
					to: [{ type: 'blog.tag' }],
				},
			],
			validation: (Rule) => [
				Rule.min(1).warning('Nessun tag selezionato. I tag migliorano la navigazione tra articoli correlati e il keyword targeting semantico.'),
				Rule.max(8).warning('Troppi tag riducono l\'efficacia SEO. Usa almeno 1 e al massimo 8 tag.'),
			],
			group: 'content',
		}),
		defineField({
			name: 'authors',
			title: 'Autori',
			description: 'Chi ha scritto questo articolo',
			type: 'array',
			of: [{ type: 'reference', to: [{ type: 'person' }] }],
			validation: (Rule) => Rule.required().min(1).error('Ogni articolo deve avere almeno un autore'),
			group: 'content',
		}),
		defineField({
			name: 'publishDate',
			title: 'Data di pubblicazione',
			description: 'Data in cui l\'articolo viene pubblicato sul sito',
			type: 'datetime',
			options: {
				dateFormat: 'YYYY-MM-DD',
				timeFormat: 'HH:mm',
			},
			validation: (Rule) => Rule.required().error('La data di pubblicazione è obbligatoria'),
			group: 'content',
		}),
		defineField({
			...publishAt,
			group: 'options',
		}),
		defineField({
			name: 'featured',
			title: 'In evidenza',
			description:
				'Solo gli articoli "In evidenza" vengono mostrati nel carosello della homepage e nei moduli "Article Carousel". Il primo in evidenza diventa "Scelta della Redazione" nella homepage. Il badge "In evidenza" appare sulle card. (Default: true — imposta false per escludere dal carosello e nascondere il badge).',
			type: 'boolean',
			group: 'options',
			initialValue: true,
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
			name: 'preferredSourceBanner',
			title: 'Google Preferred Source',
			description: 'Banner per aggiungere TRMsport tra le fonti preferite di Google',
			type: 'preferredSourceBanner',
			group: 'options',
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
			title: 'title',
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
			name: 'title',
			by: [{ field: 'title', direction: 'asc' }],
		},
	],
})
