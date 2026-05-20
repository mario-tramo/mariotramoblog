import { cookies } from 'next/headers'
import { DEFAULT_LANG, langCookieName } from '@/lib/i18n'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import { groq } from 'next-sanity'
import { IMAGE_QUERY } from '@/sanity/lib/queries'
import moduleProps from '@/lib/moduleProps'
import PostPreview from './blog/PostPreview'
import { cn } from '@/lib/utils'
import { Suspense } from 'react'

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

			<Suspense
				fallback={
					<ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
						{Array.from({ length: limit }).map((_, i) => (
							<li key={i}>
								<PostPreview skeleton />
							</li>
						))}
					</ul>
				}
			>
				<ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
					{posts?.map((post) => (
						<li key={post._id} className="anim-fade">
							<PostPreview post={post} />
						</li>
					))}
				</ul>
			</Suspense>
		</section>
	)
}
