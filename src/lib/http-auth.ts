/**
 * Shared secret-header auth check for cron-style endpoints.
 *
 * Centralizes the duplicated `Bearer / x-cron-secret / ?secret=`
 * pattern that previously lived inline in:
 *   - src/app/api/cron/publish-scheduled/route.ts
 *   - src/app/api/newsletter/sweep/route.ts
 *   - src/app/api/revalidate/route.ts
 *
 * Use as:
 *   isAuthorized(request, process.env.CRON_SECRET, { headers: ['x-cron-secret'] })
 *   isAuthorized(request, process.env.REVALIDATE_SECRET, { headers: ['x-revalidate-secret'] })
 *
 * Always pass `expected` (read from env once per request). Returns false
 * if the env var is unset — failing closed prevents unauthenticated calls
 * when the secret has not been configured yet.
 */

import type { NextRequest } from 'next/server'
import { safeEqual } from './crypto'

export interface IsAuthorizedOptions {
	/**
	 * Additional header names to peek at. The literal `'authorization'`
	 * (Bearer scheme) and the `secret` query param are always checked.
	 */
	headers?: string[]
}

/**
 * Constant-time comparison of a request against `expected`.
 *
 * Returns `false` if:
 * - `expected` is empty/null/undefined.
 * - None of the candidates (Authorization Bearer, custom headers,
 *   `?secret=` query) match.
 *
 * The candidate-checking loop uses `safeEqual`, so timing cannot be
 * used to leak byte-by-byte info about the expected secret.
 */
export function isAuthorized(
	request: NextRequest,
	expected: string | null | undefined,
	options: IsAuthorizedOptions = {},
): boolean {
	if (!expected) return false

	const candidates: Array<string | null | undefined> = []

	const authHeader = request.headers.get('authorization')
	if (authHeader) {
		candidates.push(authHeader.replace(/^Bearer\s+/i, ''))
	}

	for (const name of options.headers ?? []) {
		candidates.push(request.headers.get(name))
	}

	candidates.push(request.nextUrl.searchParams.get('secret'))

	return candidates.some((candidate) => safeEqual(candidate, expected))
}
