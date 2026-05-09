import { defineArrayMember, defineField, defineType } from 'sanity'
import { VscFileMedia } from 'react-icons/vsc'
import {
	getPreset,
	TextInputWithPresets,
	type Preset,
} from '@/sanity/ui/TextInputWithPresets'
import { count } from '@/lib/utils'

const presets: Preset[] = [
	{ title: 'Tablet e inferiori', value: '(width < 48rem)' },
	{ title: 'Solo mobile', value: '(width < 24rem)' },
	{ title: 'Modalita scura', value: '(prefers-color-scheme: dark)' },
]

export default defineType({
	name: 'img',
	title: 'Immagine',
	type: 'object',
	icon: VscFileMedia,
	fieldsets: [{ name: 'options', title: 'Opzioni', options: { columns: 2 } }],
	fields: [
		defineField({
			name: 'image',
			title: 'Immagine predefinita',
			type: 'image',
			description: 'Immagine principale mostrata di default',
			options: {
				hotspot: true,
				metadata: ['lqip'],
			},
		}),
		defineField({
			name: 'responsive',
			title: 'Immagini responsive',
			type: 'array',
			description: 'Immagini alternative per diverse dimensioni di schermo',
			of: [
				defineArrayMember({
					type: 'object',
					name: 'responsive',
					fields: [
						defineField({
							name: 'image',
							type: 'image',
							options: {
								hotspot: true,
							},
							validation: (Rule) => Rule.required(),
						}),
						defineField({
							name: 'media',
							title: 'Media query (condizione)',
							type: 'string',
							placeholder: `e.g. ${presets.map((p) => getPreset(p)).join(', ')}`,
							validation: (Rule) => Rule.required(),
							initialValue: getPreset(presets[0]),
							components: {
								input: (props) => (
									<TextInputWithPresets
										prefix="@media"
										presets={presets}
										{...(props as any)}
									/>
								),
							},
						}),
					],
					preview: {
						select: {
							title: 'media',
							media: 'image',
						},
					},
				}),
			],
		}),
		defineField({
			name: 'alt',
			title: 'Testo alternativo',
			type: 'string',
			description: "Descrizione dell'immagine per accessibilita e SEO",
			fieldset: 'options',
		}),
		defineField({
			name: 'loading',
			title: 'Caricamento',
			type: 'string',
			description: 'lazy = carica quando visibile, eager = carica subito',
			options: {
				list: ['lazy', 'eager'],
				layout: 'radio',
			},
			initialValue: 'lazy',
			fieldset: 'options',
		}),
	],
	preview: {
		select: {
			image: 'image',
			responsive: 'responsive',
			alt: 'alt',
			loading: 'loading',
		},
		prepare: ({ image, responsive, alt, loading = 'lazy' }) => ({
			title: alt,
			subtitle: [
				responsive && count(responsive, 'responsive image'),
				loading && `loading="${loading}"`,
			]
				.filter(Boolean)
				.join(', '),
			media: image,
		}),
	},
})
