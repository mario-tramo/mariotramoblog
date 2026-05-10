import { defineField } from 'sanity'

export default defineField({
	name: 'modules',
	description: 'Contenuto della pagina',
	type: 'array',
	of: [
		{ type: 'accordion-list' },
		{ type: 'blog-frontpage' },
		{ type: 'blog-list' },
		{ type: 'blog-post-content' },
		{ type: 'breadcrumbs' },
		{ type: 'callout' },
		{ type: 'card-list' },
		{ type: 'custom-html' },
		{ type: 'hero' },
		{ type: 'richtext-module' },
		{ type: 'search-module' },
	],
	options: {
		insertMenu: {
			views: [
				{
					name: 'grid',
					previewImageUrl: (schemaType) =>
						`/admin/thumbnails/${schemaType}.webp`,
				},
				{ name: 'list' },
			],
			groups: [
				{
					name: 'blog',
					title: 'Blog',
					of: ['blog-frontpage', 'blog-list', 'blog-post-content'],
				},
				{ name: 'hero', title: 'Hero', of: ['hero'] },
				{
					name: 'liste',
					title: 'Liste',
					of: [
						'accordion-list',
						'blog-list',
						'card-list',
					],
				},
			],
		},
	},
})
