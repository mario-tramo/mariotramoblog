import type { Metadata } from 'next'
import {
	getHome4Posts,
	getHome4CategoryPosts,
	getPostsFeed,
	pickHero,
	byRecency,
} from '@/app/(frontend)/home4/data'
import Hero from '@/app/(frontend)/home4/Hero'
import SectionBand from '@/app/(frontend)/home4/SectionBand'
import MostRead from '@/app/(frontend)/home4/MostRead'
import SportMatrix, { type MatrixItem } from '@/app/(frontend)/home4/SportMatrix'
import NewsletterBand from '@/app/(frontend)/home4/NewsletterBand'
import LiveTicker from '@/app/(frontend)/home4/LiveTicker'
import SportNav, { type NavItem } from '@/app/(frontend)/home4/SportNav'
import { getSectionTheme } from '@/lib/sectionBackgrounds'
import { HomepageSeoFooter } from '@/ui/modules/HomepageSeo'
import type { Home4Post } from '@/app/(frontend)/home4/data'

export const revalidate = 3600

export const metadata: Metadata = {
	title: 'Home 7',
	description:
		'TRM Sport — tutte le notizie e gli approfondimenti sportivi in un unico posto.',
	robots: { index: false, follow: false },
}

const NAV: NavItem[] = [
	{ label: 'Home', href: '/home7', accent: '#00AEEF' },
	{ label: 'Calcio', href: '/calcio' },
	{ label: 'Calciomercato', href: '/calciomercato' },
	{ label: 'Serie A', href: '/serie-a' },
	{ label: 'Champions', href: '/champions-league' },
	{ label: 'Fantacalcio', href: '/fantacalcio' },
	{ label: 'Formula 1', href: '/formula-1' },
	{ label: 'MotoGP', href: '/motogp' },
	{ label: 'Tennis', href: '/tennis' },
	{ label: 'Basket', href: '/basket' },
	{ label: 'Opinioni', href: '/opinioni' },
]

const SECTIONS = [
	{
		id: 'calcio',
		title: 'Calcio',
		kicker: 'Il nostro canale principale',
		intro:
			'Tutte le notizie, i risultati e gli approfondimenti dal mondo del calcio.',
		href: '/calcio',
	},
	{
		id: 'in-evidenza',
		title: 'In evidenza',
		kicker: 'I pezzi forti della redazione',
		intro: 'Gli articoli e le storie più importanti del momento.',
	},
	{
		id: 'calciomercato',
		title: 'Calciomercato',
		kicker: 'Trattative & voci',
		intro: 'Tutte le trattative, le voci e gli aggiornamenti di mercato.',
		href: '/calciomercato',
	},
] as const

function postsForSection(
	posts: Home4Post[],
	id: string,
	categoryPosts: Record<string, Home4Post[]>,
) {
	if (id === 'in-evidenza') {
		const featured = posts.filter((post) => post.featured)
		return (featured.length > 0 ? featured : byRecency(posts)).slice(0, 8)
	}

	return categoryPosts[id] ?? []
}

function Home7Sections({
	posts,
	categoryPosts,
}: {
	posts: Home4Post[]
	categoryPosts: Record<string, Home4Post[]>
}) {
	return (
		<>
			{SECTIONS.map((section) => {
				const sectionPosts = postsForSection(posts, section.id, categoryPosts)
				const theme = getSectionTheme(section.title)

				if (!theme || sectionPosts.length === 0) return null

				return (
					<section key={section.id} id={section.id} className="scroll-mt-24">
						<SectionBand
							theme={theme}
							kicker={section.kicker}
							title={section.title}
							intro={section.intro}
							href={'href' in section ? section.href : undefined}
							posts={sectionPosts}
						/>
					</section>
				)
			})}
		</>
	)
}

function Home7Sports({
	categoryPosts,
}: {
	categoryPosts: Record<string, Home4Post[]>
}) {
	const sports: MatrixItem[] = [
		{
			theme: getSectionTheme('formula 1')!,
			kicker: 'Pista & box',
			title: 'Formula 1',
			href: '/formula-1',
			posts: categoryPosts['formula-1'] ?? [],
		},
		{
			theme: getSectionTheme('tennis')!,
			kicker: 'Rete & rimbalzo',
			title: 'Tennis',
			href: '/tennis',
			posts: categoryPosts.tennis ?? [],
		},
		{
			theme: getSectionTheme('basket')!,
			kicker: 'Parquet',
			title: 'Basket',
			href: '/basket',
			posts: categoryPosts.basket ?? [],
		},
		{
			theme: getSectionTheme('opinioni')!,
			kicker: 'Punto di vista',
			title: 'Opinioni',
			href: '/opinioni',
			posts: categoryPosts.opinioni ?? [],
		},
	].filter((item) => item.posts.length > 0)

	return sports.length > 0 ? <SportMatrix items={sports} /> : null
}

export default async function Home7Page() {
	const categorySlugs = [
		'calcio',
		'calciomercato',
		'formula-1',
		'tennis',
		'basket',
		'opinioni',
	] as const
	const [allPosts, trending, ...categoryResults] = await Promise.all([
		getHome4Posts(),
		getPostsFeed({ source: 'trending', limit: 5 }),
		...categorySlugs.map((slug) => getHome4CategoryPosts(slug, 8)),
	])
	const categoryPosts = Object.fromEntries(
		categorySlugs.map((slug, index) => [slug, categoryResults[index]]),
	) as Record<string, Home4Post[]>

	const posts = byRecency(allPosts)
	const hero = pickHero(allPosts)
	const picks = posts.filter((post) => !post.featured).slice(0, 4)

	return (
		<div className="home7 overflow-hidden bg-canvas text-ink">
			<h1 className="sr-only">
				TRM Sport — analisi, notizie e approfondimenti sportivi
			</h1>

			{/* Header completo e responsive: arriva dal layout condiviso del sito. */}
			<LiveTicker posts={posts.slice(0, 12)} />
			<SportNav items={NAV} />
			{hero && <Hero hero={hero} latest={posts} />}

			<Home7Sections posts={posts} categoryPosts={categoryPosts} />

			{(trending.length > 0 || picks.length > 0) && (
				<MostRead trending={trending} picks={picks} />
			)}

			<Home7Sports categoryPosts={categoryPosts} />
			<NewsletterBand />
			<HomepageSeoFooter />
		</div>
	)
}

