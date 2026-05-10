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
			description: 'Scegli su quali contenuti del sito deve funzionare la ricerca',
			options: {
				list: [
					{ title: 'Tutto il sito', value: 'all' },
					{ title: 'Solo pagine', value: 'pages' },
					{ title: 'Percorso specifico', value: 'path' },
					{ title: 'Solo articoli blog', value: 'blog posts' },
				],
				layout: 'radio',
			},
			initialValue: 'all',
			group: 'options',
		}),
		defineField({
			name: 'path',
			title: 'Percorso da cercare',
			type: 'string',
			description: 'Limita la ricerca a un percorso specifico (es. docs/* cerca solo nella sezione docs)',
			placeholder: 'es. docs/*',
			hidden: ({ parent }) => parent?.scope !== 'path',
			validation: (Rule) => Rule.regex(/\*$/).error('Deve terminare con * (es. docs/*)'),
			group: 'options',
		}),
	],
	preview: {
		select: {
			intro: 'intro',
			scope: 'scope',
		},
		prepare: ({ intro, scope }) => {
			const scopeLabels: Record<string, string> = {
				all: 'tutto il sito',
				pages: 'solo pagine',
				path: 'percorso specifico',
				'blog posts': 'solo articoli blog',
			}
			return {
				title: getBlockText(intro) || 'Ricerca',
				subtitle: scope ? `Cerca in: ${scopeLabels[scope] ?? scope}` : 'Ricerca',
			}
		},
	},
})
