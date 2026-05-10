import { defineField, defineType } from 'sanity'
import { VscLink } from 'react-icons/vsc'
import resolveSlug from '@/sanity/lib/resolveSlug'

export default defineType({
	name: 'link',
	title: 'Link',
	icon: VscLink,
	type: 'object',
	options: {
		columns: 2,
	},
	fields: [
		defineField({
			name: 'label',
			title: 'Etichetta',
			type: 'string',
			description: 'Testo mostrato per il link',
		}),
		defineField({
			name: 'type',
			title: 'Tipo',
			type: 'string',
			description: 'Tipo di link',
			options: {
				layout: 'radio',
				list: [
					{ title: 'Interno', value: 'internal' },
					{ title: 'Esterno', value: 'external' },
				],
			},
		}),
		defineField({
			name: 'internal',
			title: 'Interno',
			type: 'reference',
			description: 'Seleziona una pagina o articolo del sito',
			to: [{ type: 'page' }, { type: 'blog.post' }, { type: 'legal' }],
			hidden: ({ parent }) => parent?.type !== 'internal',
		}),
		defineField({
			name: 'external',
			title: 'Esterno',
			placeholder: 'https://example.com',
			type: 'url',
			description: 'URL esterno (es. https://...)',
			validation: (Rule) =>
				Rule.uri({
					scheme: ['http', 'https', 'mailto', 'tel'],
					allowRelative: true,
				}),
			hidden: ({ parent }) => parent?.type !== 'external',
		}),
		defineField({
			name: 'params',
			title: 'Parametri URL',
			placeholder: 'es. #jump-link o ?foo=bar',
			type: 'string',
			description: 'Parametri aggiuntivi URL (es. #sezione o ?filtro=valore)',
			hidden: ({ parent }) => parent?.type !== 'internal',
		}),
	],
	preview: {
		select: {
			label: 'label',
			_type: 'internal._type',
			title: 'internal.title',
			internal: 'internal.metadata.slug.current',
			params: 'params',
			external: 'external',
		},
		prepare: ({ label, title, _type, internal, params, external }) => ({
			title: label || title,
			subtitle: resolveSlug({ _type, internal, params, external }),
		}),
	},
})
