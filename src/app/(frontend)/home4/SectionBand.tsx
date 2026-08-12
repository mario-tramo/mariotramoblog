import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ScrollCarousel from '@/ui/primitives/ScrollCarousel'
import PostPreview from '@/ui/modules/blog/PostPreview'
import { cn } from '@/lib/utils'
import type { SectionTheme } from '@/lib/sectionBackgrounds'
import type { Home4Post } from './data'

export default function SectionBand({
	theme,
	kicker,
	title,
	intro,
	href,
	posts,
}: {
	theme: SectionTheme
	kicker: string
	title: string
	intro: string
	href?: string
	posts: Home4Post[]
}) {
	return (
		<section className={cn('relative overflow-hidden', theme.bg)} data-module>
			<div className="mx-auto max-w-screen-2xl px-4 py-14 sm:px-6 md:py-20">
				<div className="grid items-center gap-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
					<header>
						<span
							className="text-[10px] font-black uppercase tracking-[0.22em]"
							style={{ color: theme.accent }}
						>
							{kicker}
						</span>
						<h2 className="mt-2 font-heading text-[26px] uppercase leading-[1.05] tracking-[-0.5px] text-white sm:text-[32px] md:text-[38px]">
							{title}
						</h2>
						<div
							className="mt-[10px] h-[3px] w-12 rounded-full"
							style={{ backgroundColor: theme.accent }}
						/>
						<p className="mt-4 max-w-none text-[13px] leading-[1.55] text-white/65 lg:max-w-[230px]">
							{intro}
						</p>
						{href && (
							<Link
								href={href}
								className="group mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition hover:opacity-85"
								style={{ color: theme.accent }}
							>
								Vedi tutti
								<ArrowRight
									className="size-3.5 transition-transform group-hover:translate-x-1"
									aria-hidden
								/>
							</Link>
						)}
					</header>

					<ScrollCarousel>
						<ul className="carousel gap-3 pb-2 [--size:clamp(210px,44vw,300px)] sm:gap-4 lg:[--size:clamp(200px,17vw,280px)]">
							{posts.map((post) => (
								<li key={post._id} className="anim-fade max-sm:[animation:none]">
									<PostPreview post={post} />
								</li>
							))}
						</ul>
					</ScrollCarousel>
				</div>
			</div>
		</section>
	)
}