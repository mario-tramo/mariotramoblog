#!/usr/bin/env node
// Uso: SANITY_WRITE_TOKEN=sk... node scripts/seed-legal.mjs
// Crea un token Editor su https://sanity.io/manage

import { createClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'geqdctr3'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_WRITE_TOKEN

if (!token) {
	console.error('❌  Imposta SANITY_WRITE_TOKEN prima di eseguire lo script')
	console.error('   Crea un token Editor su https://sanity.io/manage')
	process.exit(1)
}

const client = createClient({
	projectId,
	dataset,
	token,
	apiVersion: '2024-01-01',
	useCdn: false,
})

function block(style, text) {
	return {
		_type: 'block',
		_key: Math.random().toString(36).slice(2),
		style,
		children: [
			{
				_type: 'span',
				_key: Math.random().toString(36).slice(2),
				text,
				marks: [],
			},
		],
		markDefs: [],
	}
}

const docs = [
	{
		_id: 'legal-privacy-policy',
		_type: 'legal',
		lastUpdated: new Date().toISOString().split('T')[0],
		metadata: {
			_type: 'metadata',
			title: 'Privacy Policy',
			description:
				'Informativa sul trattamento dei dati personali ai sensi del GDPR.',
			slug: { _type: 'slug', current: 'privacy-policy' },
			noIndex: false,
		},
		body: [
			block('h2', 'Titolare del trattamento'),
			block('normal', 'Trm Sport – [inserire indirizzo e contatto email]'),
			block('h2', 'Dati raccolti'),
			block(
				'normal',
				'Il sito raccoglie dati di navigazione anonimi tramite Vercel Analytics e, previo consenso, cookie analitici di terze parti.',
			),
			block('h2', 'Finalità del trattamento'),
			block(
				'normal',
				'I dati sono trattati per: (a) erogare il servizio; (b) analisi statistiche aggregate; (c) miglioramento del sito.',
			),
			block('h2', 'Base giuridica'),
			block(
				'normal',
				'Legittimo interesse (art. 6 par. 1 lett. f GDPR) per i dati tecnici; consenso (art. 6 par. 1 lett. a GDPR) per i cookie analitici.',
			),
			block('h2', 'Conservazione'),
			block('normal', 'I dati di navigazione sono conservati per un massimo di 26 mesi.'),
			block('h2', "Diritti dell'interessato"),
			block(
				'normal',
				"Hai diritto di accesso, rettifica, cancellazione, limitazione, portabilità e opposizione. Scrivici a [inserire email].",
			),
			block('h2', 'Reclami'),
			block(
				'normal',
				'Puoi proporre reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it).',
			),
		],
	},
	{
		_id: 'legal-cookie-policy',
		_type: 'legal',
		lastUpdated: new Date().toISOString().split('T')[0],
		metadata: {
			_type: 'metadata',
			title: 'Cookie Policy',
			description: "Informativa sull'uso dei cookie su questo sito.",
			slug: { _type: 'slug', current: 'cookie-policy' },
			noIndex: false,
		},
		body: [
			block('h2', 'Cosa sono i cookie'),
			block(
				'normal',
				'I cookie sono piccoli file di testo salvati nel browser quando visiti un sito web.',
			),
			block('h2', 'Cookie tecnici (sempre attivi)'),
			block(
				'normal',
				'Necessari per il funzionamento del sito. Non richiedono consenso. Includono: cookie di sessione, preferenze lingua, stato del consenso cookie.',
			),
			block('h2', 'Cookie analitici (previo consenso)'),
			block(
				'normal',
				'Utilizzati per raccogliere statistiche aggregate (Vercel Analytics). Attivati solo dopo il tuo consenso esplicito.',
			),
			block('h2', 'Come gestire i cookie'),
			block(
				'normal',
				'Puoi revocare il consenso tramite il banner cookie nel sito, oppure configurare il browser per bloccare o eliminare i cookie.',
			),
		],
	},
	{
		_id: 'legal-termini-di-servizio',
		_type: 'legal',
		lastUpdated: new Date().toISOString().split('T')[0],
		metadata: {
			_type: 'metadata',
			title: 'Termini di servizio',
			description: 'Condizioni generali di utilizzo del sito.',
			slug: { _type: 'slug', current: 'termini-di-servizio' },
			noIndex: false,
		},
		body: [
			block('h2', 'Accettazione dei termini'),
			block(
				'normal',
				'Utilizzando questo sito accetti i presenti Termini. Se non li accetti, ti preghiamo di non utilizzare il sito.',
			),
			block('h2', 'Contenuti'),
			block(
				'normal',
				"I contenuti (articoli, analisi, immagini) sono di proprietà di Trm Sport e protetti da copyright. È vietata la riproduzione senza autorizzazione scritta.",
			),
			block('h2', 'Limitazione di responsabilità'),
			block(
				'normal',
				"Le informazioni hanno scopo puramente informativo. Trm Sport non garantisce l'accuratezza o completezza dei contenuti.",
			),
			block('h2', 'Link esterni'),
			block(
				'normal',
				'Il sito può contenere link a siti di terze parti. Trm Sport non è responsabile del loro contenuto.',
			),
			block('h2', 'Legge applicabile'),
			block(
				'normal',
				'I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente il Foro di [inserire città].',
			),
		],
	},
]

for (const doc of docs) {
	try {
		await client.createOrReplace(doc)
		console.log(`✅  ${doc.metadata.title} (${doc.metadata.slug.current})`)
	} catch (err) {
		console.error(`❌  Errore su ${doc.metadata.title}:`, err.message)
	}
}

console.log('\n📝  Pubblica i documenti dallo Studio Sanity per renderli visibili.')
