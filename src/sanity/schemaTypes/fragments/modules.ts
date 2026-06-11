import { defineField } from 'sanity'

export default defineField({
	name: 'modules',
	title: 'Sezioni della pagina',
	description: 'Aggiungi e organizza i contenuti della pagina',
	type: 'array',
	of: [
		{ type: 'layout-block' },
		{ type: 'hero' },
		{ type: 'article-carousel' },
		{ type: 'richtext-module' },
		{ type: 'card-list' },
		{ type: 'accordion-list' },
		{ type: 'callout' },
		{ type: 'blog-frontpage' },
		{ type: 'blog-list' },
		{ type: 'blog-post-content' },
		{ type: 'newsletter-block' },
		{ type: 'search-module' },
		{ type: 'standings' },
		{ type: 'breadcrumbs' },
		{ type: 'custom-html' },
		{ type: 'posts-feed' },
		{ type: 'divider' },
		{ type: 'team-grid' },
		{ type: 'trust-bar' },
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
					name: 'struttura',
					title: 'Struttura',
					of: ['layout-block', 'hero', 'divider', 'breadcrumbs'],
				},
				{
					name: 'contenuto',
					title: 'Contenuto',
					of: ['richtext-module', 'card-list', 'accordion-list', 'callout', 'custom-html'],
				},
				{
					name: 'blog',
					title: 'Blog',
					of: ['article-carousel', 'blog-list', 'blog-frontpage', 'blog-post-content', 'posts-feed'],
				},
				{
					name: 'altro',
					title: 'Altro',
					of: ['newsletter-block', 'search-module', 'standings', 'team-grid', 'trust-bar'],
				},
			],
		},
	},
})
