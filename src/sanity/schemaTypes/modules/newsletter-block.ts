import { defineField, defineType } from 'sanity'
import { MdMailOutline } from 'react-icons/md'

export default defineType({
	name: 'newsletter-block',
	title: 'Newsletter',
	icon: MdMailOutline,
	type: 'object',
	fields: [
		defineField({
			name: 'variant',
			title: 'Variante',
			type: 'string',
			initialValue: 'inline',
			options: {
				list: [
					{ title: 'Hero', value: 'hero' },
					{ title: 'Inline', value: 'inline' },
					{ title: 'Compact', value: 'compact' },
				],
				layout: 'radio',
			},
		}),
		defineField({
			name: 'title',
			title: 'Titolo',
			type: 'string',
		}),
		defineField({
			name: 'description',
			title: 'Descrizione',
			type: 'text',
			rows: 2,
		}),
	],
	preview: {
		select: {
			title: 'title',
			variant: 'variant',
		},
		prepare: ({ title, variant }) => ({
			title: title || 'Newsletter',
			subtitle: `Newsletter — ${variant || 'inline'}`,
		}),
	},
})
