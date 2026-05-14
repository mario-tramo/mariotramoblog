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
			description: 'Percorso URL generato dal nome (es. /autori/mario-rossi)',
			options: {
				source: 'name',
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'image',
			title: 'Foto profilo',
			type: 'image',
			description: 'Foto dell\'autore mostrata negli articoli e nella pagina profilo',
			options: {
				hotspot: true,
			},
			validation: (Rule) => Rule.required().warning('Aggiungi una foto profilo per una migliore presentazione'),
		}),
		defineField({
			name: 'bio',
			title: 'Bio',
			type: 'text',
			rows: 3,
			description: 'Breve descrizione dell\'autore mostrata alla fine degli articoli',
		}),
	],
	preview: {
		select: {
			title: 'name',
			media: 'image',
		},
	},
})
