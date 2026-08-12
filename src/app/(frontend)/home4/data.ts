import { DEFAULT_LANG } from '@/lib/i18n'
import { FEED_REVALIDATE_SECONDS } from '@/sanity/lib/cache'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import groq from 'groq'
import { IMAGE_QUERY } from '@/sanity/lib/queries'
import { getPostsFeed } from '@/lib/getPostsFeed'

const POST_PROJECTION = groq`{
	...,
	'title': coalesce(title, metadata.title),
	featured,
	categories[]->,
	authors[]->,
	publishDate,
	language,
	'readTime': round(length(pt::text(body)) / 5 / 180),
	metadata {
		...,
		image { ${IMAGE_QUERY} }
	},
}`

export type Home4Post = Sanity.BlogPost

/** One round-trip pull of the freshest posts for hero and general homepage content. */
export async function getHome4Posts(): Promise<Home4Post[]> {
	const lang = DEFAULT_LANG

	return fetchSanityLive<Home4Post[]>({
		query: groq`
			*[
				_type == 'blog.post'
				&& metadata.noIndex != true
				&& (!defined(language) || language == '${lang}')
			]
			| order(featured desc, publishDate desc)[0...60]${POST_PROJECTION}
		`,
		tags: ['sanity:posts', 'sanity:feed:homepage', 'sanity:feed:latest'],
		revalidate: FEED_REVALIDATE_SECONDS,
	})
}

/**
 * Fetch a category independently from the global homepage feed. Homepage
 * sections must not depend on a fixed global window: a busy football cycle
 * can otherwise push every Tennis (or other sport) post outside `[0...60]`.
 */
export async function getHome4CategoryPosts(
	slug: string,
	limit: number,
): Promise<Home4Post[]> {
	const lang = DEFAULT_LANG

	return fetchSanityLive<Home4Post[]>({
		query: groq`
			*[
				_type == 'blog.post'
				&& metadata.noIndex != true
				&& (!defined(language) || language == '${lang}')
				&& $category in categories[]->slug.current
			]
			| order(publishDate desc)[0...${limit}]${POST_PROJECTION}
		`,
		params: { category: slug },
		tags: [
			'sanity:posts',
			'sanity:feed:homepage',
			'sanity:feed:latest',
			`sanity:category:${slug}`,
		],
		revalidate: FEED_REVALIDATE_SECONDS,
	})
}

/** Top-of-page ticker + hero headlines (strictly chronological). */
export function byRecency(posts: Home4Post[]): Home4Post[] {
	return [...posts].sort((a, b) =>
		new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
	)
}

/** First post with a usable cover image, else the first post. */
export function pickHero(posts: Home4Post[]): Home4Post | undefined {
	return (
		posts.find((p) => p.featured && p.metadata?.image?.asset) ||
		posts.find((p) => p.metadata?.image?.asset) ||
		posts[0]
	)
}

export { getPostsFeed }