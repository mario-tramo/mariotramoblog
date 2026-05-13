import { defineField, defineType } from 'sanity'
import SeoTitleFeedback from '@/sanity/ui/SeoTitleFeedback'
import SeoDescriptionFeedback from '@/sanity/ui/SeoDescriptionFeedback'

export default defineType({
	name: 'seoFields',
	title: 'SEO Avanzato',
	description: 'Ottimizzazione avanzata per motori di ricerca e social media.',
	type: 'object',
	fieldsets: [
		{
			name: 'base',
			title: 'SEO Base',
			description: 'Campi principali per il posizionamento su Google',
			options: { collapsible: true, collapsed: false },
		},
		{
			name: 'openGraph',
			title: 'Open Graph (Social Media)',
			description: 'Come appare il link quando lo condividi su Facebook, LinkedIn, WhatsApp ecc. Se lasci vuoto, vengono usati i dati SEO base.',
			options: { collapsible: true, collapsed: true },
		},
		{
			name: 'twitter',
			title: 'Twitter / X',
			description: 'Personalizza come appare il link su Twitter/X. Se lasci vuoto, vengono usati i dati Open Graph.',
			options: { collapsible: true, collapsed: true },
		},
		{
			name: 'advanced',
			title: 'Impostazioni avanzate',
			description: 'Opzioni tecniche per utenti esperti.',
			options: { collapsible: true, collapsed: true },
		},
	],
	fields: [
		// --- SEO BASE ---
		defineField({
			name: 'metaTitle',
			title: 'Titolo SEO',
			type: 'string',
			description: 'Il titolo che appare nei risultati di Google. Ideale: 50-60 caratteri. Includi la keyword principale. Es: "Guida completa alla tattica del 4-3-3 nel calcio moderno"',
			fieldset: 'base',
			components: {
				input: SeoTitleFeedback,
			},
		}),
		defineField({
			name: 'metaDescription',
			title: 'Descrizione SEO',
			type: 'string',
			description: 'La descrizione sotto il titolo nei risultati di Google. Ideale: 100-160 caratteri. Deve invogliare al click. Es: "Scopri come funziona il 4-3-3, i vantaggi tattici e gli schieramenti usati dai migliori allenatori del mondo."',
			fieldset: 'base',
			components: {
				input: SeoDescriptionFeedback,
			},
		}),
		defineField({
			name: 'seoKeywords',
			title: 'Parole chiave',
			type: 'array',
			of: [{ type: 'string' }],
			description: 'Le parole chiave principali dell\'articolo. Inseriscine 3-5 pertinenti. Es: "tattica calcio", "4-3-3", "schema di gioco". Il sistema ti avvisa se non le usi nel titolo.',
			fieldset: 'base',
			options: {
				layout: 'tags',
			},
		}),

		// --- OPEN GRAPH ---
		defineField({
			name: 'ogTitle',
			title: 'Titolo social',
			type: 'string',
			description: 'Titolo mostrato nell\'anteprima social (Facebook, WhatsApp, LinkedIn, Telegram). Se vuoto, usa il Titolo SEO.',
			fieldset: 'openGraph',
		}),
		defineField({
			name: 'ogDescription',
			title: 'Descrizione social',
			type: 'text',
			rows: 3,
			description: 'Descrizione mostrata nell\'anteprima social. Se vuota, usa la Descrizione SEO.',
			fieldset: 'openGraph',
		}),
		defineField({
			name: 'ogImage',
			title: 'Immagine social',
			type: 'image',
			description: 'Immagine per le anteprime social. Dimensione ideale: 1200x630px. Se vuota, viene generata automaticamente.',
			fieldset: 'openGraph',
			options: {
				hotspot: true,
			},
		}),

		// --- TWITTER ---
		defineField({
			name: 'twitterCardType',
			title: 'Tipo di card',
			type: 'string',
			description: 'Come viene visualizzato il post su Twitter/X.',
			fieldset: 'twitter',
			options: {
				list: [
					{ title: 'Immagine grande (consigliato)', value: 'summary_large_image' },
					{ title: 'Immagine piccola', value: 'summary' },
				],
				layout: 'radio',
			},
			initialValue: 'summary_large_image',
		}),
		defineField({
			name: 'twitterCreator',
			title: 'Account autore',
			type: 'string',
			description: 'L\'handle Twitter dell\'autore. Es: @mariotramo',
			fieldset: 'twitter',
		}),
		defineField({
			name: 'twitterSite',
			title: 'Account del sito',
			type: 'string',
			description: 'L\'handle Twitter del sito/blog. Es: @mariotramoblog',
			fieldset: 'twitter',
		}),

		// --- AVANZATE ---
		defineField({
			name: 'noIndex',
			title: 'Nascondi dai motori di ricerca',
			type: 'boolean',
			description: 'Se attivo, questa pagina NON apparira su Google. Utile per pagine in bozza, landing temporanee o contenuti privati.',
			fieldset: 'advanced',
			initialValue: false,
		}),
		defineField({
			name: 'canonicalUrl',
			title: 'URL canonico',
			type: 'url',
			description: 'Se questo contenuto esiste anche su un altro sito, inserisci qui l\'URL originale per evitare penalizzazioni da contenuto duplicato. Lascia vuoto nella maggior parte dei casi.',
			fieldset: 'advanced',
		}),
	],
})
