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
			type: 'string',
		}),
		defineField({
			name: 'image',
			title: 'Immagine',
			type: 'object',
			options: {
				columns: 3,
			},
			fields: [
				defineField({
					name: 'default',
					title: 'Predefinito',
					type: 'image',
					options: {
						hotspot: true,
					},
				}),
				defineField({
					name: 'light',
					description: 'Per sfondi scuri',
					type: 'image',
					options: {
						hotspot: true,
					},
				}),
				defineField({
					name: 'dark',
					description: 'Per sfondi chiari',
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
