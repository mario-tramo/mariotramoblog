import { createClient } from '@sanity/client'
import { projectId, dataset, apiVersion } from '@/sanity/lib/env'
import { dev } from '@/lib/env'

/**
 * Network resilience for the shared Sanity client.
 *
 * `@sanity/client` already retries query requests on transient failures
 * (network/timeout errors, 429 and 5xx). These settings make that behaviour
 * explicit and bounded:
 * - `timeout` fails a hung request fast so it can be retried instead of
 *   blocking the render for an unknown amount of time.
 * - `retryDelay` uses exponential backoff capped at ~4s (±25% jitter) so a
 *   degraded Sanity/CDN outage does not produce a stampede of parallel
 *   retries while keeping the first retries fast.
 */
const REQUEST_TIMEOUT_MS = 10_000
const MAX_RETRIES = 5

function retryDelay(attemptNumber: number): number {
	const backoff = Math.min(150 * 2 ** attemptNumber, 4000)
	const jitter = Math.floor(Math.random() * ((backoff * 0.25) | 0))
	return backoff + jitter
}

export const client = createClient({
	projectId,
	dataset,
	apiVersion,
	useCdn: !dev,
	timeout: REQUEST_TIMEOUT_MS,
	maxRetries: MAX_RETRIES,
	retryDelay,
	stega: {
		studioUrl: '/admin',
	},
})
