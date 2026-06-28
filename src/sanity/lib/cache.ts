/**
 * Sanity cache tag composer.
 *
 * The Next.js Data Cache layer is wired directly via:
 *   - `fetchSanityLive(...)` in `src/sanity/lib/fetch.ts` (next-sanity + cacheHint)
 *   - inline `unstable_cache` wrappers where callers need them.
 *
 * This module is now *pure*: it composes the granular tag set a caller
 * should attach to its cache entry. It also exposes `tagsForDocument()`
 * so `/api/revalidate` can auto-derive the right tags when a Sanity
 * webhook sends the full document payload (instead of pre-computed tags).
 *
 * Pair with `/api/revalidate` (extended to accept `tags: string[]` OR a
 * `document: { _type, _id, slug }` payload).
 */

/** Per-document hint used to derive granular cache tags. */
export type CacheDocHint = {
	type?: string | null
	id?: string | null
	slug?: string | null
}

const BASE_TAG = 'sanity'

/**
 * Compose the granular tag set for a single cache entry.
 *
 * Always includes the `'sanity'` global tag as a failsafe flush target.
 * Adds `sanity:type:<t>` / `sanity:doc:<id>` / `sanity:slug:<slug>`
 * whenever the caller knows the document shape, and merges any
 * caller-provided `extra` tags (e.g. `category:calcio`, `site-config`).
 *
 * Returns a stable, de-duplicated array (Set semantics, then Array.from).
 */
export function buildTags(
	hint: CacheDocHint | undefined,
	extra: string[] | undefined,
): string[] {
	const tags = new Set<string>([BASE_TAG])
	if (hint?.type) tags.add(`sanity:type:${hint.type}`)
	if (hint?.id) tags.add(`sanity:doc:${hint.id}`)
	if (hint?.slug) tags.add(`sanity:slug:${hint.slug}`)
	for (const t of extra ?? []) {
		if (typeof t === 'string' && t.trim().length > 0) tags.add(t)
	}
	return Array.from(tags)
}

/**
 * Tag set that should accompany a Sanity webhook revalidation payload.
 *
 * Used by `/api/revalidate` when the webhook GROQ projection returns the
 * whole document (`_type`, `_id`, `slug`) instead of pre-computed tags.
 * Server-side derivation keeps the GROQ projection short and avoids
 * duplication of tag composition logic between client and server.
 *
 * Note: this function does NOT add `'sanity'` (the route handler always
 * flushes the global tag regardless). It returns only the granular tags.
 */
export function tagsForDocument(doc: {
	_type?: string | null
	_id?: string | null
	slug?: string | null
}): string[] {
	const tags = new Set<string>()
	if (doc._type) tags.add(`sanity:type:${doc._type}`)
	if (doc._id) tags.add(`sanity:doc:${doc._id}`)
	if (doc.slug) tags.add(`sanity:slug:${doc.slug}`)
	return Array.from(tags)
}
