import { redis } from './redis'

const VIEWS_KEY = 'post:views'

/** Increment view count for a post slug */
export async function trackView(slug: string): Promise<number> {
	if (!redis) return 0
	return redis.zincrby(VIEWS_KEY, 1, slug)
}

/** Get the top N slugs by views */
export async function getTopSlugs(limit: number): Promise<string[]> {
	if (!redis) return []
	return redis.zrange(VIEWS_KEY, 0, limit - 1, { rev: true })
}

/** Get view count for a single slug */
export async function getViews(slug: string): Promise<number> {
	if (!redis) return 0
	return (await redis.zscore(VIEWS_KEY, slug)) ?? 0
}
