import { defineField, defineType } from 'sanity'
import { ImNewspaper } from 'react-icons/im'

export default defineType({
	name: 'blog-frontpage',
	title: 'Homepage blog',
	icon: ImNewspaper,
	type: 'object',
	description: 'Layout a 3 colonne stile giornale con notizie, sidebar e trending',
	fields: [
		defineField({
			name: 'slides',
			title: 'Slides carosello',
			type: 'array',
			description:
				'Se presenti, il carosello Hero sostituisce la griglia "Articoli in evidenza" al centro.',
			of: [{ type: 'hero-slide' }],
		}),
		defineField({
			name: 'mainPost',
			title: 'Articolo principale',
			description: 'Quale articolo mostrare in grande nella parte superiore della pagina blog',
			type: 'string',
			options: {
				list: [
					{ title: 'Il più recente', value: 'recent' },
					{ title: 'Quello marcato "In evidenza"', value: 'featured' },
				],
				layout: 'radio',
			},
			initialValue: 'recent',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'showFeaturedPostsFirst',
			title: 'Articoli in evidenza prima',
			description: 'Mostra gli articoli marcati "In evidenza" in cima alla lista, prima degli altri',
			type: 'boolean',
			initialValue: true,
		}),
		defineField({
			name: 'itemsPerPage',
			title: 'Articoli per pagina',
			type: 'number',
			description: 'Quanti articoli mostrare per ogni pagina (es. 6, 9, 12)',
			initialValue: 6,
			validation: (Rule) => Rule.required().min(1).max(50).integer().error('Inserisci un numero tra 1 e 50'),
		}),
	],
	preview: {
		select: {
			mainPost: 'mainPost',
		},
		prepare: ({ mainPost }) => ({
			title: 'Homepage blog',
			subtitle: mainPost === 'featured' ? 'Articolo in evidenza in primo piano' : 'Articolo più recente in primo piano',
		}),
	},
})
