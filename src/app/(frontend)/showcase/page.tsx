import { Suspense } from 'react'
import { Metadata } from 'next'
import {
	MatchResult,
	PlayerStats,
	Lineup,
	MatchTimeline,
	Standings as StandingsBlock,
	Callout as ArticleCallout,
	QuoteBlock,
	VideoEmbed,
	InfoBox,
	SocialEmbed,
	ImageGallery,
} from '@/ui/blog/blocks'
import Admonition from '@/ui/modules/RichtextModule/Admonition'
import AnchoredHeading from '@/ui/modules/RichtextModule/AnchoredHeading'
import TableOfContents from '@/ui/modules/RichtextModule/TableOfContents'
import RelatedPosts from '@/ui/modules/blog/RelatedPosts'
import SectionCard from '@/ui/primitives/SectionCard'
import Hero from '@/ui/modules/Hero'
import NewsletterSubscribe from '@/ui/features/newsletter'
import CardList from '@/ui/modules/CardList'
import AccordionList from '@/ui/modules/AccordionList'
import ModuleCallout from '@/ui/modules/Callout'
import Divider from '@/ui/modules/Divider'
import ArticleCarousel from '@/ui/modules/ArticleCarousel'
import EditorialBanner from '@/ui/modules/EditorialBanner'
import BlogList from '@/ui/modules/blog/BlogList'
import PostsFeed from '@/ui/modules/PostsFeed'
import StandingsModule from '@/ui/modules/Standings'
import Breadcrumbs from '@/ui/modules/Breadcrumbs'
import { bgClasses } from '@/lib/bgClasses'

export const metadata: Metadata = {
	title: 'Showcase Componenti',
	robots: { index: false, follow: false },
}

function Section({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
	return (
		<section className={`rounded-2xl border border-line-soft bg-surface/50 p-6 sm:p-8 ${wide ? 'space-y-6' : 'mx-auto max-w-screen-md space-y-6'}`}>
			<h2 className="border-b-2 border-brand pb-3 text-2xl font-black uppercase tracking-tight text-ink">
				{title}
			</h2>
			{children}
		</section>
	)
}

function Variant({ label, props }: { label: string; props?: string }) {
	return (
		<div className="flex items-baseline gap-3 rounded-lg bg-ink/5 px-3 py-2">
			<span className="text-xs font-bold uppercase tracking-widest text-brand">{label}</span>
			{props && <code className="text-xs text-muted-foreground">{props}</code>}
		</div>
	)
}

const ptBlock = (key: string, text: string) => {
	// Support **bold** markdown syntax in text
	const boldMatch = text.match(/^\*\*(.+)\*\*$/)
	if (boldMatch) {
		return {
			_type: 'block' as const,
			_key: key,
			children: [{ _type: 'span' as const, _key: `${key}s`, text: boldMatch[1], marks: ['strong'] }],
			markDefs: [],
		}
	}
	return {
		_type: 'block' as const,
		_key: key,
		children: [{ _type: 'span' as const, _key: `${key}s`, text }],
		markDefs: [],
	}
}

export default function ShowcasePage() {
	return (
		<div className="space-y-16 px-4 py-12">
			<div className="mx-auto max-w-screen-md">
				<h1 className="text-4xl font-black uppercase tracking-tighter text-ink">
					Showcase Componenti
				</h1>
				<p className="mt-2 text-muted-foreground">
					Tutti i componenti disponibili per le pagine e gli articoli, con varianti di esempio.
				</p>
			</div>

			{/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
			    SEZIONE 1: MODULI DI PAGINA
			    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

			<div className="mx-auto max-w-screen-md">
				<h2 className="text-lg font-bold uppercase tracking-widest text-muted-foreground">
					Moduli di pagina
				</h2>
				<p className="text-sm text-muted-foreground">
					Componenti usati per costruire le pagine del sito (homepage, landing, ecc.)
				</p>
			</div>

			{/* ── HERO ── */}
			<Section title="Hero" wide>
				<div className="mx-auto max-w-screen-lg">
					<p className="text-sm text-muted-foreground mb-4">
						Carousel di slide con auto-rotate (6s), drag/swipe, frecce e indicatori.
					</p>
					{/* @ts-expect-error -- mock Sanity.Module props */}
					<Hero
						slides={[
							{
								_key: 'slide-1',
								title: 'Derby Inter-Milan: Lautaro trascina i nerazzurri',
								description: 'Tripletta e prestazione da MVP per il Toro nel derby della Madonnina. Inter vola in vetta.',
								author: { name: 'Trm Sport' },
								imageUrl: 'https://picsum.photos/seed/hero1/1200/675',
								cta: { link: { type: 'external', external: '#', label: 'Leggi di più' }, _type: 'cta' },
							} as any,
							{
								_key: 'slide-2',
								title: 'Champions League: il sorteggio dei quarti',
								description: 'Tutte le sfide dei quarti di finale. Le italiane pescano avversari ostici.',
								author: { name: 'Trm Sport' },
								imageUrl: 'https://picsum.photos/seed/hero2/1200/675',
								cta: { link: { type: 'external', external: '#', label: 'Leggi di più' }, _type: 'cta' },
							} as any,
							{
								_key: 'slide-3',
								title: 'Calciomercato: le trattative calde di giugno',
								description: 'Da Osimhen al PSG a Zirkzee al Milan: tutti i nomi sul tavolo.',
								author: { name: 'Trm Sport' },
								imageUrl: 'https://picsum.photos/seed/hero3/1200/675',
								cta: { link: { type: 'external', external: '#', label: 'Leggi di più' }, _type: 'cta' },
							} as any,
						]}
					/>
				</div>
			</Section>

			{/* ── ARTICLE CAROUSEL ── */}
			<Section title="Article Carousel" wide>
				<p className="mx-auto max-w-screen-md text-sm text-muted-foreground">
					Carosello articoli stile hero — circolare, con peek laterale. Dati live dal CMS.
				</p>
				<Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
					{/* @ts-expect-error -- Sanity.Module _type/_key not needed for showcase */}
					<ArticleCarousel limit={5} showFeaturedFirst />
				</Suspense>
			</Section>

			{/* ── POSTS FEED ── */}
			<Section title="Posts Feed" wide>
				<p className="mx-auto max-w-screen-md text-sm text-muted-foreground">
					Modulo universale per mostrare articoli. Un solo componente, configurabile per fonte dati e layout.
				</p>

				<Variant label="Ultimi — Carosello" props='source="latest" layout="carousel"' />
				<Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
					{/* @ts-expect-error -- Sanity.Module _type/_key not needed for showcase */}
					<PostsFeed title="Ultime Notizie" source="latest" layout="carousel" limit={6} nested />
				</Suspense>

				<Variant label="Trending — Griglia" props='source="trending" layout="grid"' />
				<Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
					{/* @ts-expect-error -- Sanity.Module _type/_key not needed for showcase */}
					<PostsFeed title="Di Tendenza" source="trending" layout="grid" limit={4} nested />
				</Suspense>

				<Variant label="Ultimi — Lista numerata" props='source="latest" layout="numbered"' />
				<div className="mx-auto max-w-sm">
					<Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-muted" />}>
						{/* @ts-expect-error -- Sanity.Module _type/_key not needed for showcase */}
						<PostsFeed title="TOP 5" source="latest" layout="numbered" limit={5} nested />
					</Suspense>
				</div>

				<Variant label="Trending — Lista con miniature" props='source="trending" layout="thumbs"' />
				<div className="mx-auto max-w-sm">
					<Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-muted" />}>
						{/* @ts-expect-error -- Sanity.Module _type/_key not needed for showcase */}
						<PostsFeed title="Da Non Perdere" source="trending" layout="thumbs" limit={5} nested />
					</Suspense>
				</div>

				<Variant label="Ultimi — Lista compatta" props='source="latest" layout="list"' />
				<Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-muted" />}>
					{/* @ts-expect-error -- Sanity.Module _type/_key not needed for showcase */}
					<PostsFeed title="Altre Notizie" source="latest" layout="list" limit={6} nested />
				</Suspense>
			</Section>

			{/* ── BLOG LIST — CARD GRANDE ── */}
			<Section title="Blog List — Card Grande" wide>
				<p className="mx-auto max-w-screen-md text-sm text-muted-foreground">
					Lista articoli con card grandi — immagine a tutto campo, titolo e categoria sovrapposti.
				</p>
				<Variant label="Carousel — card grande" props='layout="carousel" cardSize="large"' />
				<Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
					{/* @ts-expect-error -- Sanity.Module _type/_key not needed for showcase */}
					<BlogList layout="carousel" cardSize="large" limit={6} nested />
				</Suspense>
				<Variant label="Grid — card grande" props='layout="grid" cardSize="large"' />
				<Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
					{/* @ts-expect-error -- Sanity.Module _type/_key not needed for showcase */}
					<BlogList layout="grid" cardSize="large" limit={4} nested />
				</Suspense>
			</Section>

			{/* ── BREADCRUMBS ── */}
			<Section title="Breadcrumbs">
				<p className="text-sm text-muted-foreground">
					Navigazione a briciole con markup Schema.org per SEO.
				</p>
				<Breadcrumbs
					crumbs={[
						{ label: 'Home', internal: { _type: 'page', title: 'Home', metadata: { slug: { current: '/' } } } } as any,
						{ label: 'Blog', internal: { _type: 'page', title: 'Blog', metadata: { slug: { current: '/blog' } } } } as any,
					]}
					currentPage={{ title: 'Derby Inter-Milan 3-1', metadata: { title: 'Derby Inter-Milan' } } as any}
				/>
				<Breadcrumbs
					crumbs={[
						{ label: 'Home', internal: { _type: 'page', title: 'Home', metadata: { slug: { current: '/' } } } } as any,
						{ label: 'Blog', internal: { _type: 'page', title: 'Blog', metadata: { slug: { current: '/blog' } } } } as any,
						{ label: 'Serie A', internal: { _type: 'page', title: 'Serie A', metadata: { slug: { current: '/blog/serie-a' } } } } as any,
					]}
					currentPage={{ title: 'Classifica aggiornata', metadata: { title: 'Classifica' } } as any}
				/>
			</Section>

			{/* ── BLOG LIST (live da Sanity) ── */}
			<Section title="Blog List" wide>
				<p className="mx-auto max-w-screen-md text-sm text-muted-foreground">
					Lista articoli da Sanity — layout carousel e grid. Dati live dal CMS.
				</p>
				<Variant label="Carousel" props='layout="carousel" limit={4}' />
				<Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
					{/* @ts-expect-error -- Sanity.Module _type/_key not needed for showcase */}
					<BlogList layout="carousel" limit={4} nested />
				</Suspense>
				<Variant label="Grid con filtri" props='layout="grid" limit={6} displayFilters' />
				<Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
					{/* @ts-expect-error -- Sanity.Module _type/_key not needed for showcase */}
					<BlogList layout="grid" limit={6} displayFilters nested />
				</Suspense>
			</Section>

			{/* ── CARD LIST ── */}
			<Section title="Card List">
				<p className="text-sm text-muted-foreground">
					Grid di card con contenuto e CTA. Supporta layout grid e carousel.
				</p>
				<Variant label="Grid 3 colonne" props='layout="grid" columns={3} visualSeparation' />
				{/* @ts-expect-error -- showcase mock */}
				<CardList
					pretitle="Le nostre rubriche"
					cards={[
						{ content: [ptBlock('c1', '**Tatticamente**'), ptBlock('c1b', 'Analisi tattiche approfondite delle partite di Serie A e Champions League.')] },
						{ content: [ptBlock('c2', '**Mercato Flash**'), ptBlock('c2b', 'Le ultime notizie di calciomercato, aggiornate in tempo reale.')] },
						{ content: [ptBlock('c3', '**Pagelle**'), ptBlock('c3b', 'I voti e le valutazioni dei protagonisti dopo ogni giornata.')] },
					]}
					layout="grid"
					columns={3}
					visualSeparation
					nested
				/>
				<Variant label="Carousel" props='layout="carousel"' />
				{/* @ts-expect-error -- showcase mock */}
				<CardList
					pretitle="Highlights della settimana"
					cards={[
						{ content: [ptBlock('h1', '**Lautaro MVP**'), ptBlock('h1b', 'Tripletta nel derby e record di gol stagionali.')] },
						{ content: [ptBlock('h2', '**Sorpresa Atalanta**'), ptBlock('h2b', 'La Dea batte il Real Madrid al Bernabéu.')] },
						{ content: [ptBlock('h3', '**Caso Osimhen**'), ptBlock('h3b', 'Il Napoli fissa il prezzo: 130 milioni o niente.')] },
						{ content: [ptBlock('h4', '**Italia U21**'), ptBlock('h4b', 'Europeo da sogno: vittoria in finale contro la Spagna.')] },
					]}
					layout="carousel"
					nested
				/>
			</Section>

			{/* ── ACCORDION LIST ── */}
			<Section title="Accordion List">
				<p className="text-sm text-muted-foreground">
					FAQ e contenuti espandibili. Layout verticale e orizzontale.
				</p>
				<Variant label="Verticale — connesso" props='layout="vertical" connect' />
				<AccordionList
					_key="acc-demo"
					_type="accordion-list"
					pretitle="FAQ"
					intro={[ptBlock('acc-intro', 'Domande frequenti sul blog')]}
					items={[
						{ summary: 'Come posso iscrivermi alla newsletter?', content: [ptBlock('a1', 'Trovi il form di iscrizione in fondo a ogni pagina, nella sidebar degli articoli, oppure nella sezione dedicata. Basta inserire la tua email.')], open: true } as any,
						{ summary: 'Con che frequenza pubblicate?', content: [ptBlock('a2', 'Pubblichiamo nuovi articoli ogni giorno durante la stagione calcistica. Durante le pause seguiamo il calciomercato e le nazionali.')] } as any,
						{ summary: 'Posso proporre un argomento?', content: [ptBlock('a3', 'Certo! Scrivici sui social o via email. Leggiamo tutti i suggerimenti e cerchiamo di trattare gli argomenti più richiesti.')] } as any,
						{ summary: 'Gli articoli sono disponibili in altre lingue?', content: [ptBlock('a4', 'Al momento il blog è solo in italiano, ma stiamo valutando di aggiungere una versione in inglese per i contenuti più importanti.')] } as any,
					]}
					layout="vertical"
					connect
					nested
				/>
				<Variant label="Orizzontale — Schema.org FAQ" props='layout="horizontal" generateSchema' />
				<AccordionList
					_key="acc-horiz"
					_type="accordion-list"
					pretitle="Regolamento"
					intro={[ptBlock('acc-h-intro', 'Le regole della Serie A 2025/26')]}
					items={[
						{ summary: 'Quante sostituzioni si possono fare?', content: [ptBlock('r1', 'Cinque sostituzioni in tre finestre, più una extra nei tempi supplementari.')] } as any,
						{ summary: 'Come funziona il VAR?', content: [ptBlock('r2', 'Il VAR interviene solo in caso di chiaro ed evidente errore su gol, rigori, cartellini rossi e scambi di identità.')] } as any,
						{ summary: 'Cosa succede in caso di parità punti?', content: [ptBlock('r3', 'Si guarda lo scontro diretto, poi differenza reti negli scontri diretti, poi differenza reti generale, poi gol segnati.')] } as any,
					]}
					layout="horizontal"
					generateSchema
					nested
				/>
			</Section>

			{/* ── MODULE CALLOUT ── */}
			<Section title="Callout (Modulo)">
				<p className="text-sm text-muted-foreground">
					Callout di pagina — diverso dal callout inline degli articoli. Per messaggi importanti e CTA.
				</p>
				<ModuleCallout
					content={[
						ptBlock('mc1', '**Non perderti nessun articolo!**'),
						ptBlock('mc2', 'Iscriviti alla newsletter per ricevere analisi, pagelle e calciomercato direttamente nella tua inbox.'),
					]}
					nested
				/>
			</Section>

			{/* ── NEWSLETTER ── */}
			<Section title="Newsletter">
				<p className="text-sm text-muted-foreground">
					Tre varianti del form newsletter.
				</p>
				<Variant label="Extended (hero)" props='variant="extended"' />
				<NewsletterSubscribe
					variant="extended"
					title="Resta aggiornato"
					description="Le ultime notizie di calcio, ogni settimana nella tua inbox."
				/>
				<Variant label="Inline" props='variant="inline"' />
				<NewsletterSubscribe
					variant="inline"
					title="Newsletter"
					description="Iscriviti per non perdere nessun articolo."
				/>
				<Variant label="Compact (sidebar)" props='variant="compact"' />
				<div className="max-w-xs">
					<NewsletterSubscribe
						variant="compact"
						title="Newsletter"
					/>
				</div>
			</Section>

			{/* ── EDITORIAL BANNER ── */}
			<Section title="Banner Editoriale" wide>
				<p className="mx-auto max-w-screen-md text-sm text-muted-foreground">
					Banner promozionale con decorazioni SVG sport-specifiche e gradienti dinamici. 15 preset disponibili.
				</p>

				<Variant label="Completo — Calcio" props='preset="calcio-green" category="Match Report" author + timeAgo + CTA' />
				<EditorialBanner
					preset="calcio-green"
					category="Match Report"
					title="Derby Infinito: Inter-Milan 3-1, Lautaro firma la notte perfetta"
					subtitle="Tripletta del Toro e prestazione maiuscola di Barella: Inzaghi espugna il Meazza e resta in scia al Napoli."
					author="Marco Rossi"
					timeAgo="2 ore fa"
					ctaText="LEGGI"
					ctaLink={{ type: 'external', external: '#' } as any}
				/>

				<Variant label="Con sottotitolo — Analisi" props='preset="analisi-violet" category="Analisi del Giorno"' />
				<EditorialBanner
					preset="analisi-violet"
					category="Analisi del Giorno"
					title="Perché l'Inter domina a centrocampo: il ruolo chiave di Calhanoglu"
					subtitle="La regia del turco è il motore nascosto della squadra di Inzaghi. Numeri e posizionamento."
				/>

				<Variant label="Autore + tempo — F1" props='preset="f1-red" category="GP Monaco" author + timeAgo' />
				<EditorialBanner
					preset="f1-red"
					category="GP Monaco"
					title="Leclerc trionfa a Monaco: «Un sogno che si avvera»"
					author="Matteo Bianchi"
					timeAgo="5 ore fa"
					ctaText="SCOPRI"
				/>

				<Variant label="Solo titolo — Tennis" props='preset="tennis-clay" category="Internazionali"' />
				<EditorialBanner
					preset="tennis-clay"
					category="Internazionali"
					title="Sinner batte Alcaraz in tre set e vola in semifinale"
				/>

				<Variant label="Basket — vari colori" props='tre preset NBA a confronto' />
				<div className="grid gap-4 md:grid-cols-3">
					<EditorialBanner
						preset="basket-nba"
						category="NBA"
						title="I Lakers vincono a Denver: Davis dominante"
						ctaText="LEGGI"
					/>
					<EditorialBanner
						preset="basket-bulls"
						category="NBA"
						title="Bulls in corsa per i playoff: segnali di ripresa"
						ctaText="LEGGI"
					/>
					<EditorialBanner
						preset="basket-lakers"
						category="NBA"
						title="LeBron da record: superati i 40.000 punti in carriera"
						ctaText="LEGGI"
					/>
				</div>

				<Variant label="Calcio — tutte le tinte" props='green + blue + amber' />
				<div className="grid gap-4 md:grid-cols-3">
					<EditorialBanner preset="calcio-green" category="Serie A" title="Lautaro show: tripletta nel derby" ctaText="LEGGI" />
					<EditorialBanner preset="calcio-blue" category="Champions" title="L'Inter vola a Istanbul: rimonta da sogno" ctaText="LEGGI" />
					<EditorialBanner preset="calcio-amber" category="Mercato" title="Osimhen saluta: è fatta col PSG" ctaText="LEGGI" />
				</div>

				<Variant label="Analisi — tutte le tinte" props='violet + blue + indigo' />
				<div className="grid gap-4 md:grid-cols-3">
					<EditorialBanner preset="analisi-violet" category="Analisi" title="Il nuovo modulo di Inzaghi: 3-5-2 o 3-4-3?" ctaText="ANALISI" />
					<EditorialBanner preset="analisi-blue" category="Analisi" title="La corsa Scudetto: i numeri del rush finale" ctaText="ANALISI" />
					<EditorialBanner preset="analisi-indigo" category="Analisi" title="Percentuali e xG: la fotografia della stagione" ctaText="ANALISI" />
				</div>

				<Variant label="Tennis — tutte le superfici" props='clay + grass + hard' />
				<div className="grid gap-4 md:grid-cols-3">
					<EditorialBanner preset="tennis-clay" category="Terra" title="Nadal: «Roland Garros sarà l'ultima danza»" ctaText="LEGGI" />
					<EditorialBanner preset="tennis-grass" category="Erba" title="Djokovic vince il suo nono Wimbledon" ctaText="LEGGI" />
					<EditorialBanner preset="tennis-hard" category="Cemento" title="Sinner conquista gli Australian Open" ctaText="LEGGI" />
				</div>
			</Section>

			{/* ── STANDINGS MODULE (live da API) ── */}
			<Section title="Standings (Modulo)" wide>
				<p className="mx-auto max-w-screen-md text-sm text-muted-foreground">
					Classifiche live da football-data.org. Diverse competizioni e configurazioni.
				</p>
				<div className="mx-auto max-w-screen-md grid gap-8 md:grid-cols-2">
					<div>
						<Variant label="Serie A — top 5" props='competition="SA" rows="5"' />
						<Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-muted" />}>
							<StandingsModule competition="SA" mobileRows="5" desktopRows="5" nested />
						</Suspense>
					</div>
					<div>
						<Variant label="Premier League — top 5" props='competition="PL" rows="5"' />
						<Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-muted" />}>
							<StandingsModule competition="PL" mobileRows="5" desktopRows="5" nested />
						</Suspense>
					</div>
				</div>
				<div className="mx-auto max-w-screen-md">
					<Variant label="La Liga — completa" props='competition="PD" desktopRows="all"' />
					<Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
						<StandingsModule competition="PD" mobileRows="10" desktopRows="all" nested />
					</Suspense>
				</div>
			</Section>

			{/* ── DIVIDER ── */}
			<Section title="Divider">
				<p className="text-sm text-muted-foreground">
					Separatore visuale tra sezioni.
				</p>
				<Divider />
			</Section>

			{/* ── TABLE OF CONTENTS (sidebar) ── */}
			<Section title="Table of Contents (Sidebar)">
				<p className="text-sm text-muted-foreground">
					Indice dei contenuti — versione sidebar con card bordata. Usato nella pagina articolo.
				</p>
				<div className="max-w-xs">
					<SectionCard className="bg-surface-light p-5 sm:p-6">
						<TableOfContents
							headings={[
								{ text: 'Cronaca del match', style: 'h2' },
								{ text: 'Primo tempo', style: 'h3' },
								{ text: 'Secondo tempo', style: 'h3' },
								{ text: 'Le formazioni', style: 'h2' },
								{ text: 'Le pagelle', style: 'h2' },
								{ text: 'I migliori in campo', style: 'h3' },
								{ text: 'I peggiori in campo', style: 'h3' },
								{ text: 'Cosa ne pensiamo', style: 'h2' },
							]}
						/>
					</SectionCard>
				</div>
			</Section>

			{/* ── RELATED POSTS (sidebar) ── */}
			<Section title="Articoli Correlati (Sidebar)">
				<p className="text-sm text-muted-foreground">
					Card sidebar articoli correlati — immagine, tag categoria, titolo, tempo lettura. Dati live dal CMS.
				</p>
				<div className="w-[380px] max-w-full">
					<Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-muted" />}>
						<RelatedPosts
							post={{
								_id: 'showcase-mock',
								categories: [],
								tags: [{ _id: 'any-tag', slug: { current: 'calcio' } } as any],
							} as any}
							variant="sidebar"
						/>
					</Suspense>
				</div>
			</Section>

			{/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
			    SEZIONE 2: BLOCCHI ARTICOLO
			    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

			<div className="mx-auto max-w-screen-md">
				<h2 className="text-lg font-bold uppercase tracking-widest text-muted-foreground">
					Blocchi articolo
				</h2>
				<p className="text-sm text-muted-foreground">
					Componenti inseribili nel corpo degli articoli tramite Sanity Studio.
				</p>
			</div>

			{/* ── ANCHORED HEADING ── */}
			<Section title="Anchored Heading" wide={false}>
				<p className="text-sm text-muted-foreground">
					Titoli con ancora cliccabile — usati per la Table of Contents automatica. Hover per vedere il #.
				</p>
				{/* @ts-expect-error -- PortableTextComponentProps mock for showcase */}
				<AnchoredHeading
					as="h2"
					value={{ _type: 'block', _key: 'h2demo', children: [{ _type: 'span', _key: 'h2s', text: 'Titolo H2 con ancora' }], markDefs: [], style: 'h2' }}
				>
					Titolo H2 con ancora
				</AnchoredHeading>
				{/* @ts-expect-error -- PortableTextComponentProps mock for showcase */}
				<AnchoredHeading
					as="h3"
					value={{ _type: 'block', _key: 'h3demo', children: [{ _type: 'span', _key: 'h3s', text: 'Sottotitolo H3 con ancora' }], markDefs: [], style: 'h3' }}
				>
					Sottotitolo H3 con ancora
				</AnchoredHeading>
				{/* @ts-expect-error -- PortableTextComponentProps mock for showcase */}
				<AnchoredHeading
					as="h4"
					value={{ _type: 'block', _key: 'h4demo', children: [{ _type: 'span', _key: 'h4s', text: 'Sottotitolo H4 con ancora' }], markDefs: [], style: 'h4' }}
				>
					Sottotitolo H4 con ancora
				</AnchoredHeading>
			</Section>

			{/* ── IMAGE GALLERY ── */}
			<Section title="Image Gallery">
				<Variant label="Carousel (default)" props="swipe/drag" />
				<ImageGallery
					value={{
						title: 'Derby di Milano — Le foto',
						images: [
							{ imageUrl: 'https://picsum.photos/seed/derby1/800/450', caption: 'Il gol di Lautaro', credit: 'Getty Images' },
							{ imageUrl: 'https://picsum.photos/seed/derby2/800/450', caption: 'Esultanza sotto la curva', credit: 'Reuters' },
							{ imageUrl: 'https://picsum.photos/seed/derby3/800/450', caption: 'Il rigore di Calhanoglu', credit: 'AFP' },
							{ imageUrl: 'https://picsum.photos/seed/derby4/800/450', caption: 'Inzaghi a fine partita' },
						],
					}}
				/>
				<Variant label="Grid" props='layout="grid"' />
				<ImageGallery
					value={{
						title: 'Pre-partita — Dietro le quinte',
						layout: 'grid',
						images: [
							{ imageUrl: 'https://picsum.photos/seed/pre1/800/450', caption: 'Riscaldamento' },
							{ imageUrl: 'https://picsum.photos/seed/pre2/800/450', caption: 'Spogliatoio' },
							{ imageUrl: 'https://picsum.photos/seed/pre3/800/450', caption: 'Tunnel' },
						],
					}}
				/>
				<Variant label="Masonry" props='layout="masonry"' />
				<ImageGallery
					value={{
						title: 'Conferenza stampa',
						layout: 'masonry',
						images: [
							{ imageUrl: 'https://picsum.photos/seed/conf1/800/450', caption: 'Inzaghi al microfono' },
							{ imageUrl: 'https://picsum.photos/seed/conf2/800/450', caption: 'Domande dei giornalisti' },
							{ imageUrl: 'https://picsum.photos/seed/conf3/800/450', caption: 'Lautaro con il trofeo' },
							{ imageUrl: 'https://picsum.photos/seed/conf4/800/450', caption: 'Foto di squadra' },
						],
					}}
				/>
			</Section>

			{/* ── CUSTOM HTML ── */}
			<Section title="Custom HTML">
				<p className="text-sm text-muted-foreground">
					Blocco HTML/CSS libero — per widget, embed custom, o contenuti speciali.
				</p>
				<div className="rounded-xl border border-line overflow-hidden">
					<div className="bg-muted/50 px-4 py-3 text-xs font-mono text-muted-foreground border-b border-line">
						custom-html
					</div>
					<div className="p-4">
						<div
							style={{
								background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
								borderRadius: 12,
								padding: '24px',
								textAlign: 'center',
								color: 'white',
							}}
						>
							<div style={{ fontSize: 14, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 2 }}>
								Prossima partita
							</div>
							<div style={{ fontSize: 28, fontWeight: 900, margin: '12px 0' }}>
								Inter vs Juventus
							</div>
							<div style={{ fontSize: 16, opacity: 0.8 }}>
								Domenica 24 Maggio — 20:45 — San Siro
							</div>
							<div
								style={{
									marginTop: 16,
									display: 'inline-block',
									padding: '8px 24px',
									borderRadius: 8,
									background: 'rgba(255,255,255,0.15)',
									fontSize: 13,
									fontWeight: 600,
								}}
							>
								Serie A — Giornata 37
							</div>
						</div>
					</div>
				</div>
			</Section>

			{/* ── MATCH RESULT ── */}
			<Section title="Match Result">
				<MatchResult
					value={{
						competition: 'Serie A',
						matchday: 'Giornata 34',
						date: '2026-05-10',
						stadium: 'San Siro, Milano',
						homeTeam: 'Inter',
						homeScore: 3,
						awayTeam: 'Milan',
						awayScore: 1,
						status: 'finished',
						homeScorers: ["Lautaro 12'", "Barella 45'", "Thuram 78'"],
						awayScorers: ["Leão 55'"],
					}}
				/>
				<MatchResult
					value={{
						competition: 'Champions League',
						matchday: 'Semifinale - Andata',
						stadium: 'Santiago Bernabéu, Madrid',
						homeTeam: 'Real Madrid',
						homeScore: 2,
						awayTeam: 'Arsenal',
						awayScore: 2,
						status: 'live',
						homeScorers: ["Mbappé 23'", "Bellingham 67'"],
						awayScorers: ["Saka 31'", "Rice 72'"],
					}}
				/>
				<MatchResult
					value={{
						competition: 'Coppa Italia',
						matchday: 'Finale',
						date: '2026-05-21',
						stadium: 'Olimpico, Roma',
						homeTeam: 'Juventus',
						homeScore: 0,
						awayTeam: 'Napoli',
						awayScore: 0,
						status: 'scheduled',
					}}
				/>
			</Section>

			{/* ── PLAYER STATS ── */}
			<Section title="Player Stats">
				<PlayerStats
					value={{
						playerName: 'Lautaro Martínez',
						team: 'Inter',
						role: 'forward',
						rating: 8.5,
						stats: [
							{ label: 'Gol', value: '24' },
							{ label: 'Assist', value: '8' },
							{ label: 'Presenze', value: '31' },
							{ label: 'xG', value: '21.3' },
							{ label: 'Minuti', value: "2'680" },
						],
					}}
				/>
				<PlayerStats
					value={{
						playerName: 'Gianluigi Donnarumma',
						team: 'PSG',
						role: 'goalkeeper',
						rating: 5.5,
						stats: [
							{ label: 'Clean Sheet', value: '4' },
							{ label: 'Parate', value: '87' },
							{ label: 'Gol Subiti', value: '38' },
							{ label: 'xGOT', value: '42.1' },
							{ label: 'Presenze', value: '29' },
						],
					}}
				/>
				<PlayerStats
					value={{
						playerName: 'Nicolò Barella',
						team: 'Inter',
						role: 'midfielder',
						rating: 7.0,
						stats: [
							{ label: 'Gol', value: '6' },
							{ label: 'Assist', value: '11' },
							{ label: 'Key Pass', value: '67' },
							{ label: 'Tackle Vinti', value: '48' },
							{ label: 'Passaggi', value: '1842' },
						],
					}}
				/>
			</Section>

			{/* ── LINEUP ── */}
			<Section title="Lineup">
				<Lineup
					value={{
						teamName: 'Inter',
						formation: '3-5-2',
						coach: 'Simone Inzaghi',
						starters: [
							{ number: 1, name: 'Sommer', position: 'GK' },
							{ number: 28, name: 'Pavard', position: 'DEF' },
							{ number: 15, name: 'Acerbi', position: 'DEF' },
							{ number: 95, name: 'Bastoni', position: 'DEF' },
							{ number: 36, name: 'Darmian', position: 'MID' },
							{ number: 23, name: 'Barella', position: 'MID' },
							{ number: 20, name: 'Calhanoglu', position: 'MID', captain: true },
							{ number: 22, name: 'Mkhitaryan', position: 'MID' },
							{ number: 32, name: 'Dimarco', position: 'MID' },
							{ number: 10, name: 'Lautaro', position: 'FWD', captain: false },
							{ number: 9, name: 'Thuram', position: 'FWD' },
						],
						substitutes: [
							{ name: 'De Vrij', position: 'DEF' },
							{ name: 'Frattesi', position: 'MID' },
							{ name: 'Taremi', position: 'FWD' },
						],
					}}
				/>
			</Section>

			{/* ── MATCH TIMELINE ── */}
			<Section title="Match Timeline">
				<MatchTimeline
					value={{
						title: 'Inter vs Milan — Cronologia',
						events: [
							{ minute: "1'", type: 'period', description: 'Inizio primo tempo' },
							{ minute: "12'", type: 'goal', team: 'home', player: 'Lautaro Martínez' },
							{ minute: "23'", type: 'yellow_card', team: 'away', player: 'Theo Hernández' },
							{ minute: "31'", type: 'goal', team: 'away', player: 'Rafael Leão', description: 'Contropiede fulminante sulla sinistra' },
							{ minute: "38'", type: 'injury', team: 'home', player: 'Acerbi', description: 'Problema muscolare' },
							{ minute: "40'", type: 'substitution', team: 'home', player: 'De Vrij', playerOut: 'Acerbi' },
							{ minute: "45'", type: 'goal', team: 'home', player: 'Barella', description: 'Tiro da fuori area' },
							{ minute: "45+2'", type: 'period', description: 'Fine primo tempo' },
							{ minute: "46'", type: 'period', description: 'Inizio secondo tempo' },
							{ minute: "55'", type: 'var', team: 'away', description: 'Gol annullato a Morata per fuorigioco' },
							{ minute: "62'", type: 'substitution', team: 'away', player: 'Pulisic', playerOut: 'Chukwueze' },
							{ minute: "71'", type: 'penalty', team: 'home', player: 'Calhanoglu', description: 'Rigore concesso per fallo su Thuram' },
							{ minute: "78'", type: 'goal', team: 'home', player: 'Thuram' },
							{ minute: "85'", type: 'red_card', team: 'away', player: 'Tomori', description: 'Doppio giallo' },
							{ minute: "90+3'", type: 'period', description: 'Fine partita' },
						],
					}}
				/>
			</Section>

			{/* ── STANDINGS ── */}
			<Section title="Standings">
				<StandingsBlock
					value={{
						title: 'Serie A 2025/26 — Classifica',
						highlightTeams: ['Inter', 'Napoli'],
						zones: [
							{ label: 'Champions League', color: 'blue', fromPosition: 1, toPosition: 4 },
							{ label: 'Europa League', color: 'orange', fromPosition: 5, toPosition: 5 },
							{ label: 'Conference League', color: 'green', fromPosition: 6, toPosition: 6 },
							{ label: 'Retrocessione', color: 'red', fromPosition: 18, toPosition: 20 },
						],
						rows: [
							{ position: 1, team: 'Inter', played: 34, won: 25, drawn: 5, lost: 4, goalsFor: 72, goalsAgainst: 28, points: 80 },
							{ position: 2, team: 'Napoli', played: 34, won: 24, drawn: 6, lost: 4, goalsFor: 65, goalsAgainst: 25, points: 78 },
							{ position: 3, team: 'Atalanta', played: 34, won: 22, drawn: 5, lost: 7, goalsFor: 68, goalsAgainst: 34, points: 71 },
							{ position: 4, team: 'Juventus', played: 34, won: 20, drawn: 8, lost: 6, goalsFor: 55, goalsAgainst: 30, points: 68 },
							{ position: 5, team: 'Milan', played: 34, won: 19, drawn: 7, lost: 8, goalsFor: 58, goalsAgainst: 38, points: 64 },
							{ position: 6, team: 'Lazio', played: 34, won: 18, drawn: 6, lost: 10, goalsFor: 52, goalsAgainst: 40, points: 60 },
							{ position: 18, team: 'Lecce', played: 34, won: 7, drawn: 8, lost: 19, goalsFor: 28, goalsAgainst: 55, points: 29 },
							{ position: 19, team: 'Monza', played: 34, won: 5, drawn: 10, lost: 19, goalsFor: 25, goalsAgainst: 58, points: 25 },
							{ position: 20, team: 'Frosinone', played: 34, won: 4, drawn: 9, lost: 21, goalsFor: 22, goalsAgainst: 62, points: 21 },
						],
					}}
				/>
				<Variant label="Compatta — top 6" props='compact highlightTeams={["Inter"]}' />
				<StandingsBlock
					value={{
						title: 'Serie A — Top 6',
						compact: true,
						highlightTeams: ['Inter'],
						zones: [
							{ label: 'Champions League', color: 'blue', fromPosition: 1, toPosition: 4 },
						],
						rows: [
							{ position: 1, team: 'Inter', played: 34, points: 80 },
							{ position: 2, team: 'Napoli', played: 34, points: 78 },
							{ position: 3, team: 'Atalanta', played: 34, points: 71 },
							{ position: 4, team: 'Juventus', played: 34, points: 68 },
							{ position: 5, team: 'Milan', played: 34, points: 64 },
							{ position: 6, team: 'Lazio', played: 34, points: 60 },
						],
					}}
				/>
			</Section>

			{/* ── CALLOUT ── */}
			<Section title="Callout">
				<ArticleCallout
					value={{
						type: 'breaking',
						title: 'ULTIM\'ORA',
						text: 'L\'Inter ha ufficializzato il rinnovo di Lautaro Martínez fino al 2030.',
						source: 'Sky Sport',
					}}
				/>
				<ArticleCallout
					value={{
						type: 'transfer',
						text: 'Secondo fonti vicine al club, il PSG avrebbe offerto 80 milioni per Barella. L\'Inter ha rifiutato.',
						source: 'Fabrizio Romano',
					}}
				/>
				<ArticleCallout
					value={{
						type: 'injury',
						title: 'Aggiornamento medico',
						text: 'Acerbi ha riportato una lesione al bicipite femorale. Tempi di recupero stimati: 3-4 settimane.',
					}}
				/>
				<ArticleCallout
					value={{
						type: 'var',
						text: 'Il gol di Morata è stato annullato dopo revisione VAR per posizione di fuorigioco di 3cm.',
					}}
				/>
				<ArticleCallout
					value={{
						type: 'stat',
						title: 'Dato interessante',
						text: 'L\'Inter non perdeva un derby in campionato da 7 partite consecutive (5V, 2P).',
					}}
				/>
				<ArticleCallout
					value={{
						type: 'rumor',
						text: 'Voci dalla Spagna: il Real Madrid monitora la situazione di Barella. Nessuna offerta ufficiale al momento.',
						source: 'Marca',
					}}
				/>
				<ArticleCallout
					value={{
						type: 'info',
						text: 'Il prossimo turno di Serie A si giocherà in infrasettimanale: tutte le partite il mercoledì sera.',
					}}
				/>
				<ArticleCallout
					value={{
						type: 'warning',
						title: 'Attenzione',
						text: 'Barella è diffidato: un cartellino giallo nel prossimo match significherebbe saltare il derby.',
					}}
				/>
			</Section>

			{/* ── INFO BOX ── */}
			<Section title="Info Box">
				<InfoBox
					value={{
						type: 'player',
						title: 'Lautaro Martínez',
						facts: [
							{ label: 'Nazionalità', value: 'Argentina 🇦🇷' },
							{ label: 'Età', value: '28 anni' },
							{ label: 'Ruolo', value: 'Attaccante' },
							{ label: 'Piede', value: 'Destro' },
							{ label: 'Contratto', value: 'Fino al 2030' },
							{ label: 'Valore', value: '€95M' },
						],
						description: 'Capitano dell\'Argentina campione del mondo 2022. Capocannoniere della Serie A nella stagione 2023/24.',
					}}
				/>
				<InfoBox
					value={{
						type: 'stadium',
						title: 'San Siro (Giuseppe Meazza)',
						facts: [
							{ label: 'Città', value: 'Milano' },
							{ label: 'Capienza', value: '75.923 posti' },
							{ label: 'Inaugurazione', value: '1926' },
							{ label: 'Superficie', value: 'Erba naturale' },
							{ label: 'Squadre', value: 'Inter, Milan' },
						],
						description: 'Uno degli stadi più iconici al mondo, chiamato anche "La Scala del Calcio".',
					}}
				/>
				<InfoBox
					value={{
						type: 'competition',
						title: 'UEFA Champions League 2025/26',
						facts: [
							{ label: 'Edizione', value: '71ª' },
							{ label: 'Formato', value: 'League phase + Knockout' },
							{ label: 'Squadre', value: '36' },
							{ label: 'Finale', value: '30 maggio 2026' },
							{ label: 'Sede finale', value: 'Budapest' },
						],
					}}
				/>
				<InfoBox
					value={{
						type: 'coach',
						title: 'Simone Inzaghi',
						facts: [
							{ label: 'Nazionalità', value: 'Italia 🇮🇹' },
							{ label: 'Età', value: '50 anni' },
							{ label: 'Squadra', value: 'Inter' },
							{ label: 'In carica dal', value: '2021' },
							{ label: 'Trofei con l\'Inter', value: '5' },
						],
					}}
				/>
			</Section>

			{/* ── QUOTE BLOCK ── */}
			<Section title="Quote Block">
				<QuoteBlock
					value={{
						quote: 'Il calcio è l\'unico sport dove si può vincere senza meritare e perdere senza demeriti.',
						author: 'Arrigo Sacchi',
						role: 'Allenatore',
						context: 'Intervista a La Gazzetta dello Sport, 2024',
					}}
				/>
				<QuoteBlock
					value={{
						quote: 'Questa squadra non molla mai. Stasera abbiamo dimostrato che l\'Inter è qui per vincere tutto.',
						author: 'Lautaro Martínez',
						role: 'Attaccante, Inter',
						context: 'Post-partita, dopo la rimonta nel derby',
					}}
				/>
			</Section>

			{/* ── ADMONITION ── */}
			<Section title="Admonition">
				<Admonition
					value={{
						tone: 'note',
						title: 'Nota',
						content: [{ _type: 'block', _key: 'n1', children: [{ _type: 'span', _key: 'n1s', text: 'Tutti i dati statistici sono aggiornati alla giornata 34 di Serie A.' }], markDefs: [] }],
					}}
				/>
				<Admonition
					value={{
						tone: 'tip',
						title: 'Suggerimento',
						content: [{ _type: 'block', _key: 't1', children: [{ _type: 'span', _key: 't1s', text: 'Per seguire le partite in tempo reale, attiva le notifiche push dall\'app.' }], markDefs: [] }],
					}}
				/>
				<Admonition
					value={{
						tone: 'important',
						title: 'Importante',
						content: [{ _type: 'block', _key: 'i1', children: [{ _type: 'span', _key: 'i1s', text: 'Le date delle semifinali di Champions League potrebbero subire variazioni.' }], markDefs: [] }],
					}}
				/>
				<Admonition
					value={{
						tone: 'warning',
						title: 'Attenzione',
						content: [{ _type: 'block', _key: 'w1', children: [{ _type: 'span', _key: 'w1s', text: 'Il calciomercato apre il 1° luglio: tutte le trattative prima di quella data sono solo rumors.' }], markDefs: [] }],
					}}
				/>
				<Admonition
					value={{
						tone: 'caution',
						title: 'Avvertenza',
						content: [{ _type: 'block', _key: 'c1', children: [{ _type: 'span', _key: 'c1s', text: 'Articolo contiene spoiler sulla finale di Coppa Italia.' }], markDefs: [] }],
					}}
				/>
			</Section>

			{/* ── VIDEO EMBED ── */}
			<Section title="Video Embed">
				<VideoEmbed
					value={{
						url: 'https://www.youtube.com/watch?v=EI0XspKsYsc',
						caption: 'Highlights della partita',
						type: 'highlights',
					}}
				/>
				<VideoEmbed
					value={{
						url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
						caption: 'Conferenza stampa pre-partita di Inzaghi',
						type: 'press_conference',
					}}
				/>
			</Section>

			{/* ── SOCIAL EMBED ── */}
			<Section title="Social Embed">
				<Variant label="Twitter/X" props='platform="twitter"' />
				<SocialEmbed
					value={{
						url: 'https://twitter.com/MartinLandaluc/status/2055183943524057169',
						platform: 'twitter',
						caption: 'Post-partita di Landaluce a Roma',
					}}
				/>
				<Variant label="TikTok" props='platform="tiktok"' />
				<SocialEmbed
					value={{
						url: 'https://www.tiktok.com/@sabordefutbol/video/7504974782308102446',
						platform: 'tiktok',
						caption: 'Esempio embed TikTok',
					}}
				/>
				<Variant label="Instagram" props='platform="instagram"' />
				<SocialEmbed
					value={{
						url: 'https://www.instagram.com/p/DJxE4TNNKPK/',
						platform: 'instagram',
						caption: 'Esempio embed Instagram',
					}}
				/>
			</Section>

			{/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
			    SFONDI — TUTTE LE VARIANTI
			    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

			<div className="mx-auto max-w-screen-md">
				<h2 className="text-lg font-bold uppercase tracking-widest text-muted-foreground">
					Sfondi modulo
				</h2>
				<p className="text-sm text-muted-foreground">
					Tutte le opzioni di sfondo disponibili per i moduli — tinte piatte e gradienti.
				</p>
			</div>

			<Section title="Background Options" wide>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{Object.entries(bgClasses)
						.filter(([key]) => key !== 'none')
						.map(([key, classes]) => (
						<div
							key={key}
							className={`relative overflow-hidden rounded-xl border border-line-soft p-6 ${classes}`}
						>
							<div className="space-y-3">
								<span className="inline-block rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/60">
									{key}
								</span>
								<h3 className="text-lg font-bold text-ink">Titolo Sezione</h3>
								<p className="text-sm leading-relaxed text-ink/70">
									Testo di esempio per vedere come appare il contenuto su questo sfondo.
								</p>
								<div className="flex gap-2">
									<span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">
										Serie A
									</span>
									<span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
										Calcio
									</span>
								</div>
							</div>
						</div>
					))}
				</div>
			</Section>

			{/* Full-width background strips */}
			<div className="mx-auto max-w-screen-md">
				<h2 className="text-lg font-bold uppercase tracking-widest text-muted-foreground">
					Sfondi full-bleed
				</h2>
				<p className="text-sm text-muted-foreground">
					Come appaiono a tutta larghezza — simulazione sezione con contenuto reale.
				</p>
			</div>

			{Object.entries(bgClasses)
				.filter(([key]) => key !== 'none')
				.map(([key, classes]) => (
				<div key={key} className={`-mx-4 px-4 py-10 sm:-mx-8 sm:px-8 ${classes}`}>
					<div className="mx-auto max-w-screen-lg">
						<div className="flex items-center justify-between">
							<div>
								<span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
									background: &quot;{key}&quot;
								</span>
								<h3 className="mt-1 text-2xl font-black uppercase tracking-tight text-ink">
									Sezione di esempio
								</h3>
							</div>
							<span className="text-sm font-bold text-accent">Vedi tutte &rarr;</span>
						</div>
						<div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
							{[1, 2, 3, 4].map((i) => (
								<div key={i} className="space-y-2">
									<div className="aspect-video rounded-lg bg-white/5" />
									<div className="h-3 w-3/4 rounded bg-white/10" />
									<div className="h-2 w-1/2 rounded bg-white/5" />
								</div>
							))}
						</div>
					</div>
				</div>
			))}
		</div>
	)
}
