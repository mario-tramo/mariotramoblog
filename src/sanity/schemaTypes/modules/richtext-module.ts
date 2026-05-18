import { defineArrayMember, defineField, defineType } from 'sanity'
import { VscSymbolKeyword } from 'react-icons/vsc'
import { imageBlock, admonition } from '../fragments'
import { getBlockText } from '@/lib/utils'

export default defineType({
	name: 'richtext-module',
	title: 'Testo',
	icon: VscSymbolKeyword,
	type: 'object',
	groups: [
		{ name: 'content', title: 'Contenuto', default: true },
		{ name: 'options', title: 'Opzioni' },
	],
	fields: [
		defineField({
			name: 'options',
			title: 'Opzioni modulo',
			type: 'module-options',
			description: 'Impostazioni generali del modulo (visibilita, ancoraggio)',
			group: 'options',
		}),
		defineField({
			name: 'content',
			title: 'Contenuto',
			type: 'array',
			description: 'Testo ricco con supporto per immagini, avvisi, codice e HTML',
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
			validation: (Rule) => Rule.required().min(1).error('Il contenuto è obbligatorio'),
			group: 'content',
		}),
		defineField({
			name: 'tableOfContents',
			title: 'Mostra indice dei contenuti',
			type: 'boolean',
			description: 'Genera automaticamente un indice laterale basato sui titoli del testo',
			initialValue: false,
			group: 'options',
		}),
		defineField({
			name: 'tocPosition',
			title: 'Posizione indice',
			type: 'string',
			description: "Lato in cui appare l'indice dei contenuti",
			options: {
				list: [
					{ title: 'Sinistra', value: 'left' },
					{ title: 'Destra', value: 'right' },
				],
				layout: 'radio',
			},
			hidden: ({ parent }) => !parent.tableOfContents,
			initialValue: 'right',
			group: 'options',
		}),
		defineField({
			name: 'stretch',
			title: 'Larghezza piena',
			type: 'boolean',
			description: 'Espandi il testo a tutta la larghezza della pagina (disattiva i margini laterali)',
			initialValue: false,
			hidden: ({ parent }) => parent.tableOfContents,
			group: 'options',
		}),
	],
	preview: {
		select: {
			content: 'content',
		},
		prepare: ({ content }) => ({
			title: getBlockText(content),
			subtitle: 'Testo ricco',
		}),
	},
})
