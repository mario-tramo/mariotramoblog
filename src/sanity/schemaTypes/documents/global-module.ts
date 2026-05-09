import { defineArrayMember, defineField, defineType } from 'sanity'
import { VscSymbolField, VscSymbolVariable } from 'react-icons/vsc'
import modules from '../fragments/modules'
import { count } from '@/lib/utils'

export default defineType({
	name: 'global-module',
	title: 'Modulo globale',
	type: 'document',
	icon: VscSymbolField,
	fields: [
		defineField({
			name: 'path',
			title: 'Percorso',
			type: 'string',
			description:
				'Percorso URL per aggiungere moduli. Impostare "*" per tutte le pagine. Una barra finale "/" esclude il percorso principale.',
			placeholder: 'es. *, blog/, foo/bar/, ecc.',
			validation: (Rule) => Rule.regex(/^(\*|[a-z0-9-_/]+\/?)$/),
		}),
		defineField({
			name: 'excludePaths',
			title: 'Percorsi esclusi',
			type: 'array',
			description:
				'Percorsi URL da escludere dall\'aggiunta dei moduli. Una barra finale "/" esclude il percorso principale.',
			of: [
				defineArrayMember({
					type: 'string',
					placeholder: 'es. blog/, foo/bar/, ecc.',
					validation: (Rule) => Rule.required(),
				}),
			],
		}),
		defineField({
			...modules,
			name: 'before',
			title: 'Prima',
			description: 'Moduli da aggiungere prima del contenuto della pagina',
		}),
		defineField({
			...modules,
			name: 'after',
			title: 'Dopo',
			description: 'Moduli da aggiungere dopo il contenuto della pagina',
		}),
	],
	preview: {
		select: {
			path: 'path',
			before: 'before',
			after: 'after',
		},
		prepare: ({ path, before, after }) => ({
			title: count([...(before ?? []), ...(after ?? [])], 'module'),
			subtitle: path === '*' ? '* (Tutte le pagine)' : path,
			media: path === '*' ? VscSymbolVariable : VscSymbolField,
		}),
	},
})
