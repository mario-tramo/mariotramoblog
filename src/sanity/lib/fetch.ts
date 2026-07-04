'use server'

import { client } from '@/sanity/lib/client'
import { token } from '@/sanity/lib/token'
import { dev } from '@/lib/env'
import { draftMode } from 'next/headers'
import { defineLive } from 'next-sanity/live'
import type { QueryOptions, QueryParams } from '@sanity/client'
import { buildTags, type CacheDocHint } from './cache'
import * as Sentry from '@sentry/nextjs'

/**
 * Direct Sanity client fetch.
 *
 * NOTE: `client.fetch` does NOT participate in Next.js Data Cache because
 * @sanity/client uses its own HTTP transport (not Next's `fetch()` wrapper).
 * Pass an explicit `tags` array — `unstable_cache` is now used to wrap the
 * call when `revalidate > 0` is set, so the result is cached and purgeable.
 */
export async function fetchSanity<T = unknown>({
	query,
	params = {},
	next,
}: {
	query: string
	params?: Partial<QueryParams>
	next?: QueryOptions['next']
}) {
	const preview = dev || (await draftMode()).isEnabled

	try {
		return await client.fetch<T>(
			query,
			params,
			preview
				? {
						stega: true,
						perspective: 'drafts',
						useCdn: false,
						token,
						next: {
							revalidate: 0,
							...next,
							tags: ['sanity', ...(next?.tags ?? [])],
						},
					}
				: {
						perspective: 'published',
						useCdn: true,
						next: {
							revalidate: 3600,
							...next,
							tags: ['sanity', ...(next?.tags ?? [])],
						},
					},
		)
	} catch (err) {
		const previewLabel = preview ? ' (preview)' : ''
		console.error(`[fetchSanity${previewLabel}] query failed:`, err)
		Sentry.captureException(err, {
			tags: { domain: 'sanity', operation: 'fetchSanity' },
			extra: { query, params, preview },
		})
		throw err
	}
}

export const { sanityFetch, SanityLive } = defineLive({
	client,
	serverToken: token,
})

/**
 * next-sanity `sanityFetch` already participates in Next.js Data Cache.
 * We enrich the `tags` array with granular ones (`sanity:type:*`,
 * `sanity:slug:*`, `sanity:doc:*`) so purges can be surgical.
 *
 * Pass `cacheHint: { type, id?, slug? }` when you know the document
 * shape — the runtime never inspects results to derive these, the
 * caller is the source of truth.
 */
export async function fetchSanityLive<T = unknown>(
	args: Parameters<typeof sanityFetch>[0] & { cacheHint?: CacheDocHint },
) {
	const preview = dev || (await draftMode()).isEnabled

	try {
		const { cacheHint, tags: extra, ...rest } = args
		const tags = buildTags(cacheHint, extra)

		const { data } = await sanityFetch({
			...rest,
			perspective: preview ? 'drafts' : 'published',
			tags,
		})

		return data as T
	} catch (err) {
		const previewLabel = preview ? ' (preview)' : ''
		console.error(`[fetchSanityLive${previewLabel}] query failed:`, err)
		Sentry.captureException(err, {
			tags: { domain: 'sanity', operation: 'fetchSanityLive' },
			extra: { args, preview },
		})
		throw err
	}
}
