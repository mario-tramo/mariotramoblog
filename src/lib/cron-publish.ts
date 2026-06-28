/**
 * Cron: publish scheduled Sanity drafts whose `publishAt` has passed.
 *
 * Extracted from `src/app/api/cron/publish-scheduled/route.ts` so the
 * promotion logic is unit-testable: callers pass a Sanity-like client
 * dependency, no I/O. The route handler stays a thin HTTP wrapper that
 * authenticates and calls this function.
 *
 * Workflow per draft:
 *   1. Compute `publishedId = drafts.<id>` → `<id>` (drop the prefix).
 *   2. Strip `publishAt` + `_id` from the draft payload, then
 *      `createOrReplace` with the published-destination _id.
 *      (Sanity stores scheduled content as drafts in `drafts.**`; this
 *      promotes it into the published namespace atomically.)
 *   3. Delete the draft pointer.
 *
 * Failures in step 2/3 for a single document do NOT abort the batch;
 * they're counted in `errors` and the loop continues for the rest.
 */

import type { SanityClient } from '@sanity/client'

/** GROQ query used to find drafts whose publishAt is in the past. */
export const SCHEDULED_DRAFTS_QUERY = `*[
	_id in path("drafts.**") &&
	defined(publishAt) &&
	publishAt <= now()
]`

interface ScheduledDraft {
	_id: string
	_type: string
	publishAt: string
	[key: string]: unknown
}

/** Minimal Sanity client surface that this function uses. */
export interface PublishDeps {
	client: Pick<SanityClient, 'fetch' | 'createOrReplace' | 'delete'>
}

/** Result returned to the route handler for logging + JSON response. */
export interface PublishResult {
	found: number
	published: number
	errors: number
}

/**
 * Promote every draft matching `SCHEDULED_DRAFTS_QUERY`.
 *
 * Returns counts only — never throws. Callers should log the result.
 */
export async function publishScheduledDrafts(
	deps: PublishDeps,
): Promise<PublishResult> {
	const drafts = (await deps.client.fetch<ScheduledDraft[]>(
		SCHEDULED_DRAFTS_QUERY,
	)) ?? []

	if (drafts.length === 0) {
		return { found: 0, published: 0, errors: 0 }
	}

	let published = 0
	let errors = 0

	for (const draft of drafts) {
		const publishedId = draft._id.replace('drafts.', '')

		try {
			const { publishAt: _publishAt, _id, ...docWithoutSchedule } = draft
			await deps.client.createOrReplace({
				...docWithoutSchedule,
				_id: publishedId,
			})
			await deps.client.delete(draft._id)

			published++
			console.log(`[cron/publish] published ${publishedId} (${draft._type})`)
		} catch (err) {
			errors++
			console.error(`[cron/publish] failed ${publishedId}:`, err)
		}
	}

	return { found: drafts.length, published, errors }
}
