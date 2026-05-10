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

const sizePresets = presets.map((p) => getPreset(p)).join(', ')

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
			validation: (Rule) => Rule.required().error("L'immagine predefinita è obbligatoria"),
		}),
		defineField({
			name: 'responsive',
			title: 'Immagini responsive',
			type: 'array',
			description: 'Immagini alternative per schermi piccoli o modalità scura (facoltativo)',
			of: [
				defineArrayMember({
					type: 'object',
					name: 'responsive',
					fields: [
						defineField({
							name: 'image',
							title: 'Immagine alternativa',
							type: 'image',
							description: "Immagine da mostrare quando la condizione è soddisfatta",
							options: {
								hotspot: true,
							},
							validation: (Rule) => Rule.required(),
						}),
						defineField({
							name: 'media',
							title: 'Condizione di visualizzazione',
							type: 'string',
							description: 'Quando usare questa immagine (es. su mobile, in modalità scura)',
							placeholder: `es. ${sizePresets}`,
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
			description: "Descrizione dell'immagine per accessibilità e SEO (es. \"Foto di Mario Rossi\")",
			fieldset: 'options',
		}),
		defineField({
			name: 'loading',
			title: 'Caricamento',
			type: 'string',
			description: 'Lazy: carica solo quando visibile (consigliato). Eager: carica subito.',
			options: {
				list: [
					{ title: 'Lazy (consigliato)', value: 'lazy' },
					{ title: 'Eager (carica subito)', value: 'eager' },
				],
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
			title: alt || 'Immagine',
			subtitle: [
				responsive && count(responsive, 'variante responsive', 'varianti responsive'),
				loading && `caricamento: ${loading}`,
			]
				.filter(Boolean)
				.join(' · '),
			media: image,
		}),
	},
})
