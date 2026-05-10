import { defineField, defineType } from 'sanity'
import { VscFolderOpened } from 'react-icons/vsc'
import { count } from '@/lib/utils'

export default defineType({
	name: 'link.list',
	title: 'Gruppo di link',
	icon: VscFolderOpened,
	type: 'object',
	fields: [
		defineField({
			name: 'link',
			title: 'Link principale',
			type: 'link',
			description: 'Intestazione del gruppo, cliccabile come link (facoltativo)',
		}),
		defineField({
			name: 'links',
			title: 'Sotto-link',
			type: 'array',
			description: 'Voci del gruppo mostrate sotto l\'intestazione',
			of: [{ type: 'link' }],
			validation: (Rule) => Rule.required().min(1).error('Aggiungi almeno un link al gruppo'),
		}),
	],
	preview: {
		select: {
			link: 'link',
			links: 'links',
		},
		prepare: ({ link, links }) => ({
			title: link.label || link.internal?.title,
			subtitle: count(links, 'link'),
		}),
	},
})
