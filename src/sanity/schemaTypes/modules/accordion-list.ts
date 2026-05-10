import { defineArrayMember, defineField, defineType } from 'sanity'
import { TfiLayoutAccordionMerged } from 'react-icons/tfi'
import { getBlockText } from '@/lib/utils'
import { imageBlock } from '../fragments'

export default defineType({
	name: 'accordion-list',
	title: 'Lista accordion',
	type: 'object',
	icon: TfiLayoutAccordionMerged,
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
			description: 'Testo introduttivo mostrato sopra gli accordion',
			of: [{ type: 'block' }],
			group: 'content',
		}),
		defineField({
			name: 'items',
			title: 'Elementi',
			type: 'array',
			description: 'Lista di pannelli espandibili (domanda/risposta, FAQ, ecc.)',
			of: [
				defineArrayMember({
					type: 'object',
					name: 'accordion',
					icon: TfiLayoutAccordionMerged,
					fields: [
						defineField({
							name: 'summary',
							title: 'Titolo del pannello',
							type: 'string',
							description: 'Testo sempre visibile, cliccabile per aprire/chiudere (es. "Come mi iscrivo?")',
							validation: (Rule) => Rule.required().error('Il titolo del pannello è obbligatorio'),
						}),
						defineField({
							name: 'content',
							title: 'Contenuto',
							type: 'array',
							description: 'Testo e contenuti mostrati quando il pannello è aperto',
							of: [
								{ type: 'block' },
								imageBlock,
								defineArrayMember({
									title: 'Blocco di codice',
									type: 'code',
									options: {
										withFilename: true,
									},
								}),
								{ type: 'custom-html' },
							],
						}),
						defineField({
							name: 'open',
							title: 'Aperto di default',
							type: 'boolean',
							description: 'Se attivo, questo pannello sarà già aperto quando la pagina viene caricata',
							initialValue: false,
						}),
					],
					preview: {
						select: {
							title: 'summary',
							content: 'content',
						},
						prepare: ({ title, content }) => ({
							title,
							subtitle: getBlockText(content),
						}),
					},
				}),
			],
			group: 'content',
		}),
		defineField({
			name: 'layout',
			title: 'Layout',
			type: 'string',
			description: 'Disposizione degli accordion nella pagina',
			options: {
				layout: 'radio',
				list: [
					{ title: 'Verticale', value: 'vertical' },
					{ title: 'Orizzontale', value: 'horizontal' },
				],
			},
			initialValue: 'vertical',
			group: 'options',
		}),
		defineField({
			name: 'connect',
			title: 'Un solo pannello aperto alla volta',
			description: 'Se attivo, aprire un pannello chiude automaticamente quello precedente',
			type: 'boolean',
			initialValue: false,
			group: 'options',
		}),
		defineField({
			name: 'generateSchema',
			title: 'Genera markup Schema.org (FAQ)',
			type: 'boolean',
			description: 'Attiva se questo accordion contiene domande e risposte (FAQ). Migliora la visibilità nei risultati di Google.',
			initialValue: false,
			group: 'options',
		}),
	],
	preview: {
		select: {
			intro: 'intro',
		},
		prepare: ({ intro }) => ({
			title: getBlockText(intro) || 'Lista accordion',
			subtitle: 'Pannelli espandibili',
		}),
	},
})
