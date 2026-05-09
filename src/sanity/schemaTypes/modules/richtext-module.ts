import { defineArrayMember, defineField, defineType } from 'sanity'
import { VscSymbolKeyword } from 'react-icons/vsc'
import { imageBlock, admonition } from '../fragments'
import { getBlockText } from '@/lib/utils'

export default defineType({
	name: 'richtext-module',
	title: 'Testo ricco',
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
			group: 'content',
		}),
		defineField({
			name: 'tableOfContents',
			title: 'Indice dei contenuti',
			type: 'boolean',
			description: 'Mostra un indice dei contenuti basato sui titoli',
			initialValue: false,
			group: 'options',
		}),
		defineField({
			name: 'tocPosition',
			title: 'Posizione indice',
			type: 'string',
			description: "Posizione dell'indice dei contenuti",
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
			description: 'Espandi il contenuto a tutta la larghezza disponibile',
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
