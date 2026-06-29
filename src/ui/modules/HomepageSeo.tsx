import Link from 'next/link'

export function HomepageH1() {
	return (
		<div className="mx-auto max-w-screen-2xl px-4 pt-6 sm:px-6">
			<h1 className="text-center font-heading text-2xl font-bold uppercase tracking-wide text-ink sm:text-3xl md:text-4xl">
				TRM Sport — Analisi, Notizie e Fantacalcio in tempo reale
			</h1>
		</div>
	)
}

/**
 * SEO disclaimer block rendered inside the footer on the homepage.
 * Styled like a legal/copyright notice: tiny text, tight line-height,
 * muted color, blends naturally with the footer.
 */
export function HomepageSeoFooter() {
	return (
		<div className="bg-surface">
			<div className="mx-auto max-w-screen-2xl border-t border-line px-3 py-4 sm:px-6">
				<div className="space-y-1.5 text-[10px] leading-tight text-muted">
					<p>
						TRM Sport — il portale dedicato alle ultime notizie sportive italiane e internazionali. Ogni giorno la redazione seleziona, analizza e approfondisce i fatti più rilevanti dal mondo dello sport, offrendo un punto di vista editoriale indipendente, aggiornato e approfondito. Il nostro obiettivo è fornire ai lettori notizie sportive verificate, analisi tattiche di qualità e contenuti che permettano di vivere lo sport in modo più consapevole.
					</p>
					<p>
						Il <Link href="/calcio" className="underline">calcio</Link> è al centro della nostra copertura editoriale: dalla Serie A alla Champions League, passando per la Premier League, la Liga, la Bundesliga e il calcio estero, seguiamo da vicino ogni partita, ogni decisione tattica e ogni trattativa di <Link href="/calciomercato" className="underline">calciomercato</Link> che può cambiare il volto di una stagione. Le nostre analisi tattiche, le pagelle e i commenti post-partita ti permettono di comprendere il gioco oltre il risultato. Che si tratti di notizie calcio in tempo reale, approfondimenti sulla Serie A o aggiornamenti sulle competizioni europee, troverai sempre contenuti curati dalla nostra redazione.
					</p>
					<p>
						Per gli appassionati di motori, la sezione <Link href="/formula-1" className="underline">Formula 1</Link> offre cronache dettagliate di ogni Gran Premio, approfondimenti sulle strategie dei team e analisi tecniche delle monoposto. Dalle prestazioni della Ferrari agli aggiornamenti sui piloti e le classifiche mondiali, copriamo ogni aspetto del circus più veloce del mondo. Non manca la copertura della <Link href="/motogp" className="underline">MotoGP</Link> e del motorsport in generale, con notizie e risultati sempre aggiornati.
					</p>
					<p>
						Il <Link href="/tennis" className="underline">tennis</Link> trova ampio spazio con la copertura dei tornei del Grande Slam — Australian Open, Roland Garros, Wimbledon e US Open — dei Masters 1000 e del circuito ATP e WTA. Seguiamo i protagonisti del tennis italiano e internazionale, con un occhio attento alle nuove generazioni che stanno ridefinendo questo sport. Dalle cronache dei match alle analisi delle classifiche, il tennis su TRM Sport è raccontato con passione e competenza.
					</p>
					<p>
						La sezione <Link href="/fantacalcio" className="underline">fantacalcio</Link> è dedicata a tutti i fantallenatori: consigli settimanali, probabili formazioni, analisi dei match e suggerimenti strategici per le aste. Che tu sia un esperto o alle prime armi, troverai rubriche pensate per aiutarti a costruire la squadra perfetta. Completano l&#39;offerta le sezioni dedicate al basket, con la copertura di NBA e Serie A.
					</p>
					<p>
						TRM Sport è più di un sito di news: è una community di appassionati. Ogni articolo è firmato dalla nostra redazione e rispetta i principi di trasparenza e accuratezza della nostra linea editoriale. Iscriviti alla newsletter per ricevere le notizie più importanti, seguici sui social e contattaci per segnalazioni e collaborazioni.
					</p>
					<p>
						<Link href="/calcio" className="underline">Ultime notizie calcio</Link> · <Link href="/tennis" className="underline">Notizie tennis e tornei</Link> · <Link href="/formula-1" className="underline">News Formula 1 e motori</Link> · <Link href="/fantacalcio" className="underline">Consigli fantacalcio</Link> · <Link href="/calciomercato" className="underline">Calciomercato</Link> · <Link href="/chi-siamo" className="underline">Chi siamo</Link>
					</p>
				</div>
			</div>
		</div>
	)
}
