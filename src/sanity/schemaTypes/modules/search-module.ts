import { defineField, defineType } from 'sanity'
import { VscSearch } from 'react-icons/vsc'
import { getBlockText } from '@/lib/utils'

export default defineType({
	name: 'search-module',
	title: 'Ricerca',
	icon: VscSearch,
	type: 'object',
	groups: [{ name: 'content', title: 'Contenuto', default: true }, { name: 'options', title: 'Opzioni' }],
	fields: [
		defineField({
			name: 'pretitle',
			title: 'Sopratitolo',
			type: 'string',
			description: 'Testo breve mostrato sopra il titolo della sezione',
			group: 'content',
		}),
		defineField({
			name: 'intro',
			title: 'Introduzione',
			type: 'array',
			description: 'Testo introduttivo mostrato sopra la barra di ricerca',
			of: [{ type: 'block' }],
			group: 'content',
		}),
		defineField({
			name: 'ctas',
			title: 'Call-to-action',
			type: 'array',
			description: 'Pulsanti di azione della sezione',
			of: [{ type: 'cta' }],
			group: 'content',
		}),
		defineField({
			name: 'scope',
			title: 'Ambito di ricerca',
			type: 'string',
			description: 'Limita i risultati della ricerca a un tipo di contenuto specifico',
			options: {
				list: [
					{ title: 'Tutto', value: 'all' },
					{ title: 'Pagine', value: 'pages' },
					{ title: 'Percorso specifico', value: 'path' },
					{ title: 'Articoli blog', value: 'blog posts' },
				],
				layout: 'radio',
			},
			initialValue: 'all',
			group: 'options',
		}),
		defineField({
			name: 'path',
			title: 'Percorso',
			type: 'string',
			description: 'Filtra i risultati a un percorso specifico',
			placeholder: 'es. docs/*',
			hidden: ({ parent }) => parent?.scope !== 'path',
			validation: (Rule) => Rule.regex(/\*$/).error('Deve terminare con *'),
			group: 'options',
		}),
	],
	preview: {
		select: {
			intro: 'intro',
			scope: 'scope',
		},
		prepare: ({ intro, scope }) => ({
			title: getBlockText(intro) || (scope && `Search ${scope}`),
			subtitle: 'Ricerca',
		}),
	},
})
