import { defineField, defineType } from 'sanity'
import { VscMegaphone } from 'react-icons/vsc'

export default defineType({
	name: 'editorial-banner',
	title: 'Banner editoriale',
	icon: VscMegaphone,
	type: 'object',
	groups: [
		{ name: 'content', title: 'Contenuto', default: true },
		{ name: 'style', title: 'Stile' },
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
			name: 'preset',
			title: 'Categoria visiva',
			type: 'string',
			options: {
				list: [
					{ title: 'Analisi — Viola', value: 'analisi-violet' },
					{ title: 'Analisi — Blu', value: 'analisi-blue' },
					{ title: 'Analisi — Indaco', value: 'analisi-indigo' },
					{ title: 'Calcio — Verde', value: 'calcio-green' },
					{ title: 'Calcio — Blu', value: 'calcio-blue' },
					{ title: 'Calcio — Ambra', value: 'calcio-amber' },
					{ title: 'F1 — Rosso', value: 'f1-red' },
					{ title: 'F1 — Argento', value: 'f1-silver' },
					{ title: 'F1 — Arancione', value: 'f1-orange' },
					{ title: 'Tennis — Terra', value: 'tennis-clay' },
					{ title: 'Tennis — Erba', value: 'tennis-grass' },
					{ title: 'Tennis — Cemento', value: 'tennis-hard' },
					{ title: 'Basket — NBA', value: 'basket-nba' },
					{ title: 'Basket — Lakers', value: 'basket-lakers' },
					{ title: 'Basket — Bulls', value: 'basket-bulls' },
				],
				layout: 'dropdown',
			},
			initialValue: 'calcio-blue',
			group: 'style',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'category',
			title: 'Etichetta categoria',
			type: 'string',
			description: 'Es. "Match Report", "L\'Analisi del Giorno"',
			group: 'content',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'title',
			title: 'Titolo',
			type: 'string',
			group: 'content',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'subtitle',
			title: 'Sottotitolo',
			type: 'string',
			group: 'content',
		}),
		defineField({
			name: 'author',
			title: 'Autore',
			type: 'string',
			group: 'content',
		}),
		defineField({
			name: 'timeAgo',
			title: 'Tempo relativo',
			type: 'string',
			description: 'Es. "1 ora fa", "3 giorni fa"',
			group: 'content',
		}),
		defineField({
			name: 'ctaText',
			title: 'Testo pulsante',
			type: 'string',
			initialValue: 'LEGGI',
			group: 'content',
		}),
		defineField({
			name: 'ctaLink',
			title: 'Link pulsante',
			type: 'link',
			group: 'content',
		}),
	],
	preview: {
		select: {
			title: 'title',
			subtitle: 'category',
			preset: 'preset',
		},
		prepare: ({ title, subtitle, preset }) => ({
			title: title || 'Banner editoriale',
			subtitle: [subtitle, preset].filter(Boolean).join(' · '),
		}),
	},
})
