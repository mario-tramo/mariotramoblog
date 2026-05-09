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
							title: 'Riepilogo',
							type: 'string',
							description: 'Titolo visibile del pannello (cliccabile per espandere)',
						}),
						defineField({
							name: 'content',
							title: 'Contenuto',
							type: 'array',
							description: 'Contenuto mostrato quando il pannello e aperto',
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
							title: 'Aperto',
							type: 'boolean',
							description: 'Se attivo, il pannello sara aperto per impostazione predefinita',
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
			title: 'Collega accordion',
			description: 'Permetti un solo elemento aperto alla volta',
			type: 'boolean',
			initialValue: false,
			group: 'options',
		}),
		defineField({
			name: 'generateSchema',
			title: 'Genera markup Schema.org',
			type: 'boolean',
			description: 'Genera markup Schema.org per la SEO',
			initialValue: false,
			group: 'options',
		}),
	],
	preview: {
		select: {
			intro: 'intro',
		},
		prepare: ({ intro }) => ({
			title: getBlockText(intro),
			subtitle: 'Accordion list',
		}),
	},
})
