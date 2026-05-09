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
		}),
		defineField({
			name: 'style',
			title: 'Stile',
			type: 'string',
			description: 'Stile visivo del pulsante',
			options: {
				list: [
					'action',
					{ title: 'Contorno', value: 'action-outline' },
					'ghost',
					'link',
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
