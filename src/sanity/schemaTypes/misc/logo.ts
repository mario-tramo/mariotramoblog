import { defineField, defineType } from 'sanity'
import { VscVerified } from 'react-icons/vsc'

export default defineType({
	name: 'logo',
	title: 'Logo',
	icon: VscVerified,
	type: 'document',
	fields: [
		defineField({
			name: 'name',
			title: 'Nome',
			description: 'Nome identificativo del logo (es. "Logo principale", "Logo bianco")',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'image',
			title: 'Varianti immagine',
			description: 'Carica le varianti del logo per diversi contesti',
			type: 'object',
			options: {
				columns: 3,
			},
			validation: (Rule) =>
				Rule.custom((value) => {
					const img = value as { default?: unknown; light?: unknown; dark?: unknown } | undefined
					if (!img?.default && !img?.light && !img?.dark) {
						return 'Carica almeno una variante del logo'
					}
					return true
				}),
			fields: [
				defineField({
					name: 'default',
					title: 'Predefinito',
					description: 'Versione standard del logo',
					type: 'image',
					options: {
						hotspot: true,
					},
				}),
				defineField({
					name: 'light',
					title: 'Chiaro',
					description: 'Versione chiara (per sfondi scuri)',
					type: 'image',
					options: {
						hotspot: true,
					},
				}),
				defineField({
					name: 'dark',
					title: 'Scuro',
					description: 'Versione scura (per sfondi chiari)',
					type: 'image',
					options: {
						hotspot: true,
					},
				}),
			],
		}),
	],
	preview: {
		select: {
			title: 'name',
			media: 'image.default',
		},
		prepare: ({ title, media }) => ({
			title,
			subtitle: 'Logo',
			media,
		}),
	},
})
