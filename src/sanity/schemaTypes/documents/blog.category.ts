import { defineField, defineType } from 'sanity'
import { VscTag } from 'react-icons/vsc'
import modules from '../fragments/modules'

export default defineType({
	name: 'blog.category',
	title: 'Categoria blog',
	type: 'document',
	icon: VscTag,
	groups: [
		{ name: 'content', title: 'Contenuto', default: true },
		{ name: 'page', title: 'Pagina categoria' },
		{ name: 'metadata', title: 'SEO e Metadati' },
	],
	fields: [
		defineField({
			name: 'title',
			title: 'Titolo',
			type: 'string',
			description: 'Nome della categoria (es. Calcio, Tennis, Formula 1)',
			validation: (Rule) => Rule.required(),
			group: 'content',
		}),
		defineField({
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			description: 'Percorso URL generato automaticamente dal titolo',
			options: {
				source: 'title',
			},
			validation: (Rule) => Rule.required(),
			group: 'content',
		}),
		defineField({
			name: 'color',
			title: 'Colore',
			type: 'string',
			description:
				'Colore della categoria (es. #c62828). Usato per badge, bordi e accenti.',
			group: 'content',
		}),
		defineField({
			...modules,
			description:
				'Sezioni della pagina categoria. I moduli blog (Lista articoli, Carosello) filtreranno automaticamente per questa categoria.',
			group: 'page',
		}),
		defineField({
			name: 'metadata',
			title: 'SEO e Metadati',
			type: 'metadata',
			description:
				'Metadati per la pagina categoria. Lo slug viene ignorato (si usa quello della categoria).',
			group: 'metadata',
		}),
	],
	preview: {
		select: {
			title: 'title',
			metaSlug: 'metadata.slug.current',
			slug: 'slug.current',
			modules: 'modules',
		},
		prepare: ({ title, metaSlug, slug, modules }) => ({
			title,
			subtitle: [
				metaSlug ? `/${metaSlug}` : slug && `/${slug}`,
				modules?.length && `${modules.length} moduli`,
			]
				.filter(Boolean)
				.join(' — '),
		}),
	},
})
