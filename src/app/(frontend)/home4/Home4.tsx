import {
	getHome4Posts,
	getHome4CategoryPosts,
	getPostsFeed,
	pickHero,
	byRecency,
} from './data'
import { getSectionTheme } from '@/lib/sectionBackgrounds'
import { getCategoryColor } from '@/lib/categoryColors'
import { HomepageSeoFooter } from '@/ui/modules/HomepageSeo'
import LiveTicker from './LiveTicker'
import SportNav, { type NavItem } from './SportNav'
import Hero from './Hero'
import SectionBand from './SectionBand'
import MostRead from './MostRead'
import SportMatrix, { type MatrixItem } from './SportMatrix'
import NewsletterBand from './NewsletterBand'
import type { Home4Post } from './data'

const NAV: NavItem[] = [
	{ label: 'Home', href: '/home4', accent: '#00AEEF' },
	{ label: 'Calcio', href: '/calcio' },
	{ label: 'Calciomercato', href: '/calciomercato' },
	{ label: 'Serie A', href: '/serie-a' },
	{ label: 'Champions', href: '/champions-league' },
	{ label: 'Fantacalcio', href: '/fantacalcio' },
	{ label: 'Formula 1', href: '/formula-1' },
	{ label: 'MotoGP', href: '/motogp' },
	{ label: 'Tennis', href: '/tennis' },
	{ label: 'Basket', href: '/basket' },
	{ label: 'Ciclismo', href: '/ciclismo' },
	{ label: 'Calcio Estero', href: '/calcio-estero' },
	{ label: 'Opinioni', href: '/opinioni' },
].map((item) => ({
	...item,
	accent:
		item.accent ??
		getCategoryColor({ slug: { current: item.href.replace('/', '') } }),
}))

export default async function Home4() {
	const [all, trending, calcio, mercato, formula1, tennis, basket, opinioni] =
		await Promise.all([
			getHome4Posts(),
			getPostsFeed({ source: 'trending', limit: 5 }),
			getHome4CategoryPosts('calcio', 8),
			getHome4CategoryPosts('calciomercato', 8),
			getHome4CategoryPosts('formula-1', 3),
			getHome4CategoryPosts('tennis', 3),
			getHome4CategoryPosts('basket', 3),
			getHome4CategoryPosts('opinioni', 3),
		])

	const latest = byRecency(all)
	const hero = pickHero(all)
	const featured = latest.filter((p) => p.featured)
	const picks = latest.filter((p) => !p.featured).slice(0, 4)

	const matrixItems: MatrixItem[] = [
		{
			theme: getSectionTheme('formula 1')!,
			kicker: 'Pista & box',
			title: 'Formula 1',
			href: '/formula-1',
			posts: formula1,
		},
		{
			theme: getSectionTheme('tennis')!,
			kicker: 'Rete & rimbalzo',
			title: 'Tennis',
			href: '/tennis',
			posts: tennis,
		},
		{
			theme: getSectionTheme('basket')!,
			kicker: 'Parquet',
			title: 'Basket',
			href: '/basket',
			posts: basket,
		},
		{
			theme: getSectionTheme('opinioni')!,
			kicker: 'Punto di vista',
			title: 'Opinioni',
			href: '/opinioni',
			posts: opinioni,
		},
	].filter((m) => m.posts.length > 0)

	return (
		<>
			<h1 className="sr-only">
				TRM Sport — Analisi, notizie, risultati e fantacalcio in tempo reale
			</h1>

			<LiveTicker posts={latest.slice(0, 12)} />
			<SportNav items={NAV} />

			{hero && (
				<Hero hero={hero} latest={latest} />
			)}

			<InEvidenza featured={featured} latest={latest} />

			{calcio.length > 0 && (
				<SectionBand
					theme={getSectionTheme('calcio')!}
					kicker="Il nostro canale principale"
					title="Calcio"
					intro="Risultati, analisi tattiche e approfondimenti dalla Serie A al calcio internazionale."
					href="/calcio"
					posts={calcio}
				/>
			)}

			{(trending.length > 0 || picks.length > 0) && (
				<MostRead trending={trending} picks={picks} />
			)}

			{mercato.length > 0 && (
				<SectionBand
					theme={getSectionTheme('calciomercato')!}
					kicker="Trattative & voci"
					title="Calciomercato"
					intro="Tutte le trattative, le voci e gli aggiornamenti di mercato dal vivo."
					href="/calciomercato"
					posts={mercato}
				/>
			)}

			{matrixItems.length > 0 && <SportMatrix items={matrixItems} />}

			<NewsletterBand />

			<HomepageSeoFooter />
		</>
	)
}

function InEvidenza({
	featured,
	latest,
}: {
	featured: Home4Post[]
	latest: Home4Post[]
}) {
	const theme = getSectionTheme('in evidenza')
	if (!theme) return null

	// Featured-first, fallback to recency so the band never renders empty.
	const posts = (featured.length >= 5 ? featured : latest).slice(0, 8)

	return (
		<div className="mt-5">
			<SectionBand
				theme={theme}
				kicker="I pezzi forti della redazione"
				title="In evidenza"
				intro="Gli articoli e le storie più importanti del momento, scelti dalla nostra redazione."
				posts={posts}
			/>
		</div>
	)
}