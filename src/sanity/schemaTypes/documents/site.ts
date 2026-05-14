import { defineField, defineType } from 'sanity'

export default defineType({
	name: 'site',
	title: 'Impostazioni sito',
	type: 'document',
	groups: [
		{ name: 'generale', title: 'Generale', default: true },
		{ name: 'header', title: 'Header' },
		{ name: 'footer', title: 'Footer' },
	],
	fields: [
		// ── Generale ──
		defineField({
			name: 'title',
			title: 'Nome del sito',
			description: 'Nome del sito web (es. "Mario Tramo Blog")',
			type: 'string',
			validation: (Rule) => Rule.required(),
			group: 'generale',
		}),
		defineField({
			name: 'logo',
			title: 'Logo',
			description: 'Logo del sito mostrato nell\'header. Formato consigliato: SVG o PNG trasparente.',
			type: 'image',
			options: { hotspot: true },
			validation: (Rule) => Rule.required().warning('Il logo è consigliato per l\'identità del sito'),
			group: 'generale',
		}),

		// ── Header ──
		defineField({
			name: 'headerLinks',
			title: 'Link navigazione',
			description: 'Voci del menu principale (es. News, Tattiche, Video)',
			type: 'array',
			of: [{ type: 'link' }, { type: 'link.list' }],
			validation: (Rule) => Rule.required().min(1).warning('Aggiungi almeno un link di navigazione'),
			group: 'header',
		}),
		defineField({
			name: 'ctas',
			title: 'Pulsanti',
			description: 'Bottoni a destra (es. Login)',
			type: 'array',
			of: [{ type: 'cta' }],
			group: 'header',
		}),

		// ── Footer ──
		defineField({
			name: 'blurb',
			title: 'Descrizione',
			description: 'Testo sotto il logo nel footer',
			type: 'array',
			of: [{ type: 'block', lists: [] }],
			group: 'footer',
		}),
		defineField({
			name: 'footerLinks',
			title: 'Colonne di link',
			description:
				'Usa "Gruppo di link" per ogni colonna (es. Esplora, Competizioni, Chi siamo)',
			type: 'array',
			of: [{ type: 'link.list' }],
			group: 'footer',
		}),
		defineField({
			name: 'socialLinks',
			title: 'Social',
			description: 'Link ai profili social',
			type: 'array',
			of: [{ type: 'link' }],
			group: 'footer',
		}),
		defineField({
			name: 'showNewsletter',
			title: 'Mostra Newsletter',
			description: 'Attiva/disattiva la sezione newsletter nel footer',
			type: 'boolean',
			initialValue: true,
			group: 'footer',
		}),
		defineField({
			name: 'copyright',
			title: 'Copyright',
			type: 'array',
			of: [
				{
					type: 'block',
					styles: [{ title: 'Normale', value: 'normal' }],
					lists: [],
				},
			],
			validation: (Rule) => Rule.required().warning('Aggiungi un testo di copyright'),
			group: 'footer',
		}),
		// ── Nascosti (sistema) ──
		defineField({
			name: 'announcements',
			title: 'Annunci',
			type: 'array',
			of: [{ type: 'reference', to: [{ type: 'announcement' }] }],
			hidden: true,
		}),
	],
	preview: {
		prepare: () => ({
			title: 'Impostazioni sito',
		}),
	},
})
