import { defineField, defineType } from 'sanity'
import { VscEdit } from 'react-icons/vsc'

export default defineType({
	name: 'blog-post-content',
	title: 'Contenuto articolo',
	icon: VscEdit,
	type: 'object',
	fields: [
		defineField({
			name: 'options',
			title: 'Opzioni modulo',
			type: 'module-options',
			description: 'Impostazioni generali del modulo (visibilità, ancoraggio)',
		}),
	],
	preview: {
		select: {
			uid: 'options.uid',
		},
		prepare: ({ uid }) => ({
			title: 'Contenuto articolo',
			subtitle: uid ? `#${uid}` : 'Mostra il corpo dell\'articolo blog',
		}),
	},
})
