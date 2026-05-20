import { defineField, defineType } from 'sanity'
import { VscSymbolKeyword } from 'react-icons/vsc'

export default defineType({
	name: 'blog.tag',
	title: 'Tag blog',
	type: 'document',
	icon: VscSymbolKeyword,
	fields: [
		defineField({
			name: 'title',
			title: 'Nome tag',
			description:
				'Nome del tag (es. Champions League, Jannik Sinner, VAR). Usa sempre lo stesso formato.',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'slug',
			title: 'Slug',
			description: 'Percorso URL generato automaticamente dal nome',
			type: 'slug',
			options: {
				source: 'title',
			},
			validation: (Rule) => Rule.required(),
		}),
	],
	preview: {
		select: { title: 'title' },
		prepare: ({ title }) => ({
			title,
			subtitle: 'Tag',
		}),
	},
})
