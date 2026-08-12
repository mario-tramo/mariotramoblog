'use server'

import { client } from '@/sanity/lib/client'
import { token } from '@/sanity/lib/token'
import { unstable_cache } from 'next/cache'
import { createHash } from 'node:crypto'
import { defineLive } from 'next-sanity/live'
import type { QueryOptions, QueryParams } from '@sanity/client'
import { buildTags, type CacheDocHint } from './cache'
import { DEFAULT_REVALIDATE_SECONDS } from './cache'
import * as Sentry from '@sentry/nextjs'
import { isPreviewRender } from './preview-context'

/**
 * `defineLive` uses Sanity CDN for published data and the direct API for
 * drafts. The fetch option supplies the missing Next Data Cache policy for
 * every published `sanityFetch` call; preview remains request-time only
 * (`/preview-internal` is `force-dynamic`, so this never caches drafts).
 */
export const { sanityFetch, SanityLive } = defineLive({
	client,
	serverToken: token,
	fetchOptions: { revalidate: DEFAULT_REVALIDATE_SECONDS },
})

/**
 * Fetch a Sanity query through the same cache-aware path as the live wrapper.
 * This is used by route handlers (sitemaps/news feeds) that need a plain data
 * result instead of the `{ data, sourceMap, tags }` response shape.
 */
type SanityFetchInput = {
	query: string
	params?: Partial<QueryParams>
	next?: QueryOptions['next']
}

/**
 * Run a Sanity query inside the Next.js Data Cache (tag-based revalidation).
 * Shared by the route-handler helper and the public Server Component
 * `fetchSanityLive` so both honour the same freshness/tag policy.
 */
async function fetchCached<T>({
	query,
	params = {},
	tags = [],
	revalidate = DEFAULT_REVALIDATE_SECONDS,
}: {
	query: string
	params?: Partial<QueryParams>
	tags: string[]
	revalidate?: number | false
}): Promise<T> {
	const key = createHash('sha256')
		.update(JSON.stringify({ query, params, tags, revalidate }))
		.digest('hex')

	const getCached = unstable_cache(
		async () => client.fetch<T>(query, params, {
			perspective: 'published',
			useCdn: true,
		}),
		['sanity-query', key],
		{ revalidate, tags },
	)

	return getCached()
}

/** Fetch published content only, without reading request cookies or draft mode. */
export async function fetchSanityPublic<T = unknown>(input: SanityFetchInput) {
	try {
		return await fetchCached<T>({
			query: input.query,
			params: input.params,
			tags: buildTags(undefined, input.next?.tags),
			revalidate: input.next?.revalidate ?? DEFAULT_REVALIDATE_SECONDS,
		})
	} catch (err) {
		console.error('[fetchSanityPublic] query failed:', err)
		Sentry.captureException(err, {
			tags: { domain: 'sanity', operation: 'fetchSanityPublic' },
			extra: { query: input.query, params: input.params },
		})
		throw err
	}
}

/**
 * Backwards-compatible alias for published route-handler queries. Keep one
 * implementation so RSS/sitemaps cannot drift to a different cache policy.
 */
export const fetchSanity = fetchSanityPublic

/**
 * Cache-aware published Sanity query helper used by frontend Server
 * Components. It never reads cookies, headers, or draft mode, so using it in
 * the public tree does not opt the page out of ISR/CDN caching.
 *
 * Feed/frontpage queries should pass `revalidate: FEED_REVALIDATE_SECONDS`
 * so newly published articles appear quickly even when the webhook misses;
 * everything else keeps the safer default.
 *
 * Draft/visual editing remains available through `sanityFetch` with an
 * explicit `perspective: 'drafts'` in a dedicated preview-only path; it is
 * deliberately not mixed into public rendering.
 */
export async function fetchSanityLive<T = unknown>(
	args: Parameters<typeof sanityFetch>[0] & {
		cacheHint?: CacheDocHint
		revalidate?: number
	},
) {
	try {
		const { cacheHint, tags: extra, revalidate, ...rest } = args
		const tags = buildTags(cacheHint, extra)
		if (isPreviewRender()) {
			const { data } = await sanityFetch({
				query: rest.query,
				params: rest.params ?? {},
				perspective: 'drafts',
				stega: true,
				tags,
			})
			return data as T
		}

		return await fetchCached<T>({
			query: rest.query,
			params: rest.params,
			tags,
			revalidate: revalidate ?? DEFAULT_REVALIDATE_SECONDS,
		})
	} catch (err) {
		console.error('[fetchSanityLive] query failed:', err)
		Sentry.captureException(err, {
			tags: { domain: 'sanity', operation: 'fetchSanityLive' },
			extra: { args },
		})
		throw err
	}
}
