import { defineField, defineType } from 'sanity'
import { TfiLayoutCtaCenter } from 'react-icons/tfi'
import { alignItems, textAlign } from '../fragments'
import { getBlockText } from '@/lib/utils'

export default defineType({
	name: 'hero',
	title: 'Hero',
	icon: TfiLayoutCtaCenter,
	type: 'object',
	groups: [
		{ name: 'content', title: 'Contenuto', default: true },
		{ name: 'asset', title: 'Risorsa' },
		{ name: 'options', title: 'Opzioni' },
	],
	fieldsets: [
		{ name: 'alignment', options: { columns: 2 } },
		{ name: 'image', options: { columns: 2 } },
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
			name: 'pretitle',
			title: 'Sopratitolo',
			type: 'string',
			description: 'Testo breve mostrato sopra il titolo principale',
			group: 'content',
		}),
		defineField({
			name: 'content',
			title: 'Contenuto',
			type: 'array',
			description: 'Testo principale della sezione hero',
			of: [{ type: 'block' }, { type: 'custom-html' }],
			group: 'content',
		}),
		defineField({
			name: 'ctas',
			title: 'Call-to-action',
			type: 'array',
			description: 'Pulsanti di azione mostrati sotto il contenuto',
			of: [{ type: 'cta' }],
			group: 'content',
		}),
		defineField({
			name: 'assets',
			title: 'Risorse',
			type: 'array',
			description: 'Immagine o risorsa visiva della sezione hero (max 1)',
			of: [{ type: 'img' }],
			validation: (Rule) => Rule.max(1),
			group: 'asset',
		}),
		defineField({
			...(alignItems as any),
			fieldset: 'alignment',
			group: 'options',
		}),
		defineField({
			...(textAlign as any),
			fieldset: 'alignment',
			group: 'options',
		}),
	],
	preview: {
		select: {
			content: 'content',
			media: 'assets.0.image',
		},
		prepare: ({ content, media }) => ({
			title: getBlockText(content),
			subtitle: 'Hero',
			media,
		}),
	},
})
