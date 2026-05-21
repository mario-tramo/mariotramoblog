import { defineField, defineType } from 'sanity'
import { VscFilter } from 'react-icons/vsc'

export default defineType({
	name: 'collection-filter',
	title: 'Filtro collezione',
	icon: VscFilter,
	type: 'object',
	fields: [
		defineField({
			name: 'field',
			title: 'Campo target',
			description: 'Il campo del documento su cui applicare il filtro',
			type: 'string',
			options: {
				list: [
					{ title: 'Categoria', value: 'category' },
					{ title: 'Tag', value: 'tag' },
					{ title: 'Autore', value: 'author' },
				],
				layout: 'radio',
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'mode',
			title: 'Modalita di risoluzione',
			description:
				'Static: valore fisso configurato qui. Dynamic: valore letto dal parametro URL.',
			type: 'string',
			options: {
				list: [
					{ title: 'Statico', value: 'static' },
					{ title: 'Dinamico', value: 'dynamic' },
				],
				layout: 'radio',
			},
			initialValue: 'static',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'staticValue',
			title: 'Valore statico',
			description: 'Lo slug del valore da filtrare (es. "tennis", "formula-1")',
			type: 'string',
			hidden: ({ parent }) => parent?.mode !== 'static',
			validation: (Rule) =>
				Rule.custom((value, context) => {
					const parent = context.parent as { mode?: string }
					if (parent?.mode === 'static' && !value) {
						return 'Inserisci un valore statico'
					}
					return true
				}),
		}),
		defineField({
			name: 'urlParam',
			title: 'Parametro URL',
			description:
				'Nome del query param o route param da leggere (es. "categoria", "tag")',
			type: 'string',
			hidden: ({ parent }) => parent?.mode !== 'dynamic',
			validation: (Rule) =>
				Rule.custom((value, context) => {
					const parent = context.parent as { mode?: string }
					if (parent?.mode === 'dynamic' && !value) {
						return 'Inserisci il nome del parametro URL'
					}
					return true
				}),
		}),
		defineField({
			name: 'fallback',
			title: 'Valore di fallback',
			description:
				'Valore da utilizzare se il parametro URL non e presente. Se vuoto, il filtro non viene applicato.',
			type: 'string',
			hidden: ({ parent }) => parent?.mode !== 'dynamic',
		}),
	],
	preview: {
		select: {
			field: 'field',
			mode: 'mode',
			staticValue: 'staticValue',
			urlParam: 'urlParam',
			fallback: 'fallback',
		},
		prepare: ({ field, mode, staticValue, urlParam, fallback }) => {
			const fieldLabels: Record<string, string> = {
				category: 'Categoria',
				tag: 'Tag',
				author: 'Autore',
			}
			const fieldLabel = fieldLabels[field] || field
			const subtitle =
				mode === 'static'
					? `Statico: ${staticValue || '—'}`
					: `Dinamico: ?${urlParam || '—'}${fallback ? ` (fallback: ${fallback})` : ''}`

			return {
				title: `Filtro: ${fieldLabel}`,
				subtitle,
			}
		},
	},
})
