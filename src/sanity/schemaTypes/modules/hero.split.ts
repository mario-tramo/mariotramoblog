import { defineArrayMember, defineField, defineType } from 'sanity'
import { TfiLayoutMediaLeft } from 'react-icons/tfi'
import { getBlockText } from '@/lib/utils'

export default defineType({
	name: 'hero.split',
	title: 'Hero (split)',
	icon: TfiLayoutMediaLeft,
	type: 'object',
	groups: [{ name: 'content', title: 'Contenuto', default: true }, { name: 'asset', title: 'Risorsa' }],
	fields: [
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
			description: 'Immagine, codice o HTML mostrato accanto al contenuto (max 1)',
			of: [
				{ type: 'img' },
				defineArrayMember({
					title: 'Blocco di codice',
					type: 'code',
					options: {
						withFilename: true,
					},
				}),
				{ type: 'custom-html' },
			],
			validation: (Rule) => Rule.max(1),
			group: 'asset',
		}),
		defineField({
			name: 'assetOnRight',
			title: 'Risorsa a destra',
			type: 'boolean',
			description: 'Mostra la risorsa a destra del contenuto su desktop',
			initialValue: false,
			group: 'asset',
		}),
		defineField({
			name: 'assetBelowContent',
			title: 'Risorsa sotto il contenuto',
			type: 'boolean',
			description: 'Mostra la risorsa sotto il contenuto su mobile',
			initialValue: false,
			group: 'asset',
		}),
	],
	preview: {
		select: {
			content: 'content',
			media: 'assets.0.image',
		},
		prepare: ({ content, media }) => ({
			title: getBlockText(content),
			subtitle: 'Hero (split)',
			media,
		}),
	},
})
