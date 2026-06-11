import { defineField, defineType } from 'sanity'
import SeoTitleFeedback from '@/sanity/ui/SeoTitleFeedback'
import SeoDescriptionFeedback from '@/sanity/ui/SeoDescriptionFeedback'
import PreviewOG from '@/sanity/ui/PreviewOG'
import SocialPreview from '@/sanity/ui/SocialPreview'

export default defineType({
	name: 'metadata',
	title: 'SEO e Metadati',
	description: 'Informazioni per i motori di ricerca e le anteprime social',
	type: 'object',
	fieldsets: [
		{
			name: 'seo',
			title: 'SEO',
			description: 'Titolo, descrizione e parole chiave per il posizionamento su Google',
			options: { collapsible: true, collapsed: false },
		},
		{
			name: 'sharing',
			title: 'Condivisione e immagine',
			description: 'Immagine mostrata nelle anteprime social e anteprima di come apparira il link',
			options: { collapsible: true, collapsed: false },
		},
		{
			name: 'advanced',
			title: 'Impostazioni avanzate',
			description: 'Opzioni tecniche per casi particolari. Nella maggior parte dei casi puoi ignorare questa sezione.',
			options: { collapsible: true, collapsed: true },
		},
	],
	fields: [
		defineField({
			name: 'slug',
			title: 'Percorso URL',
			type: 'slug',
			description: 'Indirizzo della pagina sul sito (es. /chi-siamo). Clicca "Genera" per crearlo automaticamente dal titolo.',
			options: {
				source: (doc: Record<string, unknown> & { title?: string; metadata?: { title?: string } }) => doc.title || doc.metadata?.title || '',
			},
			validation: (Rule) => Rule.required(),
		}),

		// --- SEO ---
		defineField({
			name: 'title',
			title: 'Titolo SEO (override)',
			type: 'string',
			description: 'Lascia vuoto per usare il titolo principale. Compilalo solo se vuoi un titolo diverso nei risultati di Google (es. più corto o con keyword specifiche). Ideale: 50-60 caratteri.',
			fieldset: 'seo',
			validation: (Rule) => [
				Rule.max(70).warning('Il titolo potrebbe essere tagliato da Google. Resta sotto i 60 caratteri.'),
			],
			components: {
				input: (props) => (
					<>
						<SeoTitleFeedback {...(props as unknown as Parameters<typeof SeoTitleFeedback>[0])} />
						<PreviewOG title={props.elementProps.value} />
					</>
				),
			},
		}),
		defineField({
			name: 'description',
			title: 'Descrizione SEO',
			type: 'string',
			description: 'La descrizione sotto il titolo nei risultati di Google. Deve invogliare al click. Ideale: 120-160 caratteri.',
			fieldset: 'seo',
			validation: (Rule) => [
				Rule.required().warning('Senza descrizione, Google mostrera un estratto automatico (spesso poco efficace)'),
				Rule.max(170).warning('La descrizione potrebbe essere tagliata. Resta sotto i 160 caratteri.'),
			],
			components: {
				input: SeoDescriptionFeedback,
			},
		}),
		defineField({
			name: 'keywords',
			title: 'Parole chiave',
			type: 'array',
			of: [{ type: 'string' }],
			description: 'Le 3-5 parole chiave principali. Il sistema verifica se sono presenti nel titolo.',
			fieldset: 'seo',
			options: {
				layout: 'tags',
			},
		}),

		// --- CONDIVISIONE ---
		defineField({
			name: 'image',
			title: 'Immagine in evidenza',
			description: 'Usata per le anteprime social (WhatsApp, Facebook, X) e per Google Discover / News. Carica un\'immagine orizzontale di almeno 1200px di larghezza — consigliato 1600x1067px (3:2). Imposta il punto focale (hotspot) sul soggetto: i ritagli 16:9, 4:3 e 1:1 vengono generati in automatico. Se non impostata, viene generata una card automatica.',
			type: 'image',
			fieldset: 'sharing',
			options: {
				hotspot: true,
				metadata: ['lqip'],
			},
			fields: [
				defineField({
					name: 'alt',
					title: 'Testo alternativo',
					description: 'Descrive l\'immagine per i motori di ricerca e gli screen reader (es. "Trm Sport in conferenza stampa")',
					type: 'string',
					validation: (Rule) => Rule.required().warning('Il testo alternativo migliora l\'accessibilità e il posizionamento SEO'),
				}),
				defineField({
					name: 'caption',
					title: 'Didascalia',
					description: 'Breve descrizione o credito dell\'immagine (opzionale)',
					type: 'string',
				}),
			],
		}),
		defineField({
			name: 'socialPreview',
			title: 'Anteprima social',
			type: 'string',
			fieldset: 'sharing',
			components: {
				field: () => <SocialPreview />,
			},
		}),

		// --- AVANZATE ---
		defineField({
			name: 'noIndex',
			title: 'Nascondi dai motori di ricerca',
			description: 'Se attivo, Google e altri motori di ricerca non indicizzeranno questa pagina. Usalo per pagine private o in costruzione.',
			type: 'boolean',
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
