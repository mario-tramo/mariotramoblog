import { defineField, defineType } from 'sanity'
import { GoPerson } from 'react-icons/go'

export default defineType({
	name: 'person',
	title: 'Persona',
	type: 'document',
	icon: GoPerson,
	fields: [
		defineField({
			name: 'name',
			title: 'Nome',
			type: 'string',
			description: 'Nome e cognome',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			description: 'Percorso URL generato dal nome',
			options: {
				source: 'name',
			},
		}),
		defineField({
			name: 'image',
			title: 'Immagine',
			type: 'image',
			description: 'Foto profilo',
			options: {
				hotspot: true,
			},
		}),
	],
	preview: {
		select: {
			title: 'name',
			media: 'image',
		},
	},
})
