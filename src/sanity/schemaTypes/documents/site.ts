import { defineField, defineType } from 'sanity'

export default defineType({
	name: 'site',
	title: 'Impostazioni sito',
	type: 'document',
	groups: [
		{ name: 'branding', title: 'Marchio', default: true },
		{ name: 'info', title: 'Informazioni' },
		{ name: 'navigation', title: 'Navigazione' },
	],
	fields: [
		defineField({
			name: 'title',
			title: 'Nome del sito',
			description: 'Il nome del blog, mostrato nell\'header quando non c\'è un logo',
			type: 'string',
			validation: (Rule) => Rule.required(),
			group: 'branding',
		}),
		defineField({
			name: 'logo',
			title: 'Logo',
			description: 'Logo del sito. Se presente, sostituisce il nome nell\'header e nel footer',
			type: 'image',
			options: { hotspot: true },
			group: 'branding',
		}),
		defineField({
			name: 'blurb',
			title: 'Descrizione',
			description: 'Breve testo descrittivo mostrato nel footer sotto il logo',
			type: 'array',
			of: [{ type: 'block', lists: [] }],
			group: 'branding',
		}),
		defineField({
			name: 'announcements',
			title: 'Annunci',
			description: 'Banner di annuncio mostrati in cima al sito',
			type: 'array',
			of: [{ type: 'reference', to: [{ type: 'announcement' }] }],
			group: 'info',
		}),
		defineField({
			name: 'copyright',
			title: 'Copyright',
			description: 'Testo legale mostrato in fondo al footer (es. "© 2024 Nome Blog")',
			type: 'array',
			of: [
				{
					type: 'block',
					styles: [{ title: 'Normale', value: 'normal' }],
					lists: [],
				},
			],
			group: 'info',
		}),
		defineField({
			name: 'ctas',
			title: 'Pulsanti azione',
			description: 'Bottoni mostrati nell\'header (es. "Contattaci", "Iscriviti")',
			type: 'array',
			of: [{ type: 'cta' }],
			group: 'navigation',
		}),
		defineField({
			name: 'headerMenu',
			title: 'Menu header',
			description: 'Voci di navigazione mostrate nella barra superiore del sito',
			type: 'reference',
			to: [{ type: 'navigation' }],
			group: 'navigation',
		}),
		defineField({
			name: 'footerMenu',
			title: 'Menu footer',
			description: 'Voci di navigazione mostrate nel piè di pagina',
			type: 'reference',
			to: [{ type: 'navigation' }],
			group: 'navigation',
		}),
		defineField({
			name: 'social',
			title: 'Link social',
			description: 'Link ai profili social (Facebook, Instagram, X, ecc.) mostrati nel footer',
			type: 'reference',
			to: [{ type: 'navigation' }],
			group: 'navigation',
		}),
	],
	preview: {
		prepare: () => ({
			title: 'Impostazioni sito',
		}),
	},
})
