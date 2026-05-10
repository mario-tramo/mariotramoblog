import { defineArrayMember, defineField } from 'sanity'
import { IoIosImage } from 'react-icons/io'

export default defineArrayMember({
	type: 'image',
	icon: IoIosImage,
	options: {
		hotspot: true,
		metadata: ['lqip'],
	},
	fieldsets: [
		{ name: 'attributes', title: 'Attributi', options: { columns: 2 } },
		{ name: 'options', title: 'Opzioni' },
	],
	fields: [
		defineField({
			name: 'mediaRef',
			title: 'Da libreria Media',
			type: 'reference',
			to: [{ type: 'media.asset' }],
			description: 'Seleziona un asset dalla libreria Media (alternativo al caricamento diretto sopra)',
			fieldset: 'attributes',
		}),
		defineField({
			name: 'alt',
			title: 'Testo alternativo',
			type: 'string',
			description: "Descrizione dell'immagine per accessibilita e SEO",
			fieldset: 'attributes',
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
			fieldset: 'attributes',
		}),
		defineField({
			name: 'caption',
			title: 'Didascalia',
			type: 'text',
			description: "Testo descrittivo mostrato sotto l'immagine",
			rows: 2,
			fieldset: 'options',
		}),
		defineField({
			name: 'source',
			title: 'Fonte',
			type: 'url',
			description: "URL della fonte originale dell'immagine",
			fieldset: 'options',
		}),
	],
	preview: {
		select: {
			title: 'caption',
			subtitle: 'alt',
			media: 'asset',
		},
	},
})
