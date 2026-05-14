import { defineField, defineType } from 'sanity'
import { VscInspect } from 'react-icons/vsc'
import resolveSlug from '@/sanity/lib/resolveSlug'

export default defineType({
	name: 'cta',
	title: 'Call-to-action',
	icon: VscInspect,
	type: 'object',
	fields: [
		defineField({
			name: 'link',
			title: 'Link',
			type: 'link',
			description: 'Link del pulsante',
			validation: (Rule) => Rule.required().error('Il link è obbligatorio per un CTA'),
		}),
		defineField({
			name: 'style',
			title: 'Stile del pulsante',
			type: 'string',
			description: 'Aspetto visivo del pulsante',
			options: {
				list: [
					{ title: 'Pieno (principale)', value: 'action' },
					{ title: 'Contorno', value: 'action-outline' },
					{ title: 'Fantasma', value: 'ghost' },
					{ title: 'Solo testo', value: 'link' },
				],
			},
		}),
	],
	preview: {
		select: {
			label: 'link.label',
			_type: 'link.internal._type',
			pageTitle: 'link.internal.title',
			internal: 'link.internal.metadata.slug.current',
			params: 'link.params',
			external: 'link.external',
		},
		prepare: ({ label, pageTitle, ...props }) => ({
			title: label || pageTitle,
			subtitle: resolveSlug(props),
		}),
	},
})
