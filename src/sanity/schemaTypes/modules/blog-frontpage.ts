import { defineField, defineType } from 'sanity'
import { ImNewspaper } from 'react-icons/im'

export default defineType({
	name: 'blog-frontpage',
	title: 'Homepage blog',
	icon: ImNewspaper,
	type: 'object',
	fields: [
		defineField({
			name: 'mainPost',
			title: 'Articolo principale',
			description: 'Scegli quale articolo mostrare in evidenza nella parte superiore',
			type: 'string',
			options: {
				list: [
					{ title: 'Articolo piu recente', value: 'recent' },
					{ title: 'Articolo in evidenza', value: 'featured' },
				],
				layout: 'radio',
			},
		}),
		defineField({
			name: 'showFeaturedPostsFirst',
			title: 'Mostra prima gli articoli in evidenza',
			description: "Nella lista sotto l'articolo principale",
			type: 'boolean',
			initialValue: true,
		}),
		defineField({
			name: 'itemsPerPage',
			title: 'Elementi per pagina',
			type: 'number',
			description: 'Numero di articoli mostrati per ogni pagina',
			initialValue: 6,
			validation: (Rule) => Rule.required().min(1),
		}),
	],
	preview: {
		select: {
			mainPost: 'mainPost',
		},
		prepare: ({ mainPost }) => ({
			title: 'Blog frontpage',
			subtitle: `Main post: ${mainPost}`,
		}),
	},
})
