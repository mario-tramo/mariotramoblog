import { defineField, defineType } from 'sanity'
import { VscInspect } from 'react-icons/vsc'
import { getBlockText } from '@/lib/utils'

export default defineType({
	name: 'callout',
	title: 'Callout',
	icon: VscInspect,
	type: 'object',
	fields: [
		defineField({
			name: 'content',
			title: 'Contenuto',
			type: 'array',
			description: 'Testo e contenuto del callout',
			of: [{ type: 'block' }, { type: 'code' }],
			validation: (Rule) => Rule.required().min(1).error('Il contenuto del callout è obbligatorio'),
		}),
		defineField({
			name: 'ctas',
			title: 'Call-to-action',
			type: 'array',
			description: 'Pulsanti di azione nel callout',
			of: [{ type: 'cta' }],
		}),
	],
	preview: {
		select: {
			content: 'content',
		},
		prepare: ({ content }) => ({
			title: getBlockText(content),
			subtitle: 'Callout',
		}),
	},
})
