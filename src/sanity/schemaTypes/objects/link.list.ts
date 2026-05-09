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
			description: 'Link principale del gruppo (usato come intestazione)',
		}),
		defineField({
			name: 'links',
			title: 'Sotto-link',
			type: 'array',
			description: 'Lista di link secondari sotto il link principale',
			of: [{ type: 'link' }],
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
