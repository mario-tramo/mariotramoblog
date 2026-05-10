import { defineField, defineType } from 'sanity'
import { VscLaw } from 'react-icons/vsc'
import { imageBlock, admonition } from '../fragments'

export default defineType({
	name: 'legal',
	title: 'Pagina legale',
	icon: VscLaw,
	type: 'document',
	groups: [
		{ name: 'content', title: 'Contenuto', default: true },
		{ name: 'metadata', title: 'SEO e Metadati' },
	],
	fields: [
		defineField({
			name: 'body',
			title: 'Contenuto',
			description:
				'Il contenuto della pagina legale. Puoi aggiungere testo, immagini e avvisi.',
			type: 'array',
			of: [
				{ type: 'block' },
				imageBlock,
				admonition,
				{ type: 'custom-html' },
			],
			validation: (Rule) => Rule.required().min(1).error('Il contenuto è obbligatorio'),
			group: 'content',
		}),
		defineField({
			name: 'lastUpdated',
			title: 'Ultimo aggiornamento',
			description: 'Data dell\'ultimo aggiornamento di questa pagina (mostrata in fondo al testo)',
			type: 'date',
			validation: (Rule) => Rule.required().error('Inserisci la data di aggiornamento'),
			group: 'content',
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
			title: 'metadata.title',
			lastUpdated: 'lastUpdated',
			language: 'language',
		},
		prepare: ({ title, lastUpdated, language }) => ({
			title,
			subtitle: [language && `[${language}] `, lastUpdated]
				.filter(Boolean)
				.join(''),
		}),
	},
	orderings: [
		{
			title: 'Titolo',
			name: 'title',
			by: [{ field: 'metadata.title', direction: 'asc' }],
		},
	],
})
