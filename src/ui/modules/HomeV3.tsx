import { Suspense } from 'react'
import BlogList from '@/app/(frontend)/home6/BlogList6'
import ArticleCarousel from './ArticleCarousel'
import { cn } from '@/lib/utils'

type HomeSection = {
	title: string
	category?: string
	bg: string
}

const SECTIONS: HomeSection[] = [
	{ title: 'In Evidenza', bg: 'bg-section-in-evidenza' },
	{ title: 'Calcio', category: 'calcio', bg: 'bg-section-calcio' },
	{ title: 'Calciomercato', category: 'calciomercato', bg: 'bg-section-calciomercato' },
	{ title: 'Formula 1', category: 'formula-1', bg: 'bg-section-formula-1' },
	{ title: 'Tennis', category: 'tennis', bg: 'bg-section-tennis' },
	{ title: 'Basket', category: 'basket', bg: 'bg-section-basket' },
	{ title: 'Opinioni', category: 'opinioni', bg: 'bg-section-opinioni' },
]

export default async function HomeV3() {
	return (
		<div className="space-y-8">
			<h1 className="sr-only">
				TRM Sport — Analisi, Notizie e Fantacalcio in tempo reale
			</h1>

			{/* Cinematic featured carousel */}
			<Suspense fallback={<HeroSkeleton />}>
				<ArticleCarousel _type="article-carousel" _key="home3-hero" limit={5} />
			</Suspense>

			{/* Full-bleed premium themed bands */}
			{SECTIONS.map(({ title, category, bg }) => (
				<div key={title} className={cn(bg, 'w-full')}>
					<div className="section-full py-10 md:py-16">
						<Suspense fallback={<SectionSkeleton />}>
							<BlogList
								_type="blog-list"
								_key={`home3-${title}`}
								title={title}
								category={category}
								layout="carousel"
								limit={6}
								nested
							/>
						</Suspense>
					</div>
				</div>
			))}
		</div>
	)
}

function HeroSkeleton() {
	return (
		<div className="section !pt-2 !pb-4 md:!pt-2 md:!pb-8">
			<div className="animate-pulse aspect-[21/9] rounded-2xl bg-white/10" />
		</div>
	)
}

function SectionSkeleton() {
	return (
		<div className="flex items-center gap-6">
			<div className="hidden w-[200px] shrink-0 md:block">
				<div className="animate-pulse h-7 w-32 rounded bg-white/10" />
				<div className="animate-pulse mt-4 h-3 w-full max-w-[150px] rounded bg-white/10" />
				<div className="animate-pulse mt-2 h-3 w-24 rounded bg-white/10" />
			</div>
			<div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
				{[...Array(6)].map((_, i) => (
					<div key={i} className="animate-pulse aspect-[1.35/1] rounded-[5px] bg-white/10" />
				))}
			</div>
		</div>
	)
}