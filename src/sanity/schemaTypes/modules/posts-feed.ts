import { defineField, defineType } from 'sanity'
import { TfiLayoutGrid3Alt } from 'react-icons/tfi'

const SOURCE_OPTIONS = [
	{ title: 'Ultimi articoli', value: 'latest' },
	{ title: 'Di tendenza', value: 'trending' },
	{ title: 'Selezione manuale', value: 'manual' },
] as const

const LAYOUT_OPTIONS = [
	{ title: 'Carosello', value: 'carousel' },
	{ title: 'Griglia', value: 'grid' },
	{ title: 'Lista compatta', value: 'list' },
	{ title: 'Lista numerata', value: 'numbered' },
	{ title: 'Lista con miniature', value: 'thumbs' },
] as const

export default defineType({
	name: 'posts-feed',
	title: 'Feed articoli',
	icon: TfiLayoutGrid3Alt,
	type: 'object',
	description:
		'Modulo universale per mostrare articoli. Configura la fonte dati, il layout e i filtri.',
	groups: [
		{ name: 'content', title: 'Contenuto', default: true },
		{ name: 'filtering', title: 'Filtri' },
		{ name: 'options', title: 'Opzioni' },
	],
	fields: [
		// ── Contenuto ──────────────────────────────────────────

		defineField({
			name: 'title',
			title: 'Titolo',
			type: 'string',
			description: 'Intestazione visibile sopra la lista (es. "Ultime Notizie", "Di Tendenza")',
			group: 'content',
		}),

		defineField({
			name: 'intro',
			title: 'Introduzione',
			type: 'array',
			description:
				'Breve testo editoriale mostrato sotto il titolo (50-120 parole). Utile per SEO e contestualizzazione.',
			of: [{ type: 'block' }],
			group: 'content',
		}),

		defineField({
			name: 'source',
			title: 'Fonte dati',
			type: 'string',
			description:
				'Ultimi: ordinati per data di pubblicazione. Di tendenza: gli articoli "In evidenza" appaiono per primi. Manuale: scegli tu quali articoli mostrare e in che ordine.',
			options: { list: [...SOURCE_OPTIONS], layout: 'radio' },
			initialValue: 'latest',
			validation: (Rule) => Rule.required().error('Scegli una fonte dati'),
			group: 'content',
		}),

		defineField({
			name: 'manualPosts',
			title: 'Articoli selezionati',
			type: 'array',
			of: [
				{
					type: 'reference',
					to: [{ type: 'blog.post' }],
					options: { disableNew: true },
				},
			],
			description:
				'Trascina per riordinare. Gli articoli appariranno esattamente nell\'ordine impostato qui.',
			group: 'content',
			hidden: ({ parent }) => parent?.source !== 'manual',
			validation: (Rule) =>
				Rule.custom((value, context) => {
					const parent = context.parent as { source?: string }
					if (parent?.source === 'manual' && (!value || value.length === 0)) {
						return 'Seleziona almeno un articolo per la selezione manuale'
					}
					return true
				}),
		}),

		defineField({
			name: 'viewAllHref',
			title: 'Link "Vedi tutti"',
			type: 'string',
			description: 'Percorso della pagina con tutti gli articoli (es. /blog)',
			group: 'content',
		}),

		defineField({
			name: 'viewAllLabel',
			title: 'Testo link',
			type: 'string',
			description: 'Testo del pulsante (es. "Vedi tutte le notizie")',
			initialValue: 'Vedi tutti',
			group: 'content',
			hidden: ({ parent }) => !parent?.viewAllHref,
		}),

		// ── Filtri ─────────────────────────────────────────────

		defineField({
			name: 'limit',
			title: 'Numero articoli',
			type: 'number',
			description: 'Quanti articoli mostrare (da 1 a 20)',
			initialValue: 6,
			validation: (Rule) =>
				Rule.min(1).max(20).integer().error('Inserisci un numero tra 1 e 20'),
			group: 'filtering',
			hidden: ({ parent }) => parent?.source === 'manual',
		}),

		defineField({
			name: 'filters',
			title: 'Filtri',
			description:
				'Restringe gli articoli per categoria, tag o autore. Ogni filtro può essere fisso oppure leggere il valore dall\'URL.',
			type: 'array',
			of: [{ type: 'collection-filter' }],
			group: 'filtering',
			hidden: ({ parent }) => parent?.source === 'manual',
		}),

		// ── Opzioni ────────────────────────────────────────────

		defineField({
			name: 'layout',
			title: 'Layout',
			type: 'string',
			description:
				'Carosello: scorrimento orizzontale. Griglia: card con immagine. Lista compatta: due colonne con miniature. Lista numerata: classifica con numero. Lista con miniature: sidebar con thumb.',
			options: { list: [...LAYOUT_OPTIONS], layout: 'radio' },
			initialValue: 'carousel',
			group: 'options',
		}),

		defineField({
			name: 'options',
			title: 'Opzioni modulo',
			type: 'module-options',
			description: 'Sfondo, visibilit\u00e0, ancoraggio',
			group: 'options',
		}),
	],
	preview: {
		select: {
			title: 'title',
			source: 'source',
			layout: 'layout',
			limit: 'limit',
		},
		prepare: ({ title, source, layout, limit }) => {
			const sourceLabel =
				SOURCE_OPTIONS.find((s) => s.value === source)?.title || source
			const layoutLabel =
				LAYOUT_OPTIONS.find((l) => l.value === layout)?.title || layout
			return {
				title: title || 'Feed articoli',
				subtitle: `${sourceLabel} · ${layoutLabel} · ${source === 'manual' ? 'manuale' : `${limit || 6} articoli`}`,
			}
		},
	},
})
