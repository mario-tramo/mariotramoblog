import { cookies } from 'next/headers'
import { DEFAULT_LANG, langCookieName } from '@/lib/i18n'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import { groq } from 'next-sanity'
import { IMAGE_QUERY } from '@/sanity/lib/queries'
import moduleProps from '@/lib/moduleProps'
import PostPreview from './blog/PostPreview'
import { cn } from '@/lib/utils'
import { Suspense } from 'react'
import ScrollCarousel from '@/ui/primitives/ScrollCarousel'

export default async function LatestNews({
	title,
	limit = 6,
	nested,
	...props
}: Partial<{
	title: string
	limit: number
	nested: boolean
}> &
	Sanity.Module) {
	const lang = (await cookies()).get(langCookieName)?.value ?? DEFAULT_LANG

	const posts = await fetchSanityLive<Sanity.BlogPost[]>({
		query: groq`
			*[
				_type == 'blog.post'
				${!!lang ? `&& (!defined(language) || language == '${lang}')` : ''}
			]|order(publishDate desc)[0...${limit}]{
				...,
				'title': coalesce(title, metadata.title),
				categories[]->,
				authors[]->,
				metadata{
					...,
					image { ${IMAGE_QUERY} }
				}
			}
		`,
	})

	return (
		<section className={cn(!nested && 'section', 'space-y-6')} {...moduleProps(props)}>
			{title && (
				<header className="border-b-2 border-ink/10 pb-3">
					<h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
						{title}
					</h2>
				</header>
			)}

			<ScrollCarousel>
				<Suspense
					fallback={
						<ul className="carousel max-xl:full-bleed md:overflow-fade-r pb-4 max-xl:px-4 [--size:320px]">
							{Array.from({ length: limit }).map((_, i) => (
								<li key={i}>
									<PostPreview skeleton />
								</li>
							))}
						</ul>
					}
				>
					<ul className="carousel max-xl:full-bleed md:overflow-fade-r pb-4 max-xl:px-4 gap-4 [--size:320px]">
						{posts?.map((post) => (
							<li key={post._id} className="anim-fade">
								<PostPreview post={post} />
							</li>
						))}
					</ul>
				</Suspense>
			</ScrollCarousel>
		</section>
	)
}
