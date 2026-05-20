import { cookies } from 'next/headers'
import { DEFAULT_LANG, langCookieName } from '@/lib/i18n'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import { groq } from 'next-sanity'
import { BLOG_DIR } from '@/lib/env'
import Carousel from './Carousel'

export default async function ArticleCarousel({
	limit = 5,
	showFeaturedFirst,
	filteredCategory,
}: Partial<{
	limit: number
	showFeaturedFirst: boolean
	filteredCategory: Sanity.BlogCategory
	nested: boolean
}> &
	Sanity.Module) {
	const lang = (await cookies()).get(langCookieName)?.value ?? DEFAULT_LANG

	const posts = await fetchSanityLive<
		{
			_id: string
			title: string
			description: string | null
			slug: string
			publishDate: string
			imageUrl: string | null
			lqip: string | null
			author: { name: string } | null
			categories: { title: string }[]
		}[]
	>({
		query: groq`
			*[
				_type == 'blog.post'
				${!!lang ? `&& (!defined(language) || language == '${lang}')` : ''}
				${!!filteredCategory ? `&& $filteredCategory in categories[]->._id` : ''}
			]|order(
				${showFeaturedFirst ? 'featured desc, ' : ''}
				publishDate desc
			)[0...${limit}]{
				_id,
				'title': metadata.title,
				'description': metadata.description,
				'slug': '/${BLOG_DIR}/' + metadata.slug.current,
				publishDate,
				'imageUrl': metadata.image.asset->url,
				'lqip': metadata.image.asset->metadata.lqip,
				'author': author->{ name },
				categories[]->{ title },
			}
		`,
		params: {
			filteredCategory: filteredCategory?._id || '',
		},
	})

	if (!posts?.length) return null

	return <Carousel posts={posts} />
}
