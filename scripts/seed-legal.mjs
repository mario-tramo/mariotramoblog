#!/usr/bin/env node
// Uso: node scripts/seed-legal.mjs
// Il token viene letto da SANITY_API_WRITE_TOKEN in .env.local

import { createClient } from '@sanity/client'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env.local') })

const projectId =
	process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || (console.warn('⚠️  NEXT_PUBLIC_SANITY_PROJECT_ID non impostata, uso fallback hardcoded'), 'geqdctr3')
const dataset =
	process.env.NEXT_PUBLIC_SANITY_DATASET || (console.warn('⚠️  NEXT_PUBLIC_SANITY_DATASET non impostata, uso fallback hardcoded'), 'production')
const token = process.env.SANITY_API_WRITE_TOKEN

const warnEnv = (key, fallback) => {
	console.warn(`⚠️  ${key} non impostata in .env.local, uso fallback: "${fallback}"`)
	return fallback
}

const contactName =
	process.env.NEXT_PUBLIC_CONTACT_NAME || warnEnv('NEXT_PUBLIC_CONTACT_NAME', 'Trm Sport')
const contactAddress =
	process.env.NEXT_PUBLIC_CONTACT_ADDRESS ||
	warnEnv('NEXT_PUBLIC_CONTACT_ADDRESS', 'Via dello Sport, 1 — 00100 Roma (RM)')
const contactEmail =
	process.env.NEXT_PUBLIC_CONTACT_EMAIL || warnEnv('NEXT_PUBLIC_CONTACT_EMAIL', 'info@trmsport.com')
const contactPEC =
	process.env.NEXT_PUBLIC_CONTACT_PEC || `${contactEmail} (PEC su richiesta)`
const baseUrl = (
	process.env.NEXT_PUBLIC_BASE_URL || warnEnv('NEXT_PUBLIC_BASE_URL', 'https://trmsport.com')
).replace(/\/+$/, '')

if (!token) {
	console.error('❌  SANITY_API_WRITE_TOKEN non trovato in .env.local')
	console.error('   Assicurati che .env.local contenga SANITY_API_WRITE_TOKEN')
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

function link(text, href) {
	return {
		_type: 'block',
		_key: Math.random().toString(36).slice(2),
		style: 'normal',
		children: [
			{
				_type: 'span',
				_key: Math.random().toString(36).slice(2),
				text,
				marks: [
					{
						_key: Math.random().toString(36).slice(2),
						_type: 'link',
						href,
					},
				],
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
				'Informativa sul trattamento dei dati personali ai sensi del Regolamento UE 2016/679 (GDPR) e del D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018.',
			slug: { _type: 'slug', current: 'privacy-policy' },
			noIndex: false,
		},
		body: [
			block('h2', '1. Titolare del trattamento'),
			block(
				'normal',
				`Il Titolare del trattamento dei dati personali è ${contactName}, con sede in ${contactAddress}, contattabile all'indirizzo email ${contactEmail}.`,
			),
			block('normal', `Eventuali richieste possono essere inviate a: ${contactEmail}.`),
			block('h2', '2. Responsabile della protezione dei dati (DPO / RPD)'),
			block(
				'normal',
				`Non è stato designato un Responsabile della protezione dei dati (DPO) in quanto non ricorrono le condizioni di cui all'art. 37 GDPR. Per qualsiasi richiesta in materia di privacy è possibile scrivere al Titolare al recapito sopra indicato.`,
			),
			block('h2', '3. Tipologie di dati personali raccolti'),
			block('h3', '3.1 Dati di navigazione'),
			block(
				'normal',
				'I sistemi informatici e le procedure software preposte al funzionamento di questo sito acquisiscono, nel corso del loro normale esercizio, alcuni dati personali la cui trasmissione è implicita nell\'uso dei protocolli di comunicazione di Internet. Si tratta di: indirizzo IP, tipo di browser, sistema operativo, URI delle risorse richieste, orario della richiesta, metodo HTTP utilizzato, dimensione della risposta, codice numerico indicante lo stato della risposta. Questi dati vengono utilizzati al solo fine di ricavare informazioni statistiche anonime sull\'uso del sito e per controllarne il corretto funzionamento.',
			),
			block('h3', '3.2 Dati forniti volontariamente dall\'utente'),
			block(
				'normal',
				'L\'invio facoltativo, esplicito e volontario di posta elettronica agli indirizzi indicati su questo sito comporta la successiva acquisizione dell\'indirizzo del mittente, necessario per rispondere alle richieste, nonché degli eventuali altri dati personali inseriti nella missiva. Specifiche informative di sintesi vengono riportate o visualizzate nelle pagine del sito predisposte per particolari servizi a richiesta (es. modulo newsletter).',
			),
			block('h3', '3.3 Dati raccolti tramite cookie'),
			block(
				'normal',
				'Per le informazioni relative ai cookie utilizzati da questo sito si rimanda alla Cookie Policy, raggiungibile al seguente link: ' + `${baseUrl}/legal/cookie-policy`,
			),
			block('h2', '4. Finalità del trattamento e basi giuridiche'),
			block(
				'normal',
				'I dati personali sono trattati per le seguenti finalità: (a) erogazione del servizio editoriale e gestione tecnica del sito — base giuridica: esecuzione del contratto / legittimo interesse (art. 6, par. 1, lett. b/f GDPR); (b) analisi statistiche aggregate sull\'uso del sito, previo consenso — base giuridica: consenso (art. 6, par. 1, lett. a GDPR); (c) invio della newsletter e di comunicazioni informative su tematiche editoriali, previo consenso esplicito e verificato (double opt-in) — base giuridica: consenso (art. 6, par. 1, lett. a GDPR); (d) adempimento di obblighi di legge — base giuridica: obbligo legale (art. 6, par. 1, lett. c GDPR).',
			),
			block('h2', '5. Modalità del trattamento e conservazione'),
			block(
				'normal',
				'I dati personali sono trattati con strumenti elettronici e cartacei, dal personale autorizzato e appositamente formato, secondo i principi di liceità, correttezza, trasparenza, limitazione delle finalità, minimizzazione dei dati, esattezza, limitazione della conservazione, integrità e riservatezza (art. 5 GDPR). I dati di navigazione sono conservati per un massimo di 12 mesi. I dati degli iscritti alla newsletter sono conservati fino a revoca del consenso (modulo di unsubscribe presente in calce a ogni email) e comunque per un periodo massimo di 5 anni dall\'ultima interazione. Trascorso tale periodo i dati vengono cancellati o resi anonimi in modo irreversibile.',
			),
			block('h2', '6. Destinatari e trasferimenti extra-UE'),
			block(
				'normal',
				'I dati personali possono essere comunicati a soggetti esterni che operano come Responsabili del trattamento ex art. 28 GDPR (fornitori di hosting, servizi di analisi, servizi di posta elettronica). L\'elenco aggiornato dei Responsabili del trattamento è disponibile su richiesta scrivendo a ' +
					contactEmail +
					'. Alcuni di questi soggetti possono avere sede in paesi extra-UE: in tali casi il trasferimento avviene sulla base di decisioni di adeguatezza, di garanzie adeguate (clausole contrattuali standard della Commissione europea) o di altre basi giuridiche previste dal GDPR. In particolare: Sanity Inc. (CMS, USA) — hosting dei contenuti editoriali su infrastruttura conforme GDPR; Vercel Inc. (USA) — hosting edge e analytics; Upstash Inc. (USA) — archivio di stato applicativo (consensi, contatori anonimi di visualizzazione).',
			),
			block('h2', '7. Diritti dell\'interessato'),
			block(
				'normal',
				'In qualità di interessato, hai il diritto di: (i) ottenere l\'accesso ai tuoi dati personali (art. 15 GDPR); (ii) chiederne la rettifica (art. 16) o l\'integrazione; (iii) chiederne la cancellazione («diritto all\'oblio», art. 17); (iv) ottenere la limitazione del trattamento (art. 18); (v) ricevere i dati in un formato strutturato e di uso comune, e trasmetterli a un altro titolare («portabilità», art. 20); (vi) opporti al trattamento (art. 21) o revocare il consenso in qualsiasi momento (art. 7, par. 3) senza pregiudicare la liceità del trattamento basato sul consenso prima della revoca; (vii) non essere sottoposto a una decisione basata unicamente sul trattamento automatizzato, compresa la profilazione (art. 22). Per esercitare questi diritti scrivi a ' +
					contactEmail +
					'. Una risposta verrà fornita entro 30 giorni dalla ricezione della richiesta.',
			),
			block('h2', '8. Diritto di proporre reclamo'),
			block(
				'normal',
				'Fatto salvo il diritto di rivolgersi al Titolare, l\'interessato ha il diritto di proporre reclamo all\'autorità di controllo competente. In Italia, l\'autorità di controllo è il Garante per la protezione dei dati personali (www.garanteprivacy.it), Piazza Venezia 11, 00187 Roma. È possibile proporre reclamo anche all\'autorità di controllo dello Stato membro UE in cui l\'interessato risiede abitualmente o lavora.',
			),
			block('h2', '9. Processi decisionali automatizzati e profilazione'),
			block(
				'normal',
				'Il trattamento dei dati personali non comporta processi decisionali automatizzati né profilazione ai sensi dell\'art. 22 GDPR. Le metriche di accesso aggregate (visualizzazioni anonime dei singoli articoli) non permettono di identificare l\'interessato.',
			),
			block('h2', '10. Modifiche alla presente informativa'),
			block(
				'normal',
				'Eventuali modifiche all\'informativa saranno pubblicate su questa pagina. Si invita a consultarla periodicamente. La data dell\'ultimo aggiornamento è riportata in cima alla pagina.',
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
			description:
				'Informativa sull\'uso dei cookie e tecnologie equiparabili ai sensi del Provvedimento del Garante per la protezione dei dati personali del 10 giugno 2021.',
			slug: { _type: 'slug', current: 'cookie-policy' },
			noIndex: false,
		},
		body: [
			block('h2', 'Cosa sono i cookie'),
			block(
				'normal',
				'I cookie sono piccoli file di testo che i siti visitati inviano al terminale dell\'utente, dove vengono memorizzati per essere ritrasmessi agli stessi siti alla successiva visita. I cookie possono essere installati dal sito che si sta visitando (cookie di prima parte) o da siti diversi (cookie di terze parti). Possono inoltre essere tecnici (necessari al funzionamento) o di profilazione / analytics (soggetti a consenso).',
			),
			block('h2', 'Cookie tecnici — non richiedono consenso'),
			block(
				'normal',
				'Questi cookie sono necessari per il funzionamento del sito e non richiedono il consenso preventivo dell\'utente, ai sensi dell\'art. 122 del D.Lgs. 196/2003. Includono: cookie di sessione del CMS per la visualizzazione della lingua preferita; cookie di consenso per ricordare la scelta effettuata sul banner (trm_consent) per un periodo non superiore a 390 giorni (criteri EDPB Guidelines 03/2020); cookie di stato dell\'interfaccia. L\'utilizzo di questi cookie è basato sul legittimo interesse del Titolare (art. 6, par. 1, lett. f GDPR).',
			),
			block('h3', 'Dettaglio dei cookie tecnici'),
			block('normal', '• trm_consent — memorizza la scelta dell\'utente sul consenso analytics. Durata: 390 giorni. Fornitore: prima parte.'),
			block('normal', '• sanitypress-<project>-lang — memorizza la lingua selezionata. Durata: di sessione. Fornitore: prima parte.'),
			block('h2', 'Cookie analitici — previo consenso (art. 6, par. 1, lett. a GDPR)'),
			block(
				'normal',
				'Vengono installati esclusivamente dopo il consenso esplicito dell\'utente, espresso cliccando "Accetta" sul banner. Sono cookie di terze parti che raccolgono informazioni statistiche aggregate sull\'uso del sito, in modalità normalmente anonimizzata o pseudonimizzata. Includono: Vercel Analytics (dati di visualizzazione aggregati, indirizzo IP troncato); Vercel Speed Insights (performance misurata in produzione). Provider: Vercel Inc. (USA), con flusso di dati conforme alle decisioni di adeguatezza e SCC.',
			),
			block('h2', 'Cookie di terze parti caricati a seguito di consenso analitico'),
			block(
				'normal',
				'Quando l\'utente accetta i cookie analitici, all\'interno di determinati articoli possono comparire embed di social network (TikTok, Instagram, Facebook, Threads) e tweet (Twitter / X). Tali embed possono installare cookie di terze parti (TikTok / Instagram / Facebook / Threads / Twitter-X) per il corretto funzionamento del player e per finalità di profilazione pubblicitaria proprie del social network. Si raccomanda di consultare le cookie policy dei singoli provider: TikTok (https://www.tiktok.com/legal/cookie-policy), Instagram/Meta (https://www.facebook.com/policies/cookies), Twitter-X (https://twitter.com/en/privacy), Threads (Meta).',
			),
			block('h2', 'Come prestare o revocare il consenso'),
			block(
				'normal',
				'Al primo accesso al sito viene mostrato un banner che consente di accettare o rifiutare i cookie analitici. Il consenso può essere revocato in qualsiasi momento cliccando il pulsante "Preferenze cookie" presente nel footer del sito, oppure cancellando i cookie del browser per questo dominio. La revoca del consenso non pregiudica la liceità del trattamento basato sul consenso prima della revoca.',
			),
			block('h2', 'Come gestire i cookie tramite il browser'),
			block(
				'normal',
				'È possibile configurare il browser per accettare o rifiutare i cookie, per cancellarli al termine di ogni sessione, o per cancellarli tutti in un momento specifico. Le modalità variano in base al browser: Chrome (chrome://settings/cookies), Firefox (Preferenze → Privacy e sicurezza), Safari (Preferenze → Privacy), Edge (Impostazioni → Cookie e autorizzazioni del sito). Si ricorda che il blocco totale dei cookie può compromettere il corretto funzionamento del sito.',
			),
			block('h2', 'Aggiornamenti'),
			block(
				'normal',
				'Eventuali modifiche a questa Cookie Policy saranno pubblicate su questa pagina. La data dell\'ultimo aggiornamento è riportata in calce.',
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
			description: 'Condizioni generali di utilizzo del sito web e dei suoi contenuti.',
			slug: { _type: 'slug', current: 'termini-di-servizio' },
			noIndex: false,
		},
		body: [
			block('h2', '1. Accettazione dei termini'),
			block(
				'normal',
				'Utilizzando questo sito accetti i presenti Termini di servizio. Se non li accetti, ti preghiamo di non utilizzare il sito. I Termini possono essere modificati in qualsiasi momento: le modifiche saranno pubblicate su questa pagina e avranno effetto dalla data di pubblicazione.',
			),
			block('h2', '2. Titolare e contenuti'),
			block(
				'normal',
				`Il sito è pubblicato da ${contactName}, con sede in ${contactAddress}. I contenuti (articoli, analisi, immagini, video, audio) sono di proprietà del Titolare o dei rispettivi autori e sono protetti dalle leggi sul diritto d\'autore (Legge 633/1941 e successive modifiche). È vietata la riproduzione, anche parziale, senza autorizzazione scritta, salvi i casi di citazione a fini di critica, discussione o insegnamento (art. 70 L. 633/1941) con indicazione della fonte.`,
			),
			block('h2', '3. Utilizzo del servizio newsletter'),
			block(
				'normal',
				'Il servizio di newsletter è fornito gratuitamente previo consenso esplicito (double opt-in). È possibile revocare il consenso e cancellarsi in qualsiasi momento tramite il link di unsubscribe presente in calce a ogni email, oppure tramite endpoint dedicato. Non è consentito l\'uso dell\'indirizzo email altrui senza autorizzazione.',
			),
			block('h2', '4. Limitazione di responsabilità'),
			block(
				'normal',
				`Le informazioni pubblicate hanno scopo puramente informativo e divulgativo. ${contactName} non garantisce l\'accuratezza, la completezza o l\'attualità dei contenuti e declina ogni responsabilità per danni derivanti dall\'uso autonomo delle informazioni pubblicate. I contenuti non costituiscono consulenza professionale (medica, legale, finanziaria, di investimento o di gioco).\n\nIn particolare per le quote, probabilità e statistiche sportive pubblicate: si tratta di dati aggregati provenienti da fonti terze e non implicano alcuna raccomandazione di scommessa. Il gioco può causare dipendenza (gioco d\'azzardo patologico); gioca responsabilmente e consulta il sito del Ministero della Salute e le risorse dedicate se pensi di avere un problema.`,
			),
			block('h2', '5. Link a siti di terze parti'),
			block(
				'normal',
				'Il sito può contenere link a siti web di terze parti. Il Titolare non è responsabile del contenuto, della disponibilità o delle pratiche privacy di tali siti. L\'accesso ai link avviene sotto la responsabilità dell\'utente.',
			),
			block('h2', '6. Limitazioni tecniche e forza maggiore'),
			block(
				'normal',
				'Il Titolare non garantisce la continuità del servizio, l\'assenza di interruzioni, malfunzionamenti o errori. Eventuali interruzioni per manutenzione, aggiornamenti tecnici o cause di forza maggiore non daranno diritto a indennizzi.',
			),
			block('h2', '7. Proprietà intellettuale e marchi'),
			block(
				'normal',
				'Marchi, loghi e segni distintivi di terze parti (club, federazioni, leghe, sponsor) appartengono ai rispettivi proprietari e sono utilizzati a scopo esclusivamente informativo e descrittivo, nel rispetto delle leggi sui marchi e della leale concorrenza.',
			),
			block('h2', '8. Legge applicabile e foro competente'),
			block(
				'normal',
				'I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia derivante dall\'uso del sito è competente in via esclusiva il Foro di Roma, salvi i diritti inderogabili del consumatore (D.Lgs. 206/2005) quando l\'utente agisce in qualità di consumatore.',
			),
			block('h2', '9. Contatti'),
			block(
				'normal',
				`Per qualsiasi richiesta relativa ai presenti Termini scrivi a ${contactEmail}.`,
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
console.log(
	`📝  Completare le informazioni del Titolare in privacy-policy controllando le env var:`,
)
console.log(`   NEXT_PUBLIC_CONTACT_NAME → "${contactName}"`)
console.log(`   NEXT_PUBLIC_CONTACT_ADDRESS → "${contactAddress}"`)
console.log(`   NEXT_PUBLIC_CONTACT_EMAIL → "${contactEmail}"`)
