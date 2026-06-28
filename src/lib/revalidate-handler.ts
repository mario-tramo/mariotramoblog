/**
 * Pure revalidation logic for `/api/revalidate`.
 *
 * The HTTP route handler stays a thin shell that authenticates and
 * passes parsed JSON to `processRevalidation()`. This function is the
 * single source of truth for:
 *   - which tags get flushed (always the global `'sanity'`, plus any
 *     granular tags from `body.tags` and/or derived from `body.document`)
 *   - which paths get revalidated (always `/` for layout shell, plus
 *     any caller-supplied `path` / `paths[]` that begin with `/`)
 *
 * Re-validation side effects (`revalidateTag`, `revalidatePath`) are
 * injected so unit tests can verify the decision logic without
 * touching Next.js cache state.
 */

import { tagsForDocument } from '@/sanity/lib/cache'

export interface RevalidatePayload {
	path?: string
	paths?: string[]
	tags?: string[]
	document?: {
		_type?: string | null
		_id?: string | null
		slug?: string | null
	}
}

/**
 * Subset of Next.js 16 revalidation signatures.
 *
 * `revalidateTag` in Next 16 takes a REQUIRED `profile` argument that is
 * either a string cache profile name or a `CacheLifeConfig`-shaped
 * object (with numeric fields like `stale`, `revalidate`, `expire`).
 *
 * We declare profile as a structural index signature so any
 * CacheLifeConfig variant from Next is assignable. Profile is required
 * to match Next's contravariance — an optional `profile?` here would
 * be too permissive (any caller could omit it, but the real
 * `revalidateTag` requires a value).
 */
export interface RevalidateDeps {
	revalidateTag: (
		tag: string,
		profile: string | { [key: string]: number | undefined },
	) => void
	revalidatePath: (path: string, type?: 'layout' | 'page') => void
}

export interface RevalidateOutcome {
	flushedTags: string[]
	paths: string[]
}

const BASE_TAG = 'sanity'

/**
 * Compute the tag set to flush from arbitrary caller payloads.
 *
 * Merges explicit `tags[]` with `tagsForDocument()` derived from
 * `document`, dedupes, and always appends the global BASE_TAG.
 */
function deriveTagsToFlush(payload: RevalidatePayload): string[] {
	const set = new Set<string>()

	for (const t of payload.tags ?? []) {
		if (typeof t === 'string' && t.length > 0) set.add(t)
	}

	if (payload.document) {
		for (const t of tagsForDocument(payload.document)) set.add(t)
	}

	set.add(BASE_TAG)
	return Array.from(set)
}

/**
 * Filter `path` + `paths[]` to only the values that start with `/`.
 * Returns an array in source order: `path` first, then `paths`.
 */
function normalisePaths(payload: RevalidatePayload): string[] {
	const out: string[] = []
	if (typeof payload.path === 'string' && payload.path.startsWith('/')) {
		out.push(payload.path)
	}
	if (Array.isArray(payload.paths)) {
		for (const p of payload.paths) {
			if (typeof p === 'string' && p.startsWith('/') && !out.includes(p)) {
				out.push(p)
			}
		}
	}
	return out
}

/**
 * Trigger revalidation per the payload and return the lists that were
 * flushed (for logging + JSON response).
 */
export function processRevalidation(
	payload: RevalidatePayload,
	deps: RevalidateDeps,
): RevalidateOutcome {
	const flushedTags = deriveTagsToFlush(payload)

	for (const tag of flushedTags) {
		// `{ expire: 0 }` forces immediate expiration (full invalidation,
		// no stale-while-revalidate window) — required by Next 16 semantics.
		deps.revalidateTag(tag, { expire: 0 })
	}

	// Layout shell refresh in case the doc affects global chrome
	// (header, footer, site-wide modules).
	deps.revalidatePath('/', 'layout')

	const paths = normalisePaths(payload)
	for (const path of paths) {
		deps.revalidatePath(path)
	}

	return {
		flushedTags,
		paths: ['/', ...paths],
	}
}
