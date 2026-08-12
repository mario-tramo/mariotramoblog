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

/**
 * One round-trip pull of the freshest posts (featured first). Grouping by
 * category, hero picks, etc. happen in JS so every section stays in sync
 * with the same snapshot.
 */
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

export function postsInCategory(
	posts: Home4Post[],
	slug: string,
	limit: number,
): Home4Post[] {
	const match = posts.filter(
		(p) => p.categories?.some((c) => c.slug?.current === slug),
	)
	return match.slice(0, limit)
}

export { getPostsFeed }