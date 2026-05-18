import { defineArrayMember, defineField, defineType } from 'sanity'
import { TfiLayoutMediaLeftAlt } from 'react-icons/tfi'
import { getBlockText } from '@/lib/utils'
import { count } from '@/lib/utils'

export default defineType({
	name: 'card-list',
	title: 'Card',
	icon: TfiLayoutMediaLeftAlt,
	type: 'object',
	groups: [{ name: 'content', title: 'Contenuto', default: true }, { name: 'options', title: 'Opzioni' }],
	fields: [
		defineField({
			name: 'options',
			title: 'Opzioni modulo',
			type: 'module-options',
			description: 'Impostazioni generali del modulo (visibilita, ancoraggio)',
			group: 'options',
		}),
		defineField({
			name: 'pretitle',
			title: 'Sopratitolo',
			type: 'string',
			description: 'Testo breve mostrato sopra il titolo della sezione',
			group: 'content',
		}),
		defineField({
			name: 'intro',
			title: 'Introduzione',
			type: 'array',
			description: 'Testo introduttivo mostrato sopra le card',
			of: [{ type: 'block' }],
			group: 'content',
		}),
		defineField({
			name: 'ctas',
			title: 'Call-to-action',
			type: 'array',
			description: 'Pulsanti di azione della sezione',
			of: [{ type: 'cta' }],
			group: 'content',
		}),
		defineField({
			name: 'cards',
			title: 'Card',
			type: 'array',
			description: 'Lista di card con immagine, testo e pulsanti',
			of: [
				defineArrayMember({
					type: 'object',
					name: 'card',
					fields: [
						defineField({
							name: 'image',
							title: 'Immagine',
							type: 'image',
							description: 'Immagine della card',
							options: {
								hotspot: true,
							},
						}),
						defineField({
							name: 'content',
							title: 'Contenuto',
							type: 'array',
							description: 'Testo della card',
							of: [{ type: 'block' }],
						}),
						defineField({
							name: 'ctas',
							title: 'Call-to-action',
							type: 'array',
							description: 'Pulsanti della card',
							of: [{ type: 'cta' }],
						}),
					],
					preview: {
						select: {
							image: 'image',
							content: 'content',
						},
						prepare: ({ image, content }) => ({
							title: getBlockText(content),
							media: image,
						}),
					},
				}),
			],
			validation: (Rule) => Rule.required().min(1).error('Aggiungi almeno una card'),
			group: 'content',
		}),
		defineField({
			name: 'layout',
			title: 'Layout',
			type: 'string',
			description: 'Disposizione visiva delle card',
			options: {
				list: [
					{ title: 'Griglia', value: 'grid' },
					{ title: 'Carosello', value: 'carousel' },
				],
				layout: 'radio',
			},
			group: 'options',
			initialValue: 'carousel',
		}),
		defineField({
			name: 'columns',
			title: 'Colonne',
			type: 'number',
			description: 'Numero fisso di colonne (solo tablet e desktop)',
			validation: (Rule) => Rule.min(1).max(12),
			group: 'options',
		}),
		defineField({
			name: 'visualSeparation',
			title: 'Separazione visiva',
			type: 'boolean',
			description: 'Aggiungi bordi o ombreggiature per separare visivamente le card',
			initialValue: true,
			group: 'options',
		}),
	],
	preview: {
		select: {
			intro: 'intro',
			cards: 'cards',
		},
		prepare: ({ intro, cards }) => ({
			title: getBlockText(intro) || count(cards, 'card'),
			subtitle: 'Lista card',
		}),
	},
})
