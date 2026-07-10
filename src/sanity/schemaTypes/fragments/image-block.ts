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
		{ name: 'ai', title: 'IA' },
	],
	fields: [
		defineField({
			name: 'mediaRef',
			title: 'Da libreria Media',
			type: 'reference',
			to: [{ type: 'media.asset' }],
			description: 'Seleziona un\'immagine già caricata nella libreria Media invece di caricarne una nuova',
			fieldset: 'attributes',
		}),
		defineField({
			name: 'alt',
			title: 'Testo alternativo',
			type: 'string',
			description: 'Descrizione dell\'immagine per accessibilità e SEO (es. "Foto di Mario Rossi")',
			validation: (Rule) => Rule.required().warning('Aggiungi sempre un testo alternativo per accessibilità e SEO'),
			fieldset: 'attributes',
		}),
		defineField({
			name: 'loading',
			title: 'Caricamento',
			type: 'string',
			description: 'Lazy: carica solo quando visibile (consigliato). Eager: carica subito (per immagini in cima alla pagina).',
			options: {
				list: [
					{ title: 'Lazy (consigliato)', value: 'lazy' },
					{ title: 'Eager (carica subito)', value: 'eager' },
				],
				layout: 'radio',
			},
			initialValue: 'lazy',
			fieldset: 'attributes',
		}),
		defineField({
			name: 'caption',
			title: 'Didascalia',
			type: 'text',
			description: 'Testo descrittivo mostrato sotto l\'immagine (facoltativo)',
			rows: 2,
			fieldset: 'options',
		}),
		defineField({
			name: 'source',
			title: 'Fonte',
			type: 'url',
			description: 'URL della fonte originale dell\'immagine (es. sito del fotografo)',
			fieldset: 'options',
		}),
		defineField({
			name: 'aiGenerated',
			title: 'Generata con IA',
			description: 'Se attivo, viene anteposto "Foto generata usando IA." alla didascalia',
			type: 'boolean',
			initialValue: true,
			fieldset: 'ai',
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
