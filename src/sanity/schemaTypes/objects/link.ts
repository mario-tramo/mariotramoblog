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
			validation: (Rule) => Rule.required().error("L'etichetta del link è obbligatoria"),
		}),
		defineField({
			name: 'type',
			title: 'Tipo',
			type: 'string',
			description: 'Tipo di link',
			validation: (Rule) => Rule.required().error('Seleziona il tipo di link'),
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
			to: [{ type: 'page' }, { type: 'blog.post' }, { type: 'blog.category' }, { type: 'legal' }],
			hidden: ({ parent }) => parent?.type !== 'internal',
			validation: (Rule) =>
				Rule.custom((value, context) => {
					const parent = context.parent as { type?: string }
					if (parent?.type === 'internal' && !value) {
						return 'Seleziona una pagina o un articolo'
					}
					return true
				}),
		}),
		defineField({
			name: 'external',
			title: 'Esterno',
			placeholder: 'https://example.com',
			type: 'url',
			description: 'URL esterno (es. https://...)',
			validation: (Rule) => [
				Rule.uri({
					scheme: ['http', 'https', 'mailto', 'tel'],
					allowRelative: true,
				}),
				Rule.custom((value, context) => {
					const parent = context.parent as { type?: string }
					if (parent?.type === 'external' && !value) {
						return "L'URL è obbligatorio per i link esterni"
					}
					return true
				}),
			],
			hidden: ({ parent }) => parent?.type !== 'external',
		}),
		defineField({
			name: 'params',
			title: 'Ancora o parametri',
			placeholder: 'es. #sezione o ?filtro=valore',
			type: 'string',
			description: 'Opzionale. Aggiunge un\'ancora (#sezione) o parametri (?chiave=valore) all\'URL',
			hidden: ({ parent }) => parent?.type !== 'internal',
		}),
	],
	preview: {
		select: {
			label: 'label',
			_type: 'internal._type',
			title: 'internal.title',
			internal: 'internal.metadata.slug.current',
			categorySlug: 'internal.slug.current',
			params: 'params',
			external: 'external',
		},
		prepare: ({ label, title, _type, internal, categorySlug, params, external }) => ({
			title: label || title,
			subtitle: resolveSlug({ _type, internal: internal || categorySlug, params, external }),
		}),
	},
})
