/**
 * Cron: publish scheduled Sanity drafts whose `publishAt` has passed.
 *
 * Extracted from `src/app/api/cron/publish-scheduled/route.ts` so the
 * promotion logic is unit-testable: callers pass a Sanity-like client
 * dependency, no I/O. The route handler stays a thin HTTP wrapper that
 * authenticates and calls this function.
 *
 * Workflow:
 *   1. Fetch all drafts whose `publishAt` has passed.
 *   2. Batch every `createOrReplace` + `delete` into a single Sanity
 *      transaction. This turns 2N HTTP round-trips into 1.
 *
 * If the transaction fails the entire batch is rejected atomically.
 * This is acceptable for a daily cron — unprocessed drafts will get
 * picked up on the next run.
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
	client: Pick<SanityClient, 'fetch' | 'transaction'>
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

	const tx = deps.client.transaction()
	let published = 0

	for (const draft of drafts) {
		const publishedId = draft._id.replace('drafts.', '')
		const { publishAt: _publishAt, _id, ...docWithoutSchedule } = draft

		tx.createOrReplace({
			...docWithoutSchedule,
			_id: publishedId,
		})
		tx.delete(draft._id)
		published++

		console.log(`[cron/publish] queued ${publishedId} (${draft._type})`)
	}

	try {
		await tx.commit()
	} catch (err) {
		console.error(
			`[cron/publish] transaction failed for ${drafts.length} drafts:`,
			err,
		)
		return { found: drafts.length, published: 0, errors: drafts.length }
	}

	return { found: drafts.length, published, errors: 0 }
}
